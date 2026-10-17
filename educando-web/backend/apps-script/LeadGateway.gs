/** Educando con chIspA — gateway genérico de leads. Candidato no desplegado.
 * Guarda antes de avisar. n8n/IA no forman parte del camino crítico.
 * Usa una hoja dedicada; no reutiliza el histórico del lead magnet sin migración explícita.
 */
function cfg_(){
 const p=PropertiesService.getScriptProperties();
 const c={sheetId:p.getProperty('LEADS_SHEET_ID'),sheetName:p.getProperty('LEADS_SHEET_NAME')||'Leads',owner:p.getProperty('OWNER_EMAIL')||'',ingressToken:p.getProperty('INGRESS_TOKEN')||'',dry:p.getProperty('DRY_RUN')!=='false',hourly:Number(p.getProperty('MAX_LEADS_PER_HOUR')||40)};
 if(!c.sheetId||!c.owner||c.ingressToken.length<24||!Number.isInteger(c.hourly)||c.hourly<1||c.hourly>200)throw new Error('CONFIG');
 return c;
}
function txt_(v,n){if(v==null)return'';if(typeof v!=='string')throw new Error('INPUT');const s=v.trim();if(s.length>n)throw new Error('INPUT');return s;}
function safeCell_(s){return /^[\s]*[=+@-]/.test(s)?"'"+s:s;}
function esc_(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function parse_(e,c){
 const raw=e&&e.postData&&e.postData.contents;if(!raw||raw.length>12000)throw new Error('INPUT');
 const x=JSON.parse(raw);if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('INPUT');
 if(txt_(x.ingress_token,200)!==c.ingressToken)throw new Error('AUTH');
 if(txt_(x.company,500))throw new Error('HONEYPOT');if(x.consentimiento!==true)throw new Error('CONSENT');
 const email=txt_(x.email,254).toLowerCase();if(!/^[^\s@,;<>\r\n]+@[^\s@,;<>\r\n]+\.[^\s@,;<>\r\n]+$/.test(email))throw new Error('EMAIL');
 const branch=['education','business','experiences','speaking','other'].includes(x.branch)?x.branch:'other';
 return {requestId:txt_(x.request_id,100)||Utilities.getUuid(),nombre:txt_(x.nombre,100).replace(/[\r\n]/g,' ')||'Sin nombre',email,telefono:txt_(x.telefono,40),perfil:txt_(x.perfil,120),branch,mensaje:txt_(x.mensaje,1800),marketing:x.marketing_opt_in===true,sourcePage:txt_(x.source_page,300),sourceCta:txt_(x.source_cta,120),utmSource:txt_(x.utm_source,120),utmMedium:txt_(x.utm_medium,120),utmCampaign:txt_(x.utm_campaign,180),referrer:txt_(x.referrer,500)};
}
function label_(b){return ({education:'EDUCACIÓN',business:'EMPRESA',experiences:'EXPERIENCIAS',speaking:'CHARLAS',other:'OTRO'})[b]||'OTRO';}
function reserve_(c){const p=PropertiesService.getScriptProperties(),bucket=new Date().toISOString().slice(0,13),n=p.getProperty('LEAD_HOUR')===bucket?Number(p.getProperty('LEAD_ATTEMPTS')||0):0;if(!Number.isFinite(n)||n>=c.hourly)throw new Error('QUOTA');p.setProperties({LEAD_HOUR:bucket,LEAD_ATTEMPTS:String(n+1)});}
function findRequest_(sheet,id){if(sheet.getLastRow()<2)return false;const ids=sheet.getRange(2,2,sheet.getLastRow()-1,1).getValues();return ids.some(r=>String(r[0])===id);}
function headers_(){return ['Fecha','Request_ID','Nombre','Email','Telefono','Perfil','Rama','Mensaje','Privacidad','Marketing','Source_Page','Source_CTA','UTM_Source','UTM_Medium','UTM_Campaign','Referrer','Estado'];}
function notify_(c,d){
 const subject='NUEVO LEAD · '+label_(d.branch)+' · Educando con chIspA';
 const body=['Nombre: '+d.nombre,'Email: '+d.email,'Teléfono: '+(d.telefono||'—'),'Perfil: '+(d.perfil||'—'),'Rama: '+label_(d.branch),'Página: '+(d.sourcePage||'—'),'CTA: '+(d.sourceCta||'—'),'Campaña: '+(d.utmCampaign||'—'),'','Mensaje:',d.mensaje].join('\n');
 MailApp.sendEmail({to:c.owner,replyTo:d.email,name:'Educando con chIspA · Leads',subject,body,htmlBody:'<p><strong>'+esc_(subject)+'</strong></p><p><b>Nombre:</b> '+esc_(d.nombre)+'<br><b>Email:</b> '+esc_(d.email)+'<br><b>Teléfono:</b> '+esc_(d.telefono||'—')+'<br><b>Perfil:</b> '+esc_(d.perfil||'—')+'<br><b>Página:</b> '+esc_(d.sourcePage||'—')+'<br><b>CTA:</b> '+esc_(d.sourceCta||'—')+'</p><p><b>Mensaje</b><br>'+esc_(d.mensaje).replace(/\n/g,'<br>')+'</p>'});
}
function out_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function doPost(e){
 let d,c;try{c=cfg_();d=parse_(e,c);}catch(err){return out_({status:'error',code:['CONSENT','EMAIL','HONEYPOT','INPUT'].includes(err.message)?err.message:'INVALID_REQUEST'});}
 if(c.dry)return out_({status:'validated',stored:false,notified:false});
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return out_({status:'error',code:'BUSY'});
 let sheet,row;
 try{
  reserve_(c);sheet=SpreadsheetApp.openById(c.sheetId).getSheetByName(c.sheetName);if(!sheet)throw new Error('SHEET');
  const h=headers_();if(sheet.getMaxColumns()<h.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),h.length-sheet.getMaxColumns());
  if(sheet.getLastRow()===0)sheet.appendRow(h);else{const current=sheet.getRange(1,1,1,h.length).getValues()[0];if(current.join('|')!==h.join('|'))throw new Error('HEADERS');}
  if(findRequest_(sheet,d.requestId))return out_({status:'ok',code:'duplicate_request',stored:true,notified:false});
  sheet.appendRow([new Date(),safeCell_(d.requestId),safeCell_(d.nombre),safeCell_(d.email),safeCell_(d.telefono),safeCell_(d.perfil),d.branch,safeCell_(d.mensaje),'Sí',d.marketing?'Sí':'No',safeCell_(d.sourcePage),safeCell_(d.sourceCta),safeCell_(d.utmSource),safeCell_(d.utmMedium),safeCell_(d.utmCampaign),safeCell_(d.referrer),'GUARDADO']);
  row=sheet.getLastRow();SpreadsheetApp.flush();
 }catch(err){console.error('LeadGateway STORE_FAILED '+err.message);return out_({status:'error',code:err.message==='QUOTA'?'QUOTA':'STORE_FAILED'});}
 finally{lock.releaseLock();}
 let notified=false;try{notify_(c,d);notified=true;sheet.getRange(row,17).setValue('AVISADO');SpreadsheetApp.flush();}catch(err){console.error('LeadGateway NOTICE_FAILED');try{sheet.getRange(row,17).setValue('AVISO_PENDIENTE');SpreadsheetApp.flush();}catch(e2){}}
 return out_({status:'success',code:notified?'STORED_AND_NOTIFIED':'STORED_NOTICE_PENDING',stored:true,notified});
}
