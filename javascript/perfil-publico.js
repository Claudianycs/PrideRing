// perfil-publico.js - comportamento de perfil-publico.html

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

const preferences={
...defaultPreferences,
...(JSON.parse(localStorage.getItem("prideringSharing")||"null")||{})
};

const avatar=document.getElementById("avatar");
const nameElement=document.getElementById("name");
const pronounElement=document.getElementById("pronoun");
const bioElement=document.getElementById("bio");
const tags=document.getElementById("tags");
const contactList=document.getElementById("contactList");
const emptyMessage=document.getElementById("emptyMessage");
const notice=document.getElementById("notice");

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

hideWhenNotAllowed(nameElement,preferences.name,profile.name);
hideWhenNotAllowed(pronounElement,preferences.pronoun,profile.pronoun);
hideWhenNotAllowed(bioElement,preferences.bio,profile.bio);

if(preferences.photo){
avatar.textContent=(profile.name?.charAt(0)||"P").toUpperCase();
}else{
avatar.style.display="none";
}

if(preferences.instagram&&profile.instagram){
createTag("Instagram");
const username=profile.instagram.replace(/^@/,"");
createContact("Instagram",profile.instagram,"https://instagram.com/"+username);
}

if(preferences.whatsapp&&profile.whatsapp){
createTag("WhatsApp");
const number=profile.whatsapp.replace(/\D/g,"");
createContact("WhatsApp",profile.whatsapp,"https://wa.me/55"+number);
}

const hasAdditionalInfo=
(preferences.bio&&profile.bio)||
(preferences.instagram&&profile.instagram)||
(preferences.whatsapp&&profile.whatsapp);

if(!hasAdditionalInfo){
emptyMessage.style.display="block";
}

document.getElementById("connectButton").addEventListener("click",()=>{
const connection={
profileName:preferences.name?profile.name:"Perfil PRiDeRing",
createdAt:new Date().toISOString()
};
const connections=JSON.parse(localStorage.getItem("prideringConnections")||"[]");
connections.push(connection);
localStorage.setItem("prideringConnections",JSON.stringify(connections));
notice.classList.add("show");
setTimeout(()=>notice.classList.remove("show"),2500);
});
