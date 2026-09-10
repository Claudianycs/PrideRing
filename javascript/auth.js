// auth.js - helpers de sessão compartilhados entre páginas

async function getSession(){
const {data}=await supabaseClient.auth.getSession();
return data.session;
}

async function requireSession(){
const session=await getSession();
if(!session){
window.location.href="login.html";
return null;
}
return session;
}

async function redirectIfLoggedIn(target){
const session=await getSession();
if(session){
window.location.href=target||"dashboard.html";
}
}

async function signOutAndRedirect(){
await supabaseClient.auth.signOut();
window.location.href="login.html";
}
