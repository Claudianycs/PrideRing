// api.js - PRiDeRing MVP
// Camada de comunicação com API.
// Atualmente funciona em modo MOCK e pode ser alterada para uma API REST.

const Api={
baseUrl:"https://api.pridering.app/v1",
useMock:true,

async request(endpoint,options={}){
if(this.useMock){
return this.mock(endpoint,options);
}
const response=await fetch(this.baseUrl+endpoint,{
headers:{
"Content-Type":"application/json",
...(options.headers||{})
},
...options
});
if(!response.ok){
throw new Error("Erro na API: "+response.status);
}
return response.json();
},

get(endpoint){
return this.request(endpoint,{method:"GET"});
},

post(endpoint,data){
return this.request(endpoint,{
method:"POST",
body:JSON.stringify(data)
});
},

put(endpoint,data){
return this.request(endpoint,{
method:"PUT",
body:JSON.stringify(data)
});
},

delete(endpoint){
return this.request(endpoint,{method:"DELETE"});
},

login(email,password){
return this.post("/auth/login",{email,password});
},

register(user){
return this.post("/auth/register",user);
},

saveProfile(profile){
return this.put("/profile",profile);
},

getProfile(){
return this.get("/profile");
},

linkNfc(nfc){
return this.post("/nfc/link",nfc);
},

getNfc(){
return this.get("/nfc");
},

saveSharing(config){
return this.put("/sharing",config);
},

getSharing(){
return this.get("/sharing");
},

getPublicProfile(id){
return this.get("/public/"+id);
},

async mock(endpoint,options){
await new Promise(r=>setTimeout(r,300));

switch(endpoint){

case "/auth/login":
return{
success:true,
token:"mock-token",
user:{
id:1,
name:"Usuário PRiDeRing",
email:JSON.parse(options.body).email
}
};

case "/auth/register":
return{
success:true,
message:"Cadastro realizado com sucesso."
};

case "/profile":
if(options.method==="GET"){
return JSON.parse(localStorage.getItem("prideringProfile")||"{}");
}
localStorage.setItem("prideringProfile",options.body);
return{
success:true
};

case "/nfc":
return JSON.parse(localStorage.getItem("prideringNfc")||"null");

case "/nfc/link":
localStorage.setItem("prideringNfc",options.body);
return{
success:true
};

case "/sharing":
if(options.method==="GET"){
return JSON.parse(localStorage.getItem("prideringSharing")||"{}");
}
localStorage.setItem("prideringSharing",options.body);
return{
success:true
};

default:
return{
success:true,
endpoint,
method:options.method||"GET"
};
}
}
};

window.Api=Api;
