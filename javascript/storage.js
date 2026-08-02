// storage.js - PRiDeRing MVP
// Camada simples para persistência no localStorage.

const Storage={
keys:{
user:"prideringUser",
profile:"prideringProfile",
settings:"prideringSettings",
sharing:"prideringSharing",
nfc:"prideringNfc",
connections:"prideringConnections",
scannerHistory:"prideringScannerHistory",
logged:"prideringLogged"
},

save(key,data){
try{
localStorage.setItem(key,JSON.stringify(data));
return true;
}catch(error){
console.error("Erro ao salvar:",error);
return false;
}
},

load(key,defaultValue=null){
try{
const value=localStorage.getItem(key);
return value?JSON.parse(value):defaultValue;
}catch(error){
console.error("Erro ao carregar:",error);
return defaultValue;
}
},

set(key,value){
localStorage.setItem(key,value);
},

get(key){
return localStorage.getItem(key);
},

remove(key){
localStorage.removeItem(key);
},

clear(){
localStorage.clear();
},

isLogged(){
return localStorage.getItem(this.keys.logged)==="true";
},

login(user){
this.save(this.keys.user,user);
localStorage.setItem(this.keys.logged,"true");
},

logout(){
localStorage.removeItem(this.keys.logged);
},

saveProfile(profile){
return this.save(this.keys.profile,profile);
},

getProfile(){
return this.load(this.keys.profile,{});
},

saveSettings(settings){
return this.save(this.keys.settings,settings);
},

getSettings(){
return this.load(this.keys.settings,{});
},

saveSharing(sharing){
return this.save(this.keys.sharing,sharing);
},

getSharing(){
return this.load(this.keys.sharing,{});
},

saveNfc(nfc){
return this.save(this.keys.nfc,nfc);
},

getNfc(){
return this.load(this.keys.nfc,null);
},

removeNfc(){
this.remove(this.keys.nfc);
},

addConnection(connection){
const list=this.getConnections();
list.unshift(connection);
this.save(this.keys.connections,list);
},

getConnections(){
return this.load(this.keys.connections,[]);
},

addScannerHistory(scan){
const history=this.getScannerHistory();
history.unshift(scan);
this.save(this.keys.scannerHistory,history.slice(0,50));
},

getScannerHistory(){
return this.load(this.keys.scannerHistory,[]);
}
};

window.Storage=Storage;
