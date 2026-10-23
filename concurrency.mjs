import {randomBytes,randomInt} from 'node:crypto';
try {process.loadEnvFile('.env')}catch{}
const base=process.env.API_URL||'http://localhost:8000/api/v1';
let token='';
async function request(path,method='GET',body){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 return {status:r.status,data:await r.json()};
}
const login=await request('/auth/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD});
if(login.status!==200)throw new Error('No se pudo iniciar sesión');
token=login.data.access_token;
const categories=await request('/categories'),tag=randomBytes(4).toString('hex');
const book=await request('/books','POST',{title:'Concurrencia '+tag,author:'Prueba',isbn:'978'+String(randomInt(0,10_000_000_000)).padStart(10,'0'),category_id:categories.data[0].id,total_copies:1});
const members=await Promise.all([1,2].map(n=>request('/members','POST',{full_name:'Prueba concurrente '+n,document_number:'RACE-'+tag+'-'+n})));
if(book.status!==201 || members.some(m=>m.status!==201))throw new Error('No se pudo preparar la prueba');
const results=await Promise.all(members.map(m=>request('/loans','POST',{member_id:m.data.id,items:[{book_id:book.data.id}]})));
const statuses=results.map(r=>r.status).sort();
if(JSON.stringify(statuses)!=='[201,409]')throw new Error('Préstamo concurrente falló: '+JSON.stringify(statuses));
const loan=results.find(r=>r.status===201).data;
const returns=await Promise.all([1,2].map(()=>request('/loans/'+loan.id+'/items/'+loan.items[0].id+'/return','POST')));
const returned=returns.map(r=>r.status).sort();
if(JSON.stringify(returned)!=='[200,409]')throw new Error('Devolución concurrente falló: '+JSON.stringify(returned));
const stock=await request('/books/'+book.data.id);
if(stock.data.available_copies!==1)throw new Error('Existencias incorrectas después de la carrera');
console.log('PASS último ejemplar: 201 y 409. PASS devolución simultánea: 200 y 409. Disponibles finales: 1.');
