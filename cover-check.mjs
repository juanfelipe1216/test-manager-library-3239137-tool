try{process.loadEnvFile('.env')}catch{}
const base=process.env.API_URL||'http://localhost:8000/api/v1';
let token='';
async function api(path,method='GET',body,expected=200){
 const headers={Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{})};
 if(body && !(body instanceof FormData)) headers['Content-Type']='application/json';
 const r=await fetch(base+path,{method,headers,body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
 if(r.status!==expected)throw new Error(method+' '+path+' => '+r.status+' '+await r.text());
 if(r.status===204)return;
 return r.headers.get('content-type')?.includes('application/json')?r.json():r;
}
token=(await api('/auth/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})).access_token;
const books=await api('/books?size=1');
const book=books.items[0];if(!book)throw new Error('Ejecutar semilla antes');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=','base64');
const form=new FormData();form.append('file',new Blob([png],{type:'image/png'}),'test.png');
await api('/books/'+book.id+'/cover','PUT',form,204);
await api('/books/'+book.id+'/cover');
await api('/books/'+book.id+'/cover','DELETE',undefined,204);
await api('/books/'+book.id+'/cover','GET',undefined,404);
const bad=new FormData();bad.append('file',new Blob(['not-an-image'],{type:'image/png'}),'fake.png');
await api('/books/'+book.id+'/cover','PUT',bad,422);
const large=new FormData();large.append('file',new Blob([png,Buffer.alloc(3*1024*1024)],{type:'image/png'}),'large.png');
await api('/books/'+book.id+'/cover','PUT',large,422);
console.log('PASS portada PNG real, descarga, eliminación, tipo falso rechazado y tamaño excesivo rechazado.');
