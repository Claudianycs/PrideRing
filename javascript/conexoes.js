const list=document.getElementById('connectionsList');
const empty=document.getElementById('emptyState');
const search=document.getElementById('searchInput');

let connections=[];

function dedupeConnections(items){
const seen=new Set();
return items.filter(connection=>{
const key=connection.target_id||connection.id;
if(seen.has(key))return false;
seen.add(key);
return true;
});
}

function render(items){
list.innerHTML='';
if(!items.length){
empty.style.display='block';
return;
}
empty.style.display='none';
items.forEach(connection=>{
const card=document.createElement('div');
card.className='connection-card';

const info=document.createElement('div');
const strong=document.createElement('strong');
strong.textContent=connection.target_name||'Sem nome';
const small=document.createElement('small');
small.textContent=new Date(connection.created_at).toLocaleDateString('pt-BR');
info.append(strong,document.createElement('br'),small);

const button=document.createElement('button');
button.textContent='Perfil';
button.disabled=!connection.target_id;
button.addEventListener('click',()=>{
window.location.href='perfil-publico.html?u='+connection.target_id;
});

card.append(info,button);
list.appendChild(card);
});
}

search.oninput=()=>render(connections.filter(c=>(c.target_name||'').toLowerCase().includes(search.value.toLowerCase())));

async function init(){
const session=await requireSession();
if(!session)return;

const {data}=await supabaseClient
.from('connections')
.select('*')
.eq('owner_id',session.user.id)
.order('created_at',{ascending:false});

connections=dedupeConnections(data||[]);
render(connections);
}

init();
