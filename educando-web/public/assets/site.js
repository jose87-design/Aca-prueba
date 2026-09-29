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
let paused=reduce.matches;let timer=null;let observer=null;
const word=document.querySelector('.rotating');const words=['la formación','la automatización','el prototipo','la implementación'];let index=0;
function applyMotion(){
 document.documentElement.classList.toggle('motion-off',paused);
 motion?.setAttribute('aria-pressed',String(paused));if(motion)motion.textContent=paused?'Activar movimiento':'Pausar movimiento';
 if(timer){clearInterval(timer);timer=null;}
 observer?.disconnect();document.querySelectorAll('.reveal').forEach(el=>el.classList.remove('pending'));
 document.documentElement.classList.remove('motion-enabled');
 if(paused)return;
 if('IntersectionObserver' in window){
  document.documentElement.classList.add('motion-enabled');
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('pending');observer.observe(el);}});
 }
 if(word)timer=setInterval(()=>{index=(index+1)%words.length;word.textContent=words[index];},3600);
}
motion?.addEventListener('click',()=>{paused=!paused;applyMotion();});reduce.addEventListener('change',e=>{paused=e.matches;applyMotion();});applyMotion();
document.querySelector('#contact-draft')?.addEventListener('submit',e=>{
 e.preventDefault();const form=e.currentTarget;const data=new FormData(form);
 const subject='Consulta '+data.get('context')+' · Educando con chIspA';
 const body='Nombre: '+data.get('name')+'\nContexto: '+data.get('context')+'\n\n'+data.get('message');
 const result=document.querySelector('#draft-result');result.replaceChildren();
 const p=document.createElement('p');p.textContent='Tu borrador está preparado. Revisa el mensaje en tu aplicación de correo y envíalo cuando quieras. Esta página no lo ha enviado ni guardado.';
 const a=document.createElement('a');a.className='btn primary';a.href='mailto:educandoconchispa@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);a.textContent='Abrir mi correo →';
 result.append(p,a);result.hidden=false;
});
