// cadastro.js - comportamento de cadastro.html

document.getElementById('cadastro').addEventListener('submit',function(e){
e.preventDefault();
alert('Cadastro realizado com sucesso!');
window.location='dashboard.html';
});
