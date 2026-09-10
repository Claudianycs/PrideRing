// login.js - comportamento de login.html

const loginForm=document.getElementById("loginForm");
const submitButton=document.getElementById("submitButton");
const notice=document.getElementById("notice");

function showNotice(message,type){
notice.textContent=message;
notice.className="notice "+type;
}

loginForm.addEventListener("submit",async event=>{
event.preventDefault();
submitButton.disabled=true;
submitButton.textContent="Entrando...";

const email=document.getElementById("email").value.trim();
const password=document.getElementById("password").value;

const {error}=await supabaseClient.auth.signInWithPassword({email,password});

if(error){
showNotice(error.message==="Invalid login credentials"?"E-mail ou senha inválidos.":error.message,"error");
submitButton.disabled=false;
submitButton.textContent="Entrar";
return;
}

window.location.href="dashboard.html";
});

redirectIfLoggedIn("dashboard.html");
