// dashboard.js - comportamento de dashboard.html

document.addEventListener("DOMContentLoaded",()=>{
const profile=JSON.parse(localStorage.getItem("prideringProfile")||"{}");
const user=JSON.parse(localStorage.getItem("prideringUser")||"{}");
const title=document.querySelector("header h1");
const name=profile.name||user.nome||user.name;
if(title&&name)title.textContent=`Olá, ${name}`;
});
