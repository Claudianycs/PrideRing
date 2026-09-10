// cadastro.js - comportamento de cadastro.html

const cadastroForm=document.getElementById("cadastro");
const submitButton=document.getElementById("submitButton");
const notice=document.getElementById("notice");

function showNotice(message,type){
notice.textContent=message;
notice.className="notice "+type;
}

cadastroForm.addEventListener("submit",async event=>{
event.preventDefault();

const name=document.getElementById("name").value.trim();
const pronoun=document.getElementById("pronoun").value.trim();
const email=document.getElementById("email").value.trim();
const password=document.getElementById("password").value;
const confirmPassword=document.getElementById("confirmPassword").value;
const bio=document.getElementById("bio").value.trim();

if(password!==confirmPassword){
showNotice("As senhas não coincidem.","error");
return;
}

submitButton.disabled=true;
submitButton.textContent="Cadastrando...";

const {data,error}=await supabaseClient.auth.signUp({
email,
password,
options:{data:{name}}
});

if(error){
showNotice(error.message,"error");
submitButton.disabled=false;
submitButton.textContent="Cadastrar";
return;
}

if(!data.session){
showNotice("Cadastro realizado! Confirme seu e-mail para poder entrar.","success");
submitButton.textContent="Cadastrar";
return;
}

await supabaseClient.from("profiles").update({name,pronoun,bio}).eq("id",data.user.id);

window.location.href="dashboard.html";
});

redirectIfLoggedIn("dashboard.html");
