// scanner.js - PRiDeRing MVP
// Responsável por reconhecer uma tag NFC e encaminhar o usuário ao perfil público.

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

            saveScannerHistory(result);
            showScannerResult(result);

            scannerActive = false;
            setScannerButtonState(false);

            setTimeout(() => {
                openPublicProfile(result);
            }, 1200);
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

function simulateScanner() {
    clearScannerMessage();

    const linkedRing = JSON.parse(
        localStorage.getItem("prideringNfc") || "null"
    );

    const simulatedResult = {
        serialNumber: linkedRing?.serialNumber || generateScannerId(),
        recordType: linkedRing?.recordType || "NDEF URL",
        data: linkedRing?.data || "perfil-publico.html",
        scannedAt: new Date().toISOString(),
        simulated: true
    };

    setScannerStatus(
        "NFC reconhecido",
        "Tag simulada identificada com sucesso."
    );

    saveScannerHistory(simulatedResult);
    showScannerResult(simulatedResult);

    showScannerMessage(
        "Reconhecimento simulado concluído.",
        "warning"
    );

    setTimeout(() => {
        openPublicProfile(simulatedResult);
    }, 1200);
}

function createScannerResult(event) {
    const record = event.message.records[0];

    return {
        serialNumber: event.serialNumber || generateScannerId(),
        recordType: record?.recordType || "NDEF",
        data: record ? decodeScannerRecord(record) : "perfil-publico.html",
        scannedAt: new Date().toISOString(),
        simulated: false
    };
}

function decodeScannerRecord(record) {
    try {
        if (!record?.data) {
            return "perfil-publico.html";
        }

        const decoder = new TextDecoder(record.encoding || "utf-8");
        const value = decoder.decode(record.data).trim();

        return value || "perfil-publico.html";

    } catch (error) {
        console.error("Erro ao decodificar registro NFC:", error);
        return "perfil-publico.html";
    }
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

function openPublicProfile(result) {
    const fallbackPage = "perfil-publico.html";
    const target = normalizeScannerTarget(result.data, fallbackPage);

    window.location.href = target;
}

function normalizeScannerTarget(value, fallbackPage) {
    if (!value) {
        return fallbackPage;
    }

    const trimmedValue = String(value).trim();

    if (
        trimmedValue.startsWith("http://") ||
        trimmedValue.startsWith("https://")
    ) {
        return trimmedValue;
    }

    if (
        trimmedValue.endsWith(".html") ||
        trimmedValue.startsWith("./") ||
        trimmedValue.startsWith("../")
    ) {
        return trimmedValue;
    }

    return fallbackPage;
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

function getScannerHistory() {
    return JSON.parse(
        localStorage.getItem("prideringScannerHistory") || "[]"
    );
}

function clearScannerHistory() {
    localStorage.removeItem("prideringScannerHistory");
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
