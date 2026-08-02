// compartilhar.js - comportamento de compartilhar.html

const defaultProfile={
name:"Alex",
pronoun:"ele/dele",
bio:"Tecnologia, conexões e respeito.",
instagram:"@alex",
whatsapp:""
};

const defaultPreferences={
name:true,
pronoun:true,
photo:true,
bio:true,
instagram:true,
whatsapp:false
};

const profile={
...defaultProfile,
...(JSON.parse(localStorage.getItem("prideringProfile")||"null")||{})
};

let preferences={
...defaultPreferences,
...(JSON.parse(localStorage.getItem("prideringSharing")||"null")||{})
};

const inputs=[...document.querySelectorAll("[data-key]")];
const previewName=document.getElementById("previewName");
const previewPronoun=document.getElementById("previewPronoun");
const previewData=document.getElementById("previewData");
const emptyPreview=document.getElementById("emptyPreview");
const avatar=document.getElementById("avatar");
const status=document.getElementById("status");
const publicLink=document.getElementById("publicLink");

function currentPreferences(){
return inputs.reduce((result,input)=>{
result[input.dataset.key]=input.checked;
return result;
},{});
}

function createChip(text){
const element=document.createElement("span");
element.className="chip";
element.textContent=text;
return element;
}

function updatePreview(){
preferences=currentPreferences();

previewName.textContent=preferences.name?(profile.name||"Seu nome"):"Perfil PRiDeRing";
previewPronoun.textContent=preferences.pronoun?(profile.pronoun||"Pronome não informado"):"";

avatar.style.display=preferences.photo?"grid":"none";
if(preferences.photo){
avatar.textContent=(profile.name?.charAt(0)||"P").toUpperCase();
}

previewData.innerHTML="";
const items=[];

if(preferences.bio&&profile.bio)items.push(profile.bio);
if(preferences.instagram&&profile.instagram)items.push(profile.instagram);
if(preferences.whatsapp&&profile.whatsapp)items.push(profile.whatsapp);

items.forEach(item=>previewData.appendChild(createChip(item)));
emptyPreview.hidden=items.length>0;
}

function loadPreferences(){
inputs.forEach(input=>{
input.checked=Boolean(preferences[input.dataset.key]);
input.addEventListener("change",updatePreview);
});
updatePreview();
}

function savePreferences(){
preferences=currentPreferences();
localStorage.setItem("prideringSharing",JSON.stringify(preferences));
status.classList.add("show");
setTimeout(()=>status.classList.remove("show"),2500);
}

async function copyLink(){
try{
const fullLink=new URL(publicLink.value,window.location.href).href;
await navigator.clipboard.writeText(fullLink);
document.getElementById("copyButton").textContent="Copiado";
setTimeout(()=>document.getElementById("copyButton").textContent="Copiar",1800);
}catch(error){
publicLink.select();
document.execCommand("copy");
}
}

document.getElementById("saveButton").addEventListener("click",savePreferences);
document.getElementById("previewButton").addEventListener("click",()=>{
savePreferences();
window.location.href="perfil-publico.html";
});
document.getElementById("copyButton").addEventListener("click",copyLink);

loadPreferences();
