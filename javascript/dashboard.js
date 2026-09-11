// dashboard.js - comportamento de dashboard.html

function renderGreeting(profile){
const name=profile?.name||"Você";
const userName=document.getElementById("userName");
if(userName)userName.textContent=name;
const avatar=document.getElementById("userAvatar");
if(!avatar)return;
if(profile?.photo_url){
avatar.style.backgroundImage=`url("${profile.photo_url}")`;
avatar.textContent="";
}else{
avatar.style.backgroundImage="";
avatar.textContent=name.charAt(0).toUpperCase();
}
}

function renderRing(nfcTag){
const ringName=document.getElementById("ringName");
const ringStatus=document.getElementById("ringStatus");
if(nfcTag){
ringName.textContent=nfcTag.ring_name||"Meu PRiDeRing";
ringStatus.className="status-badge status-connected";
ringStatus.innerHTML='<span class="status-dot"></span> Conectado';
}else{
ringName.textContent="Nenhum anel vinculado";
ringStatus.className="status-badge status-disconnected";
ringStatus.innerHTML='<span class="status-dot"></span> Não vinculado';
}
}

function renderConnections(connections){
const count=connections.length;
document.getElementById("connectionCount").textContent=count+(count===1?" conexão":" conexões");
document.getElementById("connectionSummary").textContent=count?"Veja quem você conheceu pelo PRiDeRing.":"Suas conexões aparecerão aqui.";

const recent=connections[0];
const recentCard=document.getElementById("recentConnection");
if(recent){
document.getElementById("recentConnectionAvatar").textContent=(recent.target_name||"P").charAt(0).toUpperCase();
document.getElementById("recentConnectionName").textContent=recent.target_name||"Pessoa";
recentCard.hidden=false;
}else{
recentCard.hidden=true;
}
}

function renderSharing(profile,sharing,userId){
const values={
shareNameValue:profile?.name||"Não informado",
sharePronounValue:profile?.pronoun||"Não informado",
shareInstagramValue:profile?.instagram||"Não informado",
shareWhatsappValue:profile?.whatsapp?"Informação privada":"Não informado"
};
Object.entries(values).forEach(([id,value])=>{
const el=document.getElementById(id);
if(el)el.textContent=value;
});

const toggles={
shareName:"share_name",
sharePronoun:"share_pronoun",
shareInstagram:"share_instagram",
shareWhatsapp:"share_whatsapp"
};

Object.entries(toggles).forEach(([id,column])=>{
const input=document.getElementById(id);
if(!input)return;
input.checked=Boolean(sharing?.[column]);
input.addEventListener("change",()=>{
supabaseClient.from("sharing_preferences").update({[column]:input.checked}).eq("user_id",userId);
});
});
}

async function init(){
const session=await requireSession();
if(!session)return;
const userId=session.user.id;

const [{data:profile},{data:sharing},{data:nfcTag},{data:connections}]=await Promise.all([
supabaseClient.from("profiles").select("*").eq("id",userId).single(),
supabaseClient.from("sharing_preferences").select("*").eq("user_id",userId).single(),
supabaseClient.from("nfc_tags").select("*").eq("user_id",userId).maybeSingle(),
supabaseClient.from("connections").select("*").eq("owner_id",userId).order("created_at",{ascending:false})
]);

renderGreeting(profile);
renderRing(nfcTag);
renderConnections(connections||[]);
renderSharing(profile,sharing,userId);

const viewProfileLink=document.getElementById("viewProfileLink");
if(viewProfileLink)viewProfileLink.href="perfil-publico.html?u="+userId;
}

init();
