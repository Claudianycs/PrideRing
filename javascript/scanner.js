// scanner.js - PRiDeRing MVP
// Responsável por reconhecer uma tag NFC, localizar a conta dona do anel
// no banco de dados e encaminhar o usuário ao perfil público correspondente.

document.addEventListener("DOMContentLoaded", () => {
    const scanButton = document.getElementById("scannerButton");
    const simulateButton = document.getElementById("simulateScannerButton");
    const cancelButton = document.getElementById("cancelScannerButton");

    scanButton?.addEventListener("click", startScanner);
    simulateButton?.addEventListener("click", simulateScanner);
    cancelButton?.addEventListener("click", stopScanner);

    if (!("NDEFReader" in window)) {
        simulateButton?.classList.remove("hidden");
        setScannerStatus(
            "NFC indisponível",
            "Este navegador não oferece suporte à Web NFC. Use a simulação para testar o MVP."
        );
    }
});

let scannerController = null;
let scannerActive = false;

async function startScanner() {
    clearScannerMessage();

    if (!("NDEFReader" in window)) {
        setScannerStatus(
            "NFC indisponível",
            "Use a simulação para demonstrar o reconhecimento do PRiDeRing."
        );

        document
            .getElementById("simulateScannerButton")
            ?.classList.remove("hidden");

        showScannerMessage(
            "A Web NFC não está disponível neste navegador.",
            "warning"
        );

        return;
    }

    try {
        scannerController = new AbortController();
        scannerActive = true;

        setScannerButtonState(true);

        setScannerStatus(
            "Aguardando aproximação",
            "Aproxime o PRiDeRing da parte traseira do celular."
        );

        const reader = new NDEFReader();

        await reader.scan({
            signal: scannerController.signal
        });

        reader.addEventListener("readingerror", () => {
            scannerActive = false;
            setScannerButtonState(false);

            setScannerStatus(
                "Falha na leitura",
                "Afaste o anel e tente aproximá-lo novamente."
            );

            showScannerMessage(
                "Não foi possível reconhecer a tag NFC.",
                "error"
            );
        });

        reader.addEventListener("reading", event => {
            const result = createScannerResult(event);

            scannerActive = false;
            setScannerButtonState(false);

            resolveAndShow(result);
        });

    } catch (error) {
        scannerActive = false;
        setScannerButtonState(false);

        if (error.name === "AbortError") {
            setScannerStatus(
                "Leitura cancelada",
                "Toque no botão para iniciar uma nova leitura."
            );

            return;
        }

        console.error("Erro ao iniciar o scanner NFC:", error);

        setScannerStatus(
            "Não foi possível iniciar",
            "Verifique se o NFC está ativo e se a permissão foi concedida."
        );

        document
            .getElementById("simulateScannerButton")
            ?.classList.remove("hidden");

        showScannerMessage(
            "Falha ao acessar o NFC neste dispositivo.",
            "error"
        );
    }
}

function stopScanner() {
    if (scannerController && scannerActive) {
        scannerController.abort();
    }

    scannerActive = false;
    scannerController = null;

    setScannerButtonState(false);

    setScannerStatus(
        "Leitura cancelada",
        "Toque em reconhecer NFC para tentar novamente."
    );
}

async function simulateScanner() {
    clearScannerMessage();

    const session = await getSession();
    let serialNumber = generateScannerId();

    if (session) {
        const { data: ownTag } = await supabaseClient
            .from("nfc_tags")
            .select("serial_number")
            .eq("user_id", session.user.id)
            .maybeSingle();

        if (ownTag) {
            serialNumber = ownTag.serial_number;
        }
    }

    const simulatedResult = {
        serialNumber,
        recordType: "NDEF URL",
        data: "Leitura simulada",
        scannedAt: new Date().toISOString(),
        simulated: true
    };

    setScannerStatus(
        "Simulando leitura...",
        "Buscando o perfil vinculado a esta tag."
    );

    showScannerMessage(
        "Reconhecimento simulado concluído.",
        "warning"
    );

    await resolveAndShow(simulatedResult);
}

function createScannerResult(event) {
    const record = event.message.records[0];

    return {
        serialNumber: event.serialNumber || generateScannerId(),
        recordType: record?.recordType || "NDEF",
        data: record ? decodeScannerRecord(record) : "Tag sem registros",
        scannedAt: new Date().toISOString(),
        simulated: false
    };
}

function decodeScannerRecord(record) {
    try {
        if (!record?.data) {
            return "Tag sem registros";
        }

        const decoder = new TextDecoder(record.encoding || "utf-8");
        const value = decoder.decode(record.data).trim();

        return value || "Tag sem registros";

    } catch (error) {
        console.error("Erro ao decodificar registro NFC:", error);
        return "Tag sem registros";
    }
}

async function findTagOwner(serialNumber) {
    const { data: tag } = await supabaseClient
        .from("nfc_tags")
        .select("user_id, ring_name")
        .eq("serial_number", serialNumber)
        .maybeSingle();

    if (!tag) {
        return null;
    }

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("name")
        .eq("id", tag.user_id)
        .maybeSingle();

    return {
        userId: tag.user_id,
        ringName: tag.ring_name,
        name: profile?.name || "Perfil PRiDeRing"
    };
}

async function maybeRecordConnection(targetId, targetName) {
    const session = await getSession();

    if (!session || session.user.id === targetId) {
        return;
    }

    const { data: existing } = await supabaseClient
        .from("connections")
        .select("id")
        .eq("owner_id", session.user.id)
        .eq("target_id", targetId)
        .maybeSingle();

    if (existing) {
        return;
    }

    await supabaseClient.from("connections").insert({
        owner_id: session.user.id,
        target_id: targetId,
        target_name: targetName
    });
}

async function resolveAndShow(result) {
    const owner = await findTagOwner(result.serialNumber);

    saveScannerHistory(result);
    showScannerResult(result);

    if (owner) {
        setScannerStatus(
            "NFC reconhecido",
            `Perfil de ${owner.name} identificado.`
        );

        await maybeRecordConnection(owner.userId, owner.name);

        setTimeout(() => {
            window.location.href = "perfil-publico.html?u=" + owner.userId;
        }, 1200);

        return;
    }

    setScannerStatus(
        "Tag não vinculada",
        "Esta tag não está associada a nenhum perfil PRiDeRing."
    );

    showScannerMessage(
        "Peça para a pessoa vincular o anel dela em \"Cadastrar NFC\".",
        "warning"
    );
}

function showScannerResult(result) {
    setText("scannerSerialNumber", result.serialNumber || "Não informado");
    setText("scannerRecordType", result.recordType || "NDEF");
    setText("scannerRecordData", result.data || "Sem conteúdo");

    const resultBox = document.getElementById("scannerResult");

    if (resultBox) {
        resultBox.style.display = "block";
    }
}

function saveScannerHistory(result) {
    const history = JSON.parse(
        localStorage.getItem("prideringScannerHistory") || "[]"
    );

    history.unshift(result);

    const limitedHistory = history.slice(0, 20);

    localStorage.setItem(
        "prideringScannerHistory",
        JSON.stringify(limitedHistory)
    );
}

function setScannerStatus(title, text) {
    setText("scannerStatusTitle", title);
    setText("scannerStatusText", text);
}

function setScannerButtonState(isReading) {
    const scanButton = document.getElementById("scannerButton");
    const cancelButton = document.getElementById("cancelScannerButton");

    if (scanButton) {
        scanButton.disabled = isReading;
        scanButton.textContent = isReading
            ? "Aguardando NFC..."
            : "Reconhecer NFC";
    }

    cancelButton?.classList.toggle("hidden", !isReading);
}

function showScannerMessage(message, type = "success") {
    const messageBox = document.getElementById("scannerMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `notice ${type}`;
}

function clearScannerMessage() {
    const messageBox = document.getElementById("scannerMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = "";
    messageBox.className = "notice";
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function generateScannerId() {
    return Array.from(
        { length: 8 },
        () => Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase()
    ).join(":");
}
