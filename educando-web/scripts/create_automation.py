#!/usr/bin/env python3
from pathlib import Path
import json
OUT=Path(__file__).resolve().parents[1]/'automation'
def node(id,name,type,parameters,position,version=1):return {'id':id,'name':name,'type':'n8n-nodes-base.'+type,'typeVersion':version,'position':position,'parameters':parameters}
def write(name,nodes,connections,extra=None):
 data={'name':name,'active':False,'nodes':nodes,'connections':connections,'settings':{'executionOrder':'v1','timezone':'Europe/Madrid','saveDataSuccessExecution':'none','saveDataErrorExecution':'all'},'tags':[]}
 if extra:data.update(extra)
 (OUT/(name.split(' · ')[0]+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2))
start=node('manual','Prueba manual','manualTrigger',{},[0,0])
config=node('targets','Destinos a revisar','code',{'jsCode':"return [{json:{url:'https://educandoconchispa.com/',system:'web'}}];"},[240,0],2)
http=node('http','Comprobar HTTP','httpRequest',{'url':'={{ $json.url }}','options':{'timeout':10000,'response':{'response':{'fullResponse':True,'neverError':True}}}},[480,0],4.2);http['onError']='continueRegularOutput'
evaluate=node('evaluate','Resultado para revisión','code',{'jsCode':"return $input.all().map((item,i)=>({json:{system:$('Destinos a revisar').all()[i]?.json.system||'unknown',checked_at:new Date().toISOString(),status:Number(item.json.statusCode||0),ok:Number(item.json.statusCode||0)>=200&&Number(item.json.statusCode||0)<400,error:item.json.error?.message||null,notification_sent:false}}));"},[720,0],2)
write('01-health-review · comprobar sin notificar',[start,config,http,evaluate],{'Prueba manual':{'main':[[{'node':'Destinos a revisar','type':'main','index':0}]]},'Destinos a revisar':{'main':[[{'node':'Comprobar HTTP','type':'main','index':0}]]},'Comprobar HTTP':{'main':[[{'node':'Resultado para revisión','type':'main','index':0}]]}})
seed=node('sample','Consulta ficticia','code',{'jsCode':"return [{json:{request_id:'LOCAL-TEST-001',name:'Prueba local',email:'example@example.invalid',segment:'empresa',message:'Consulta ficticia, sin envío',privacy_notice_accepted:true,marketing_opt_in:false}}];"},[240,0],2)
validate=node('validate','Validar sin guardar','code',{'jsCode':"return $input.all().map(({json:x})=>{const errors=[];const segment=['docente','centro','empresa','fpe','territorio','otro'].includes(x.segment)?x.segment:'otro';if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(x.email||'')))errors.push('email');if(!x.request_id)errors.push('request_id');if(x.privacy_notice_accepted!==true)errors.push('privacy_notice');if(String(x.message||'').length>1800)errors.push('message_length');return {json:{request_id:String(x.request_id||'').slice(0,100),valid:errors.length===0,errors,segment,marketing_opt_in:x.marketing_opt_in===true,stored:false,notification_sent:false,mode:'validation_only'}};});"},[480,0],2)
write('02-leads-review · validar sin enviar',[start,seed,validate],{'Prueba manual':{'main':[[{'node':'Consulta ficticia','type':'main','index':0}]]},'Consulta ficticia':{'main':[[{'node':'Validar sin guardar','type':'main','index':0}]]}})
backlog=node('brief','Brief editorial','code',{'jsCode':"return [{json:{topic:'Un proceso concreto que merece automatizarse',audience:'empresas y organizaciones',sources:[],status:'draft',approved:false,contains_client_details:false}}];"},[240,0],2)
gate=node('gate','Puerta editorial','code',{'jsCode':"return $input.all().map(({json:x})=>({json:{...x,status:'needs_human_review',publish:false,missing_evidence:(x.sources||[]).length===0,notification_sent:false}}));"},[480,0],2)
write('03-editorial-review · propuesta sin publicar',[start,backlog,gate],{'Prueba manual':{'main':[[{'node':'Brief editorial','type':'main','index':0}]]},'Brief editorial':{'main':[[{'node':'Puerta editorial','type':'main','index':0}]]}})
print('3 inactive manual workflows written')
