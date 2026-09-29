// perfil-publico.js - comportamento de perfil-publico.html

const avatar=document.getElementById("avatar");
const nameElement=document.getElementById("name");
const pronounElement=document.getElementById("pronoun");
const bioElement=document.getElementById("bio");
const tags=document.getElementById("tags");
const contactList=document.getElementById("contactList");
const emptyMessage=document.getElementById("emptyMessage");
const notice=document.getElementById("notice");
const connectButton=document.getElementById("connectButton");

function hideWhenNotAllowed(element,allowed,value){
if(allowed&&value){
element.textContent=value;
element.style.display="";
}else{
element.style.display="none";
}
}

function createTag(text){
const element=document.createElement("span");
element.className="tag";
element.textContent=text;
tags.appendChild(element);
}

function createContact(title,value,href){
const link=document.createElement("a");
link.className="contact";
link.href=href;
link.target="_blank";
link.rel="noopener noreferrer";

const info=document.createElement("div");
info.className="contact-info";

const strong=document.createElement("strong");
strong.textContent=title;

const span=document.createElement("span");
span.textContent=value;

const arrow=document.createElement("span");
arrow.className="arrow";
arrow.textContent="→";

info.append(strong,span);
link.append(info,arrow);
contactList.appendChild(link);
}

function renderProfile(profile,preferences){
tags.innerHTML="";
contactList.innerHTML="";

hideWhenNotAllowed(nameElement,preferences.share_name,profile.name);
hideWhenNotAllowed(pronounElement,preferences.share_pronoun,profile.pronoun);
hideWhenNotAllowed(bioElement,preferences.share_bio,profile.bio);

if(preferences.share_photo){
avatar.style.display="";
if(profile.photo_url){
avatar.style.backgroundImage=`url("${profile.photo_url}")`;
avatar.style.backgroundSize="cover";
avatar.style.backgroundPosition="center";
avatar.textContent="";
}else{
avatar.style.backgroundImage="";
avatar.textContent=(profile.name?.charAt(0)||"P").toUpperCase();
}
}else{
avatar.style.display="none";
}

if(preferences.share_instagram&&profile.instagram){
createTag("Instagram");
const username=profile.instagram.replace(/^@/,"");
createContact("Instagram",profile.instagram,"https://instagram.com/"+username);
}

if(preferences.share_whatsapp&&profile.whatsapp){
createTag("WhatsApp");
const number=profile.whatsapp.replace(/\D/g,"");
createContact("WhatsApp",profile.whatsapp,"https://wa.me/55"+number);
}

const hasAdditionalInfo=
(preferences.share_bio&&profile.bio)||
(preferences.share_instagram&&profile.instagram)||
(preferences.share_whatsapp&&profile.whatsapp);

emptyMessage.style.display=hasAdditionalInfo?"none":"block";
}

function showNotFound(message){
nameElement.textContent="Perfil não encontrado";
pronounElement.style.display="none";
bioElement.style.display="none";
avatar.style.display="none";
connectButton.style.display="none";
emptyMessage.textContent=message;
emptyMessage.style.display="block";
}

function showNotice(message){
notice.textContent=message;
notice.classList.add("show");
setTimeout(()=>notice.classList.remove("show"),2500);
}

async function init(){
const params=new URLSearchParams(window.location.search);
const targetId=params.get("u");

if(!targetId){
showNotFound("Abra este link a partir do seu anel PRiDeRing ou do app.");
return;
}

const [{data:profile},{data:preferences}]=await Promise.all([
supabaseClient.from("profiles").select("*").eq("id",targetId).maybeSingle(),
supabaseClient.from("sharing_preferences").select("*").eq("user_id",targetId).maybeSingle()
]);

if(!profile){
showNotFound("Este perfil não existe mais.");
return;
}

renderProfile(profile,preferences||{});

const session=await getSession();

if(session&&session.user.id===targetId){
connectButton.style.display="none";
return;
}

connectButton.addEventListener("click",async()=>{
if(!session){
window.location.href="login.html";
return;
}

const {data:existing}=await supabaseClient.from("connections")
.select("id")
.eq("owner_id",session.user.id)
.eq("target_id",targetId)
.maybeSingle();

if(existing){
showNotice("Vocês já estão conectados.");
return;
}

await supabaseClient.from("connections").insert({
owner_id:session.user.id,
target_id:targetId,
target_name:profile.name
});

showNotice("Conexão registrada com sucesso.");
});
}

init();
