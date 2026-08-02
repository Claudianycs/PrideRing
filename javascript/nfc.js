// nfc.js - comportamento de cadastrar-nfc.html

const scanButton=document.getElementById("scanButton");
const simulateButton=document.getElementById("simulateButton");
const linkButton=document.getElementById("linkButton");
const removeButton=document.getElementById("removeButton");
const statusTitle=document.getElementById("statusTitle");
const statusText=document.getElementById("statusText");
const details=document.getElementById("details");
const serialNumber=document.getElementById("serialNumber");
const recordType=document.getElementById("recordType");
const recordData=document.getElementById("recordData");
const ringName=document.getElementById("ringName");
const notice=document.getElementById("notice");

let detectedTag=null;

function showNotice(message,type){
notice.textContent=message;
notice.className="notice "+type;
}

function clearNotice(){
notice.textContent="";
notice.className="notice";
}

function decodeRecord(record){
try{
if(record.recordType==="text"){
return new TextDecoder(record.encoding||"utf-8").decode(record.data);
}
if(record.recordType==="url"||record.recordType==="absolute-url"){
return new TextDecoder().decode(record.data);
}
return record.data?new TextDecoder().decode(record.data):"Sem conteúdo legível";
}catch(error){
return "Conteúdo não decodificado";
}
}

function showDetectedTag(tag){
detectedTag=tag;
serialNumber.textContent=tag.serialNumber||"Não informado";
recordType.textContent=tag.recordType||"Tag NFC";
recordData.textContent=tag.data||"Sem conteúdo";
details.style.display="block";
linkButton.disabled=false;
statusTitle.textContent="NFC encontrado";
statusText.textContent="A tag foi identificada. Agora você pode vinculá-la ao seu perfil.";
scanButton.textContent="Ler novamente";
}

async function scanNfc(){
clearNotice();
if(!("NDEFReader" in window)){
statusTitle.textContent="NFC indisponível";
statusText.textContent="Este navegador não oferece suporte à leitura Web NFC.";
simulateButton.classList.remove("hidden");
showNotice("Use a simulação para testar o fluxo do MVP neste dispositivo.","warning");
return;
}

try{
scanButton.disabled=true;
statusTitle.textContent="Aguardando aproximação";
statusText.textContent="Aproxime o anel da área NFC do celular e mantenha-o parado.";
const reader=new NDEFReader();
await reader.scan();

reader.addEventListener("readingerror",()=>{
scanButton.disabled=false;
statusTitle.textContent="Não foi possível ler";
statusText.textContent="Afaste o anel e tente aproximá-lo novamente.";
showNotice("Ocorreu um erro durante a leitura da tag NFC.","error");
});

reader.addEventListener("reading",event=>{
const firstRecord=event.message.records[0];
showDetectedTag({
serialNumber:event.serialNumber||"NFC-"+Date.now(),
recordType:firstRecord?.recordType||"NDEF",
data:firstRecord?decodeRecord(firstRecord):"Tag sem registros"
});
scanButton.disabled=false;
});
}catch(error){
scanButton.disabled=false;
statusTitle.textContent="Leitura não iniciada";
statusText.textContent="Verifique a permissão do NFC e tente novamente.";
simulateButton.classList.remove("hidden");
showNotice("Não foi possível acessar o NFC. Você pode utilizar a simulação do MVP.","error");
}
}

function simulateScan(){
const randomId="04:"+Array.from({length:7},()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0").toUpperCase()).join(":");
showDetectedTag({
serialNumber:randomId,
recordType:"NDEF URL",
data:"https://pridering.app/p/demo"
});
showNotice("Leitura simulada concluída para demonstração do MVP.","warning");
}

function saveLink(){
if(!detectedTag)return;
const name=ringName.value.trim();
if(!name){
showNotice("Informe um nome para o anel.","error");
ringName.focus();
return;
}
const linkedRing={
name,
serialNumber:detectedTag.serialNumber,
recordType:detectedTag.recordType,
data:detectedTag.data,
linkedAt:new Date().toISOString()
};
localStorage.setItem("prideringNfc",JSON.stringify(linkedRing));
linkButton.textContent="Anel vinculado";
linkButton.disabled=true;
removeButton.classList.remove("hidden");
statusTitle.textContent="Anel vinculado";
statusText.textContent="O PRiDeRing está associado ao perfil salvo neste dispositivo.";
showNotice("Anel NFC vinculado com sucesso.","success");
}

function removeLink(){
localStorage.removeItem("prideringNfc");
detectedTag=null;
details.style.display="none";
serialNumber.textContent="—";
recordType.textContent="—";
recordData.textContent="—";
linkButton.textContent="Vincular à minha conta";
linkButton.disabled=true;
removeButton.classList.add("hidden");
statusTitle.textContent="Pronto para ler";
statusText.textContent="Toque no botão e aproxime o anel do celular.";
showNotice("Vínculo removido deste dispositivo.","success");
}

function loadLinkedRing(){
const saved=JSON.parse(localStorage.getItem("prideringNfc")||"null");
if(!saved)return;
ringName.value=saved.name||"Meu PRiDeRing";
showDetectedTag(saved);
linkButton.textContent="Anel vinculado";
linkButton.disabled=true;
removeButton.classList.remove("hidden");
statusTitle.textContent="Anel vinculado";
statusText.textContent="Este NFC já está associado ao perfil salvo no dispositivo.";
}

scanButton.addEventListener("click",scanNfc);
simulateButton.addEventListener("click",simulateScan);
linkButton.addEventListener("click",saveLink);
removeButton.addEventListener("click",removeLink);

if(!("NDEFReader" in window)){
simulateButton.classList.remove("hidden");
}

loadLinkedRing();
