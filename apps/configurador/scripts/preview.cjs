// Local preview using the same subdirectory as GitHub Pages. No packages required.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const built=fs.existsSync(path.join(__dirname,'../out/index.html'))?path.resolve(__dirname,'../out'):path.join(root,'configurador');
const prefix='/Matheus-Performance/';
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.xml':'application/xml'};
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'){res.writeHead(302,{Location:prefix+'configurador/'});return res.end();}
  if(!pathname.startsWith(prefix)){res.writeHead(404);return res.end('Not found');}
  const relative=pathname.slice(prefix.length),isConfig=relative.startsWith('configurador/');
  const base=isConfig?built:root;
  let file=path.resolve(base,isConfig?relative.slice('configurador/'.length):relative);
  if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end('Invalid request');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/Matheus-Performance/configurador/'));
