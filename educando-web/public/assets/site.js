'use strict';
document.documentElement.classList.add('js');
const nav=document.querySelector('.links');
const menu=document.querySelector('.menu');
function closeMenu(){if(!menu||!nav)return;nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menú';}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Cerrar':'Menú';});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();menu.focus();}});

const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const motion=document.querySelector('.motion-control');
let paused=reduce.matches,timer=null,observer=null;
const word=document.querySelector('.rotating'),words=['la formación','la automatización','el prototipo','la implementación'];let index=0;
function applyMotion(){
 document.documentElement.classList.toggle('motion-off',paused);
 motion?.setAttribute('aria-pressed',String(paused));if(motion)motion.textContent=paused?'Activar movimiento':'Pausar movimiento';
 if(timer){clearInterval(timer);timer=null;} observer?.disconnect();
 document.querySelectorAll('.reveal').forEach(el=>el.classList.remove('pending'));document.documentElement.classList.remove('motion-enabled');
 if(paused)return;
 if('IntersectionObserver' in window){document.documentElement.classList.add('motion-enabled');observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('pending');observer.observe(el);}});}
 if(word)timer=setInterval(()=>{index=(index+1)%words.length;word.textContent=words[index];},3600);
}
motion?.addEventListener('click',()=>{paused=!paused;applyMotion();});reduce.addEventListener('change',e=>{paused=e.matches;applyMotion();});applyMotion();

function params(){return new URLSearchParams(location.search);}
function branchLabel(branch){return ({education:'Educación y formación',business:'Empresa y automatización',experiences:'Proyecto o experiencia',speaking:'Charlas y eventos',other:'Otra consulta'})[branch]||'Otra consulta';}
function privacySafeReferrer(){
 if(!document.referrer)return'';
 try{const u=new URL(document.referrer);return (u.origin+u.pathname).slice(0,500);}catch{return'';}
}
function readAttribution(branch){
 const q=params();
 return {branch,source_page:location.pathname,source_cta:q.get('cta')||'',utm_source:q.get('utm_source')||'',utm_medium:q.get('utm_medium')||'',utm_campaign:q.get('utm_campaign')||'',referrer:privacySafeReferrer()};
}
const CONTACT_SUMMARY_KEY='chispa-contact-summary-v1';
function saveContactSummary(branch,summary){
 if(!summary)return;
 try{sessionStorage.setItem(CONTACT_SUMMARY_KEY,JSON.stringify({branch,summary:summary.slice(0,1500),ts:Date.now()}));}catch{}
}
function takeContactSummary(branch){
 try{
  const raw=sessionStorage.getItem(CONTACT_SUMMARY_KEY);if(!raw)return'';
  sessionStorage.removeItem(CONTACT_SUMMARY_KEY);
  const data=JSON.parse(raw);
  if(!data||data.branch!==branch||Date.now()-Number(data.ts)>15*60*1000)return'';
  return String(data.summary||'').slice(0,1500);
 }catch{return'';}
}
function contactUrl(branch,summary,cta){
 saveContactSummary(branch,summary);
 const u=new URL('../contacto/index.html',location.href);u.searchParams.set('branch',branch);if(cta)u.searchParams.set('cta',cta);return u.href;
}

document.querySelectorAll('[data-branch-link]').forEach(a=>{
 const branch=a.dataset.branchLink||'other',cta=a.dataset.cta||'';
 const u=new URL(a.href,location.href);u.searchParams.set('branch',branch);if(cta)u.searchParams.set('cta',cta);a.href=u.href;
});

const leadForm=document.querySelector('#lead-form');
if(leadForm){
 const q=params(),branch=q.get('branch')||leadForm.dataset.defaultBranch||'other',summary=takeContactSummary(branch);
 const branchInput=leadForm.querySelector('[name="branch"]'),context=document.querySelector('#branch-context'),message=leadForm.querySelector('[name="mensaje"]');
 if(branchInput)branchInput.value=branch;if(context)context.textContent='Contexto detectado: '+branchLabel(branch)+'. Puedes cambiarlo si tu consulta es otra.';
 const select=leadForm.querySelector('[name="perfil"]');if(select){const map={education:'Docente o centro educativo',business:'Empresa u organización',experiences:'Proyecto de territorio, cultura o evento',speaking:'Charla o evento',other:'Otro contexto'};select.value=map[branch]||map.other;}
 if(summary&&message&&!message.value)message.value=summary;
 leadForm.addEventListener('submit',async e=>{
  e.preventDefault();const submit=leadForm.querySelector('[type="submit"]'),status=document.querySelector('#lead-status');status.className='lead-status';status.hidden=false;status.textContent='Enviando…';submit.disabled=true;
  const fd=new FormData(leadForm),payload=Object.fromEntries(fd.entries());payload.consentimiento=fd.get('consentimiento')==='on';payload.marketing_opt_in=fd.get('marketing_opt_in')==='on';payload.company=payload.company||'';Object.assign(payload,readAttribution(payload.branch||branch));payload.request_id=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2));
  const endpoint=(window.CHISPA_LEADS&&window.CHISPA_LEADS.endpoint)||'';
  if(!endpoint){
    const subject='Consulta · '+branchLabel(payload.branch||branch)+' · Educando con chIspA';
    const body='Nombre: '+payload.nombre+'\nEmail: '+payload.email+'\nTeléfono: '+(payload.telefono||'')+'\nContexto: '+branchLabel(payload.branch||branch)+'\n\n'+payload.mensaje;
    const a=document.createElement('a');a.className='btn primary';a.href='mailto:educandoconchispa@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);a.textContent='Abrir mi correo →';
    status.replaceChildren(document.createTextNode('La captación automática todavía no está conectada en este entorno. No se ha guardado ningún dato. '),a);status.classList.add('error');submit.disabled=false;return;
  }
  try{
   const controller=new AbortController();const t=setTimeout(()=>controller.abort(),window.CHISPA_LEADS.timeoutMs||9000);
   const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal});clearTimeout(t);
   const data=await res.json();if(!res.ok||!['success','ok'].includes(data.status))throw new Error(data.code||'SEND_FAILED');
   status.textContent=data.notified===false?'Gracias. Tu consulta ha quedado registrada correctamente. El aviso interno ha quedado pendiente de revisión; no necesitas volver a enviarla.':'Gracias. Tu consulta ha quedado registrada y el aviso interno se ha enviado.';status.classList.add('success');leadForm.reset();
  }catch(err){status.textContent='No he podido confirmar el registro. No vuelvas a enviar varias veces: usa el email directo si tu consulta es urgente.';status.classList.add('error');}
  finally{submit.disabled=false;}
 });
}

const processDiag=document.querySelector('#process-diagnostic');
if(processDiag){
 processDiag.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(processDiag);let score=0;['repetition','rules','digital','volume','risk'].forEach(k=>score+=Number(fd.get(k)||0));let verdict='Conviene revisar el proceso antes de automatizar';let advice='Hay señales de que simplificar pasos y responsabilidades puede aportar más valor que automatizar de inmediato.';if(score>=8){verdict='Buen candidato para una prueba de automatización';advice='El proceso parece repetible y suficientemente definido. El siguiente paso es revisar datos, excepciones y herramientas antes de construir.';}else if(score>=5){verdict='Candidato parcial: automatizar sólo una parte';advice='Hay potencial, pero conviene aislar primero la parte repetitiva y mantener revisión humana en las decisiones o excepciones.';}
 const summary='Diagnóstico de proceso\nResultado: '+verdict+'\nFrecuencia/repetición: '+fd.get('repetition')+'\nReglas claras: '+fd.get('rules')+'\nDatos digitales: '+fd.get('digital')+'\nVolumen: '+fd.get('volume')+'\nRiesgo/excepciones: '+fd.get('risk');
 const out=document.querySelector('#process-result');out.hidden=false;out.querySelector('h3').textContent=verdict;out.querySelector('p').textContent=advice;out.querySelector('a').href=contactUrl('business',summary,'process-diagnostic');
 });
}

const brief=document.querySelector('#project-brief');
if(brief){
 brief.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(brief);const summary='Brief de experiencia\nPúblico: '+fd.get('audience')+'\nContexto/lugar: '+fd.get('context')+'\nObjetivo: '+fd.get('goal')+'\nFormato: '+fd.get('format')+'\nDuración: '+fd.get('duration')+'\nInteracción deseada: '+fd.get('interaction');
 const out=document.querySelector('#brief-result');out.hidden=false;out.querySelector('.brief-summary').textContent=summary;out.querySelector('a').href=contactUrl('experiences',summary,'project-brief');
 });
}
