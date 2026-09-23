const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173/Matheus-Performance/configurador/';
const artifacts=path.resolve(__dirname,'../../../../review');
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 await page.goto(base);await page.getByRole('button',{name:'Continuar →',exact:true}).waitFor();
 await page.screenshot({path:path.join(artifacts,'desktop-top.png')});
 await page.screenshot({path:path.join(artifacts,'desktop.png'),fullPage:true});
 assert.deepEqual(await page.locator('#exemplos article [class*="inspirationNav"] strong').allTextContents(),['SERVIÇOS LOCAIS','BELEZA E BEM-ESTAR','CONSULTORIA','PORTFÓLIO CRIATIVO','ALIMENTAÇÃO']);
 assert.equal(await page.locator('[data-testid=estimate]').innerText(),'R$ 500 – R$ 550');
 await page.getByLabel('Nome do negócio').fill('Aurora Teste');
 await page.getByRole('button',{name:'Beleza e bem-estar',exact:true}).click();
 await page.getByLabel('O que você oferece?').fill('Cuidados com a sua rotina.');
 await page.getByRole('button',{name:'Continuar →',exact:true}).click();
 await page.getByRole('button',{name:/Facilitar solicitações de agendamento/}).click();
 await page.getByRole('button',{name:'Continuar →',exact:true}).click();
 await page.getByRole('checkbox',{name:/Galeria/}).check();
 await page.locator('#configurador').screenshot({path:path.join(artifacts,'estrutura-desktop.png')});
 const contrast=async locator=>locator.evaluate(el=>{
  const channels=value=>value.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
  const luminance=value=>{const [r,g,b]=channels(value);return .2126*r+.7152*g+.0722*b};
  const fg=luminance(getComputedStyle(el).color);
  let node=el,bg;
  while(node&&!bg){const color=getComputedStyle(node).backgroundColor;if(color.startsWith('rgb(')||color.startsWith('rgba(')&&Number(color.match(/[\d.]+/g)[3])>0)bg=luminance(color);node=node.parentElement;}
  return (Math.max(fg,bg??1)+.05)/(Math.min(fg,bg??1)+.05);
 });
 assert(await contrast(page.getByRole('checkbox',{name:/Galeria/}).locator('..').locator('b'))>=4.5,'Section price contrast');
 assert(await contrast(page.locator('[data-testid=estimate]'))>=4.5,'Estimate contrast');
 await page.getByRole('button',{name:'Continuar →',exact:true}).click();
 await page.getByRole('button',{name:/^Elegante/}).click();
 await page.getByRole('button',{name:/^Argila/}).click();
 await page.getByRole('button',{name:'Continuar →',exact:true}).click();
 await page.getByLabel('Página adicional').check();
 await page.getByLabel('Formulário por e-mail').check();
 await page.getByLabel('Contatos esperados por mês').selectOption('mais50');
 await page.getByRole('button',{name:'Ver meu projeto →',exact:true}).click();
 const current=await page.locator('[data-testid=estimate]').innerText();
 const wa=await page.getByRole('link',{name:'Conversar sobre este projeto ↗'}).getAttribute('href');
 const message=new URL(wa).searchParams.get('text');
 assert(message.includes('Aurora Teste'));assert(message.includes(current));assert(message.includes('mais50'));assert(wa.startsWith('https://wa.me/5551981947979'));
 await page.getByRole('button',{name:'Copiar link',exact:true}).click();
 const link=await page.getByLabel('Link para compartilhar').inputValue();
 assert(!decodeURIComponent(link).includes('Aurora Teste'));assert(!decodeURIComponent(link).includes('Cuidados com a sua rotina.'));
 await page.getByRole('button',{name:'Editar ↗',exact:true}).first().click();
 assert.equal(await page.getByLabel('Nome do negócio').inputValue(),'Aurora Teste');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('mb.configurador.v2')).name==='Aurora Teste');
 await page.reload();await page.waitForFunction(()=>document.querySelector('input[autocomplete=organization]')?.value==='Aurora Teste');assert.equal(await page.getByLabel('Nome do negócio').inputValue(),'Aurora Teste');
 await page.goto(base+new URL(link).hash);
 await page.getByRole('link',{name:'Conversar sobre este projeto ↗'}).waitFor();
 assert.equal(await page.locator('[data-testid=estimate]').innerText(),current);
 await page.screenshot({path:path.join(artifacts,'summary.png'),fullPage:true});
 await page.pdf({path:path.join(artifacts,'resumo-exemplo.pdf'),format:'A4',printBackground:true});
 await page.getByRole('button',{name:'Começar novamente',exact:true}).click();
 await page.getByRole('button',{name:'Sim, começar novamente',exact:true}).click();
 assert.equal(await page.getByLabel('Nome do negócio').inputValue(),'');
 assert.equal(await page.locator('[data-testid=estimate]').innerText(),'R$ 500 – R$ 550');
 // Mobile journey and overflow at phone/tablet/desktop widths.
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base);await page.screenshot({path:path.join(artifacts,'mobile-top.png')});await page.getByLabel('Nome do negócio').fill('Projeto Mobile');
 await page.locator('#configurador').screenshot({path:path.join(artifacts,'mobile-editor.png')});
 assert(await contrast(page.locator('[class*="mobileEstimate"] strong'))>=4.5,'Mobile estimate contrast');
 await page.getByRole('button',{name:'Ver prévia',exact:true}).click();
 await page.getByRole('button',{name:'Prévia no celular'}).click();
 await page.locator('#configurador').screenshot({path:path.join(artifacts,'mobile-preview-detail.png')});
 await page.screenshot({path:path.join(artifacts,'mobile-preview.png'),fullPage:true});
 await page.getByRole('button',{name:'← Voltar à configuração'}).click();
 for(let i=0;i<4;i++)await page.getByRole('button',{name:'Continuar →',exact:true}).click();
 await page.getByRole('button',{name:'Ver meu projeto →',exact:true}).click();
 assert(await page.getByRole('link',{name:'Conversar sobre este projeto ↗'}).isVisible());
 await page.screenshot({path:path.join(artifacts,'mobile.png'),fullPage:true});
 // Bad state/hash cannot crash the page.
 await page.evaluate(()=>localStorage.setItem('mb.configurador.v2','{invalid'));
 await page.goto(base+'#projeto=%ZZ');await page.reload();
 await page.getByRole('button',{name:'Continuar →',exact:true}).waitFor();
 await page.evaluate(()=>localStorage.setItem('mb.configurador.v2',JSON.stringify({version:2,features:{bad:true},sections:[null,'unknown'],custom:'javascript:alert(1)',step:999})));
 await page.goto(base);await page.reload();
 await page.getByRole('link',{name:'Conversar sobre este projeto ↗'}).waitFor();
 await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
 assert.equal(await page.locator('a[href*="seuinstagram"],a[href*="seudominio"]').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS desktop/mobile journeys, editing, persistence, reset, share, WhatsApp consistency, invalid input, keyboard focus, overflow (5 widths), print PDF; no runtime errors; no messages sent.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});




