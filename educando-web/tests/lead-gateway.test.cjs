const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../backend/apps-script/LeadGateway.gs'),'utf8');
function setup(options={}){
 const rows=[];const props={LEADS_SHEET_ID:'sheet',LEADS_SHEET_NAME:'Leads',OWNER_EMAIL:'owner@example.test',INGRESS_TOKEN:'test-ingress-token-1234567890',DRY_RUN:'false',MAX_LEADS_PER_HOUR:'40',...options.props};const calls={mail:[],released:0};
 let cols=17;
 const sheet={getLastRow:()=>rows.length,getMaxColumns:()=>cols,insertColumnsAfter:(after,n)=>{cols+=n;},appendRow:r=>rows.push(r),getRange:(r,c,n=1,m=1)=>({getValues:()=>rows.slice(r-1,r-1+n).map(x=>Array.from({length:m},(_,j)=>x[c-1+j]??'')),setValue:v=>{rows[r-1][c-1]=v;}})};
 const ctx={console:{error:()=>{}},Utilities:{getUuid:()=> 'generated-id'},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperties:v=>Object.assign(props,v)})},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})},LockService:{getScriptLock:()=>({tryLock:()=>!options.busy,releaseLock:()=>calls.released++})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},MailApp:{sendEmail:m=>{calls.mail.push(m);if(options.noticeFail)throw Error('mail');}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const post=(data={})=>ctx.doPost({postData:{contents:JSON.stringify({request_id:'req-1',nombre:'Ana',email:'ana@example.test',consentimiento:true,ingress_token:'test-ingress-token-1234567890',branch:'business',perfil:'Empresa u organización',mensaje:'Necesito revisar un proceso',...data})}});
 return {post,rows,calls,props};
}
test('rejects without privacy consent and honeypot',()=>{for(const d of [{consentimiento:false},{company:'spam'}]){const s=setup();assert.equal(s.post(d).status,'error');assert.equal(s.rows.length,0);assert.equal(s.calls.mail.length,0);}});
test('dry run validates without storing or notifying',()=>{const s=setup({props:{DRY_RUN:'true'}});assert.equal(s.post().status,'validated');assert.equal(s.rows.length,0);assert.equal(s.calls.mail.length,0);});
test('stores before notification and alerts owner for lead without phone',()=>{const s=setup();const r=s.post({telefono:''});assert.equal(r.code,'STORED_AND_NOTIFIED');assert.equal(s.rows.length,2);assert.equal(s.rows[1][6],'business');assert.equal(s.rows[1][16],'AVISADO');assert.equal(s.calls.mail.length,1);assert.match(s.calls.mail[0].subject,/EMPRESA/);});
test('owner notification failure keeps stored lead pending',()=>{const s=setup({noticeFail:true});const r=s.post();assert.equal(r.status,'success');assert.equal(r.stored,true);assert.equal(r.notified,false);assert.equal(s.rows[1][16],'AVISO_PENDIENTE');});
test('request id makes retries idempotent',()=>{const s=setup();assert.equal(s.post().status,'success');const r=s.post();assert.equal(r.code,'duplicate_request');assert.equal(s.rows.length,2);assert.equal(s.calls.mail.length,1);});
test('spreadsheet formulas are neutralised',()=>{const s=setup();s.post({nombre:'=IMPORTXML("x")',mensaje:'+cmd'});assert.equal(s.rows[1][2][0],"'");assert.equal(s.rows[1][7][0],"'");});

test('rejects direct calls without server ingress token',()=>{const s=setup();const r=s.post({ingress_token:''});assert.equal(r.status,'error');assert.equal(s.rows.length,0);assert.equal(s.calls.mail.length,0);});

test('duplicate retry does not consume another hourly slot',()=>{const s=setup();const first=s.post({request_id:'retry-safe-123'});assert.equal(first.status,'success');const before=s.props.LEAD_ATTEMPTS;const second=s.post({request_id:'retry-safe-123'});assert.equal(second.code,'duplicate_request');assert.equal(s.props.LEAD_ATTEMPTS,before);assert.equal(s.rows.length,2);});
