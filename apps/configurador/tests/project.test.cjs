// Run: node tests/project.test.cjs (after npm ci). Uses the installed TypeScript compiler.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(__dirname, '../src', request.slice(2));
  return original.call(this, request, ...rest);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);
const model = require('../src/lib/project.ts');
const {pricing} = require('../src/config/pricing.ts');
const {estimate} = require('../src/lib/estimate.ts');
let count=0;
function test(name,fn){fn(); count++; console.log('PASS',name);}
test('Base reachable and rules unchanged',()=>{
 const p=model.initialProject(),e=model.projectEstimate(p);
 assert.equal(e.total,500);assert.equal(e.min,500);assert.equal(e.max,550);assert.equal(e.deadline,'3–5 dias úteis');
});
test('All segment/objective/direction combinations preserve price across save/share/WhatsApp',()=>{
 for(const segment of model.segments)for(const objective of model.objectives)for(const direction of model.directions){
  const p=model.normalizeProject({...model.initialProject(),segment:segment.id,objective:objective.id,direction:direction.id,name:'Nome privado',description:'Conteúdo privado',features:['whatsapp','redes','paginaExtra','agendamento']});
  p.sections=model.recommendations(p);const n=model.normalizeProject(p),e=model.projectEstimate(n);
  assert.deepEqual(e,estimate(model.selectionFor(n)));
  assert.deepEqual(model.projectEstimate(model.normalizeProject(JSON.parse(JSON.stringify(n)))),e);
  const link=model.shareLink(n);assert(!decodeURIComponent(link).includes('privado'));
  const shared=model.fromShare(new URL(link).hash);assert.equal(shared.name,'');assert.equal(shared.description,'');assert.deepEqual(model.projectEstimate(shared),e);
  assert(model.projectMessage(n).includes(model.priceLabel(n)));assert(model.projectMessage(n).includes(e.deadline));
 }
});
test('Invalid storage is safe and cannot add unknown pricing or duplicate charges',()=>{
 for(const input of [null,[],42,'bad',{}, {version:999}])assert.deepEqual(model.normalizeProject(input),model.initialProject());
 const n=model.normalizeProject({version:2,name:{},description:[],segment:'invalid',objective:[],direction:'__proto__',palette:'invalid',custom:'url(javascript:bad)',features:['galeria','galeria','bad','paginaExtra','paginaExtra'],sections:['galeria','galeria','bad'],step:999,type:'__proto__',legacyTemplate:'constructor'});
 assert.equal(n.step,5);assert.equal(n.custom,null);assert.equal(n.legacyTemplate,undefined);assert.equal(n.type,'landing');assert.equal(n.features.filter(f=>f==='galeria').length,1);assert.equal(n.features.filter(f=>f==='paginaExtra').length,1);assert(n.sections.includes('contato'));assert(Number.isFinite(model.projectEstimate(n).total));
 assert.throws(()=>model.fromShare('#projeto=%ZZ'));assert.throws(()=>model.fromShare('#projeto='+encodeURIComponent('{"version":6}')));
});
test('Removing priced sections removes their charge and leaves unrelated features',()=>{
 const p=model.normalizeProject({...model.initialProject(),sections:['apresentacao','contato','galeria'],features:['catalogo']});
 const q=model.normalizeProject({...p,sections:p.sections.filter(x=>x!=='galeria')});
 assert.equal(model.projectEstimate(p).total-model.projectEstimate(q).total,pricing.byFeature.galeria);assert(q.features.includes('catalogo'));assert(!q.features.includes('galeria'));
});
test('Every preset has its recommended sections and valid totals',()=>{for(const s of model.segments){const p=model.exampleProject(s.id);assert.deepEqual(p.sections,model.recommendations(p));assert(model.projectEstimate(p).min>=pricing.base);}});
test('Legacy data preserves priced options safely',()=>{const p=model.migrateLegacy({selection:{company:'Empresa',type:'local',template:'premium',style:'premium',features:['galeria','formulario','instagram'],customColor:{accent:'#ffffff'},emailVolume:'mais50'}});assert.equal(p.name,'Empresa');assert.equal(p.legacyTemplate,'premium');assert(p.sections.includes('galeria'));assert(!p.features.includes('formulario'));assert.equal(p.custom,'#ffffff');});
test('Custom button text contrast is at least WCAG AA',()=>{
 const lum=h=>{const c=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
 for(let i=0;i<0xffffff;i+=3571){const hex='#'+i.toString(16).padStart(6,'0'),a=lum(hex),b=lum(model.contrastInk(hex));assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5);}
});
console.log(`${count} suites passed; 90 combinations and 4,699 color samples verified.`);
