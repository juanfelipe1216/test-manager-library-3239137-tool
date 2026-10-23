import fs from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const root=new URL('./',import.meta.url),clock=new URL('../test-manager-library-3239137-api/backend/storage/app/demo-clock.txt',root);
try{process.loadEnvFile('.env')}catch{}
const base=process.env.API_URL||'http://localhost:8000/api/v1';
let token='';
async function api(path,method='GET',body){
 const response=await fetch(base+path,{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const data=response.status===204?null:await response.json();
 if(!response.ok)throw new Error(path+': '+data.code+' '+data.message);return data;
}
async function batch(items,fn){for(let i=0;i<items.length;i+=4)await Promise.all(items.slice(i,i+4).map(fn));}
try{
 await fs.rm(clock,{force:true});
 token=(await api('/auth/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})).access_token;
 const old=await api('/books?size=50');
 const synthetic=old.items.filter(b=>/^(Concurrencia |Historias del bosque |Introducción a la ciencia |Viaje por Colombia |Tecnología cotidiana |Cuentos para imaginar )/.test(b.title));
 const ids=new Set(synthetic.map(b=>b.id));
 const loans=await api('/loans?size=50');
 const pending=loans.items.flatMap(l=>l.items.filter(i=>i.returned_at===null&&ids.has(i.book_id)).map(i=>({loan:l.id,item:i.id})));
 await batch(pending,x=>api('/loans/'+x.loan+'/items/'+x.item+'/return','POST'));
 await batch(synthetic,b=>api('/books/'+b.id,'DELETE'));
 console.log('Libros ficticios dados de baja; historial conservado.');
 const sources=JSON.parse((await fs.readFile(new URL('colombian-books.json',root),'utf8')).replace(/^\uFEFF/,''));
 const categories=await api('/categories');const books=[];
 await batch(sources,async b=>{
  const existing=await api('/books?size=50&q='+encodeURIComponent(b.title));
  const found=existing.items.find(x=>x.isbn===b.isbn);
  books.push(found||await api('/books','POST',{title:b.title,author:b.author,isbn:b.isbn,category_id:categories.find(c=>c.name===b.category).id,total_copies:3}));
 });
 console.log(books.length+' ediciones colombianas reales disponibles.');
 const members=[],tag=randomBytes(3).toString('hex');
 await batch(Array.from({length:10},(_,i)=>i),async i=>{members[i]=await api('/members','POST',{full_name:'Socio de demostración '+String(i+1).padStart(2,'0'),document_number:'CO-DEMO-'+tag+'-'+i});});
 await fs.writeFile(clock,new Date(Date.now()-15*86400000).toISOString());
 await batch([0,1,2],i=>api('/loans','POST',{member_id:members[i].id,items:[{book_id:books[i].id}]}));
 await fs.rm(clock,{force:true});
 await batch(Array.from({length:12},(_,i)=>i+3),i=>api('/loans','POST',{member_id:members[3+(i-3)%7].id,items:[{book_id:books[i].id}]}));
 console.log('15 préstamos creados con títulos reales; tres vencidos. Socios ficticios identificados como demostración.');
}catch(e){console.error(e.message);process.exitCode=1}finally{await fs.rm(clock,{force:true})}
