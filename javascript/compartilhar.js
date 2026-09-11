// compartilhar.js - comportamento de compartilhar.html

const columnByKey={
name:"share_name",
pronoun:"share_pronoun",
photo:"share_photo",
bio:"share_bio",
instagram:"share_instagram",
whatsapp:"share_whatsapp"
};

let profile={};
let userId=null;

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
const preferences=currentPreferences();

previewName.textContent=preferences.name?(profile.name||"Seu nome"):"Perfil PRiDeRing";
previewPronoun.textContent=preferences.pronoun?(profile.pronoun||"Pronome não informado"):"";

avatar.style.display=preferences.photo?"grid":"none";
if(preferences.photo){
if(profile.photo_url){
avatar.style.backgroundImage=`url("${profile.photo_url}")`;
avatar.style.backgroundSize="cover";
avatar.style.backgroundPosition="center";
avatar.textContent="";
}else{
avatar.style.backgroundImage="";
avatar.textContent=(profile.name?.charAt(0)||"P").toUpperCase();
}
}

previewData.innerHTML="";
const items=[];

if(preferences.bio&&profile.bio)items.push(profile.bio);
if(preferences.instagram&&profile.instagram)items.push(profile.instagram);
if(preferences.whatsapp&&profile.whatsapp)items.push(profile.whatsapp);

items.forEach(item=>previewData.appendChild(createChip(item)));
emptyPreview.hidden=items.length>0;
}

async function savePreferences(){
const preferences=currentPreferences();
const update={};
Object.entries(columnByKey).forEach(([key,column])=>{
update[column]=Boolean(preferences[key]);
});

await supabaseClient.from("sharing_preferences").update(update).eq("user_id",userId);

status.classList.add("show");
setTimeout(()=>status.classList.remove("show"),2500);
}

async function copyLink(){
try{
await navigator.clipboard.writeText(publicLink.value);
document.getElementById("copyButton").textContent="Copiado";
setTimeout(()=>document.getElementById("copyButton").textContent="Copiar",1800);
}catch(error){
publicLink.select();
document.execCommand("copy");
}
}

document.getElementById("saveButton").addEventListener("click",savePreferences);
document.getElementById("previewButton").addEventListener("click",async()=>{
await savePreferences();
window.location.href="perfil-publico.html?u="+userId;
});
document.getElementById("copyButton").addEventListener("click",copyLink);

async function init(){
const session=await requireSession();
if(!session)return;
userId=session.user.id;

const [{data:profileData},{data:sharing}]=await Promise.all([
supabaseClient.from("profiles").select("*").eq("id",userId).single(),
supabaseClient.from("sharing_preferences").select("*").eq("user_id",userId).single()
]);

profile=profileData||{};
publicLink.value=new URL("perfil-publico.html?u="+userId,window.location.href).href;

inputs.forEach(input=>{
const key=input.dataset.key;
input.checked=Boolean(sharing?.[columnByKey[key]]);
input.addEventListener("change",updatePreview);
});

updatePreview();
}

init();
