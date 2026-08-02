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

document.getElementById("logout").onclick=()=>{

if(confirm("Deseja sair da conta?")){

window.location="login.html";

}

};
