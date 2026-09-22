// nfc.js - comportamento de cadastrar-nfc.html

const scanButton=document.getElementById("scanButton");
const simulateButton=document.getElementById("simulateButton");
const linkButton=document.getElementById("linkButton");
const statusTitle=document.getElementById("statusTitle");
const statusText=document.getElementById("statusText");
const details=document.getElementById("details");
const serialNumber=document.getElementById("serialNumber");
const recordType=document.getElementById("recordType");
const recordData=document.getElementById("recordData");
const ringName=document.getElementById("ringName");
const notice=document.getElementById("notice");
const linkedRings=document.getElementById("linkedRings");
const ringList=document.getElementById("ringList");
const writeTagSection=document.getElementById("writeTagSection");
const writeTagStatus=document.getElementById("writeTagStatus");
const writeTagButton=document.getElementById("writeTagButton");
const skipWriteButton=document.getElementById("skipWriteButton");

const ringIconSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.4 4.7a5.6 5.6 0 0 1 7.2 0M6 2.5a9 9 0 0 1 12 0M10.5 7a2.3 2.3 0 0 1 3 0"></path><circle cx="12" cy="10" r="1.2"></circle><path d="M6.5 14.5c0-2 2.46-3.5 5.5-3.5s5.5 1.5 5.5 3.5-2.46 5.5-5.5 5.5-5.5-3.5-5.5-5.5Z"></path></svg>';

let detectedTag=null;
let userId=null;
let lastScanWasSimulated=false;

function showNotice(message,type){
notice.textContent=message;
notice.className="notice "+type;
}

function clearNotice(){
notice.textContent="";
notice.className="notice";
}

function resetScanState(){
detectedTag=null;
details.style.display="none";
serialNumber.textContent="—";
recordType.textContent="—";
recordData.textContent="—";
ringName.value="Meu PRiDeRing";
linkButton.textContent="Vincular à minha conta";
linkButton.disabled=true;
scanButton.textContent="Ler NFC";
statusTitle.textContent="Pronto para ler";
statusText.textContent="Toque no botão e aproxime o anel do celular.";
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
writeTagSection.classList.add("hidden");
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
lastScanWasSimulated=false;
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
writeTagSection.classList.add("hidden");
const randomId="04:"+Array.from({length:7},()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0").toUpperCase()).join(":");
lastScanWasSimulated=true;
showDetectedTag({
serialNumber:randomId,
recordType:"NDEF",
data:"Tag simulada para demonstração"
});
showNotice("Leitura simulada concluída para demonstração do MVP.","warning");
}

async function saveLink(){
if(!detectedTag||!userId)return;
const name=ringName.value.trim();
if(!name){
showNotice("Informe um nome para o anel.","error");
ringName.focus();
return;
}

linkButton.disabled=true;

const {data:existing}=await supabaseClient
.from("nfc_tags")
.select("user_id")
.eq("serial_number",detectedTag.serialNumber)
.maybeSingle();

if(existing&&existing.user_id!==userId){
showNotice("Esta tag já está vinculada a outra conta.","error");
linkButton.disabled=false;
return;
}

const {error}=await supabaseClient.from("nfc_tags").upsert({
serial_number:detectedTag.serialNumber,
user_id:userId,
ring_name:name,
record_type:detectedTag.recordType
});

if(error){
showNotice("Não foi possível vincular o anel. Tente novamente.","error");
linkButton.disabled=false;
return;
}

showNotice("Anel NFC vinculado com sucesso.","success");
const wasSimulated=lastScanWasSimulated;
resetScanState();
await loadLinkedRings();

if("NDEFReader" in window&&!wasSimulated){
writeTagStatus.textContent="";
writeTagButton.disabled=false;
writeTagButton.textContent="Aproximar e gravar na tag";
writeTagSection.classList.remove("hidden");
}
}

async function writeProfileToTag(){
writeTagButton.disabled=true;
writeTagStatus.textContent="Aproxime o anel do celular para gravar...";

try{
const profileUrl=new URL("perfil-publico.html?u="+userId,window.location.href).href;
const reader=new NDEFReader();
await reader.write({records:[{recordType:"url",data:profileUrl}]});
writeTagStatus.textContent="Link gravado com sucesso na tag.";
showNotice("Link do perfil gravado na tag NFC.","success");
setTimeout(()=>writeTagSection.classList.add("hidden"),1500);
}catch(error){
writeTagStatus.textContent="Não foi possível gravar. A tag pode ser somente leitura — tente novamente ou pule esta etapa.";
writeTagButton.disabled=false;
}
}

function skipWrite(){
writeTagSection.classList.add("hidden");
}

async function removeTag(serial){
await supabaseClient.from("nfc_tags").delete().eq("serial_number",serial).eq("user_id",userId);
showNotice("Vínculo removido da sua conta.","success");
await loadLinkedRings();
}

function renderRingItem(tag){
const item=document.createElement("div");
item.className="ring-item";

const icon=document.createElement("div");
icon.className="ring-item-icon";
icon.innerHTML=ringIconSvg;

const info=document.createElement("div");
info.className="ring-item-info";
const name=document.createElement("strong");
name.textContent=tag.ring_name||"Meu PRiDeRing";
const status=document.createElement("span");
status.className="ring-status";
status.innerHTML='<span class="ring-status-dot"></span> Conectado';
info.append(name,status);

const removeBtn=document.createElement("button");
removeBtn.type="button";
removeBtn.className="ring-item-remove";
removeBtn.textContent="Remover";
removeBtn.setAttribute("aria-label","Remover "+(tag.ring_name||"anel")+" da conta");
removeBtn.addEventListener("click",()=>removeTag(tag.serial_number));

item.append(icon,info,removeBtn);
return item;
}

async function loadLinkedRings(){
const {data:tags}=await supabaseClient
.from("nfc_tags")
.select("*")
.eq("user_id",userId)
.order("linked_at",{ascending:false});

ringList.innerHTML="";

if(!tags||!tags.length){
linkedRings.hidden=true;
return;
}

tags.forEach(tag=>ringList.appendChild(renderRingItem(tag)));
linkedRings.hidden=false;
}

scanButton.addEventListener("click",scanNfc);
simulateButton.addEventListener("click",simulateScan);
linkButton.addEventListener("click",saveLink);
writeTagButton.addEventListener("click",writeProfileToTag);
skipWriteButton.addEventListener("click",skipWrite);

if(!("NDEFReader" in window)){
simulateButton.classList.remove("hidden");
}

async function init(){
const session=await requireSession();
if(!session)return;
userId=session.user.id;
await loadLinkedRings();
}

init();
