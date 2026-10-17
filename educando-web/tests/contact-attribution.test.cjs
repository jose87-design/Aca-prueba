const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function environment(){
 const saved=new Map(),listeners={};
 const anchor={href:'https://staging.example/contacto/index.html',addEventListener(type,fn){listeners[type]=fn;}};
 const document={referrer:'https://referrer.example/education?private=hidden#fragment',documentElement:{classList:{add(){},toggle(){},remove(){}}},querySelector(){return null;},querySelectorAll(selector){return selector==='a[href]'?[anchor]:[];},addEventListener(){}};
 const context=vm.createContext({document,window:{matchMedia(){return {matches:true,addEventListener(){}};}},location:new URL('https://staging.example/pymes/?utm_source=social&utm_medium=bio&utm_campaign=launch'),URL,URLSearchParams,Date,clearInterval,sessionStorage:{setItem(k,v){saved.set(k,v);},getItem(k){return saved.get(k)||null;},removeItem(k){saved.delete(k);}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../public/assets/site.js'),'utf8'),context);
 return {context,anchor,saved,click(){listeners.click();}};
}
for(const [branch,cta,summary] of [['business','process-diagnostic','Diagnóstico de proceso privado'],['experiences','project-brief','Brief con contexto privado']]){
 test(`${cta}: dynamically generated Contact link keeps branch, UTM and private summary`,()=>{
  const env=environment();env.anchor.href=env.context.contactUrl(branch,summary,cta);env.click();
  const attribution=JSON.parse(env.saved.get('chispa-contact-attribution-v1'));
  assert.equal(attribution.branch,branch);assert.equal(attribution.source_cta,cta);assert.equal(attribution.utm_source,'social');assert.equal(attribution.utm_campaign,'launch');assert.equal(attribution.referrer,'https://referrer.example/education');
  const destination=new URL(env.anchor.href);assert.equal(destination.searchParams.get('branch'),branch);assert.equal(destination.searchParams.get('summary'),null);assert(!env.anchor.href.includes('privado'));
  assert.equal(env.context.takeContactSummary(branch),summary);assert.equal(env.context.takeContactSummary(branch),'');
 });
}
