// perfil.js - comportamento de perfil.html

const form=document.getElementById("profileForm");
const nameInput=document.getElementById("name");
const pronounInput=document.getElementById("pronoun");
const previewName=document.getElementById("previewName");
const previewPronoun=document.getElementById("previewPronoun");
const avatar=document.getElementById("avatar");
const message=document.getElementById("message");
const photoButton=document.getElementById("photoButton");
const photoInput=document.getElementById("photoInput");

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
avatar.style.backgroundImage=`url("${reader.result}")`;
avatar.style.backgroundSize="cover";
avatar.style.backgroundPosition="center";
avatar.textContent="";
};
reader.readAsDataURL(file);
});

form.addEventListener("submit",event=>{
event.preventDefault();
const profile={
name:nameInput.value.trim(),
pronoun:pronounInput.value.trim(),
bio:document.getElementById("bio").value.trim(),
instagram:document.getElementById("instagram").value.trim(),
whatsapp:document.getElementById("whatsapp").value.trim()
};
localStorage.setItem("prideringProfile",JSON.stringify(profile));
message.style.display="block";
setTimeout(()=>message.style.display="none",2500);
});

const savedProfile=JSON.parse(localStorage.getItem("prideringProfile")||"null");
if(savedProfile){
nameInput.value=savedProfile.name||"";
pronounInput.value=savedProfile.pronoun||"";
document.getElementById("bio").value=savedProfile.bio||"";
document.getElementById("instagram").value=savedProfile.instagram||"";
document.getElementById("whatsapp").value=savedProfile.whatsapp||"";
previewName.textContent=savedProfile.name||"Seu nome";
previewPronoun.textContent=savedProfile.pronoun||"Pronome não informado";
avatar.textContent=(savedProfile.name?.charAt(0)||"P").toUpperCase();
}
