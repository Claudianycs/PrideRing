// configuracoes.js - comportamento de configuracoes.html

const settings={
darkMode:document.getElementById("darkMode"),
animations:document.getElementById("animations"),
history:document.getElementById("history"),
sharing:document.getElementById("sharing")
};

const saved=JSON.parse(localStorage.getItem("prideringSettings")||"null");

if(saved){
Object.keys(settings).forEach(key=>{
if(saved[key]!==undefined){
settings[key].checked=saved[key];
}
});
}

document.getElementById("save").onclick=()=>{

const config={};

Object.keys(settings).forEach(key=>{
config[key]=settings[key].checked;
});

localStorage.setItem("prideringSettings",JSON.stringify(config));

const notice=document.getElementById("notice");

notice.style.display="block";

setTimeout(()=>{
notice.style.display="none";
},2500);

};

document.getElementById("changePassword").onclick=async()=>{

const newPassword=document.getElementById("newPassword");
const confirmPassword=document.getElementById("confirmPassword");
const passwordNotice=document.getElementById("passwordNotice");

function showPasswordNotice(message,isError){
passwordNotice.textContent=message;
passwordNotice.classList.toggle("error",Boolean(isError));
passwordNotice.style.display="block";
setTimeout(()=>{passwordNotice.style.display="none";},3000);
}

if(newPassword.value.length<6){
showPasswordNotice("A senha deve ter pelo menos 6 caracteres.",true);
return;
}

if(newPassword.value!==confirmPassword.value){
showPasswordNotice("As senhas não coincidem.",true);
return;
}

const {error}=await supabaseClient.auth.updateUser({password:newPassword.value});

if(error){
showPasswordNotice("Não foi possível alterar a senha. Tente novamente.",true);
return;
}

newPassword.value="";
confirmPassword.value="";
showPasswordNotice("Senha alterada com sucesso.",false);

};

document.getElementById("logout").onclick=()=>{

if(confirm("Deseja sair da conta?")){

signOutAndRedirect();

}

};

requireSession();
