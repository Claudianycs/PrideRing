// perfil.js - comportamento de perfil.html

const form=document.getElementById("profileForm");
const nameInput=document.getElementById("name");
const pronounInput=document.getElementById("pronoun");
const bioInput=document.getElementById("bio");
const instagramInput=document.getElementById("instagram");
const whatsappInput=document.getElementById("whatsapp");
const previewName=document.getElementById("previewName");
const previewPronoun=document.getElementById("previewPronoun");
const avatar=document.getElementById("avatar");
const message=document.getElementById("message");
const photoButton=document.getElementById("photoButton");
const photoInput=document.getElementById("photoInput");

let userId=null;
let photoDataUrl;

nameInput.addEventListener("input",()=>{
const value=nameInput.value.trim();
previewName.textContent=value||"Seu nome";
if(!avatar.style.backgroundImage) avatar.textContent=(value.charAt(0)||"P").toUpperCase();
});

pronounInput.addEventListener("input",()=>{
previewPronoun.textContent=pronounInput.value.trim()||"Pronome não informado";
});

photoButton.addEventListener("click",()=>photoInput.click());

photoInput.addEventListener("change",()=>{
const file=photoInput.files[0];
if(!file)return;
const reader=new FileReader();
reader.onload=()=>{
photoDataUrl=reader.result;
avatar.style.backgroundImage=`url("${photoDataUrl}")`;
avatar.style.backgroundSize="cover";
avatar.style.backgroundPosition="center";
avatar.textContent="";
};
reader.readAsDataURL(file);
});

form.addEventListener("submit",async event=>{
event.preventDefault();
if(!userId)return;

const profile={
name:nameInput.value.trim(),
pronoun:pronounInput.value.trim(),
bio:bioInput.value.trim(),
instagram:instagramInput.value.trim(),
whatsapp:whatsappInput.value.trim()
};
if(photoDataUrl!==undefined)profile.photo_url=photoDataUrl;

const {error}=await supabaseClient.from("profiles").update(profile).eq("id",userId);

if(error){
message.textContent="Não foi possível salvar. Tente novamente.";
message.style.display="block";
setTimeout(()=>message.style.display="none",2500);
return;
}

message.textContent="Perfil atualizado com sucesso.";
message.style.display="block";
setTimeout(()=>message.style.display="none",2500);
});

async function init(){
const session=await requireSession();
if(!session)return;
userId=session.user.id;

const {data:profile}=await supabaseClient.from("profiles").select("*").eq("id",userId).single();
if(!profile)return;

nameInput.value=profile.name||"";
pronounInput.value=profile.pronoun||"";
bioInput.value=profile.bio||"";
instagramInput.value=profile.instagram||"";
whatsappInput.value=profile.whatsapp||"";
previewName.textContent=profile.name||"Seu nome";
previewPronoun.textContent=profile.pronoun||"Pronome não informado";
if(profile.photo_url){
avatar.style.backgroundImage=`url("${profile.photo_url}")`;
avatar.style.backgroundSize="cover";
avatar.style.backgroundPosition="center";
avatar.textContent="";
}else{
avatar.textContent=(profile.name?.charAt(0)||"P").toUpperCase();
}
}

init();
