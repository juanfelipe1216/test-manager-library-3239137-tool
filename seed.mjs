import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomInt,randomBytes} from 'node:crypto';
const root=new URL('./',import.meta.url);
try{process.loadEnvFile(fileURLToPath(new URL('.env',root)))}catch{}
const base=process.env.API_URL||'http://localhost:8000/api/v1';
const clock=new URL('../test-manager-library-3239137-api/backend/storage/app/demo-clock.txt',root);
let token='';
async function api(path,method='GET',body){
 const response=await fetch(base+path,{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw new Error(data.code+': '+data.message);return data;
}
try{
 await fs.rm(clock,{force:true});
 const login=await api('/auth/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD});token=login.access_token;
 const categories=await api('/categories'); const tag=randomBytes(3).toString('hex'),books=[],members=[];
 for(let i=0;i<40;i++){books.push(await api('/books','POST',{title:['Historias del bosque','Introducción a la ciencia','Viaje por Colombia','Tecnología cotidiana','Cuentos para imaginar'][i%5]+' '+tag+' '+(i+1),author:['Ana Torres','Carlos Ruiz','María López','Luis Pérez'][i%4],isbn:'978'+String(randomInt(0,10_000_000_000)).padStart(10,'0'),category_id:categories[i%5].id,total_copies:3}));}
 console.log('40 libros creados.');
 for(let i=0;i<10;i++)members.push(await api('/members','POST',{full_name:'Socio demo '+(i+1)+' '+tag,document_number:'DEMO-'+tag+'-'+i}));
 console.log('10 socios creados.');
 // Only the local Clock adapter reads this ignored file. No direct SQL is used.
 await fs.writeFile(clock,new Date(Date.now()-15*86400000).toISOString());
 for(let i=0;i<3;i++)await api('/loans','POST',{member_id:members[i].id,items:[{book_id:books[i].id}]});
 await fs.rm(clock,{force:true});
 for(let i=3;i<15;i++)await api('/loans','POST',{member_id:members[3+(i-3)%7].id,items:[{book_id:books[i].id}]});
 const overdue=await api('/loans/overdue');
 console.log('15 préstamos creados; '+overdue.items.filter(i=>i.book_title.includes(tag)).length+' líneas vencidas de este lote.');
 console.log('Semilla terminada. Todos los registros se crearon mediante la API.');
}catch(e){console.error(e.message);process.exitCode=1}finally{await fs.rm(clock,{force:true})}
