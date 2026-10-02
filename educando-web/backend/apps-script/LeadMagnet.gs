/** Educando con chIspA. Candidate replacement, not deployed.
 * Nine existing columns preserved. Configure Script Properties; DRY_RUN defaults on.
 * Mail acceptance and Sheets persistence are not atomic; ambiguous sends require review.
 */
function config_() {
  const p = PropertiesService.getScriptProperties();
  const c = { sheetId: p.getProperty('SHEET_ID'), sheetName: p.getProperty('SHEET_NAME') || 'Hoja 1', pdfId: p.getProperty('PDF_FILE_ID'), owner: p.getProperty('OWNER_EMAIL') || '', dryRun: p.getProperty('DRY_RUN') !== 'false', hourly: Number(p.getProperty('MAX_SENDS_PER_HOUR') || 20) };
  if (!c.sheetId || !c.pdfId || !Number.isInteger(c.hourly) || c.hourly < 1 || c.hourly > 100) throw new Error('CONFIG');
  return c;
}
function text_(value, max) {
  if (value == null) return '';
  if (typeof value !== 'string') throw new Error('INPUT');
  const s = value.trim(); if (s.length > max) throw new Error('INPUT'); return s;
}
function input_(e) {
  const raw = e && e.postData && e.postData.contents;
  if (!raw || raw.length > 8000) throw new Error('INPUT');
  const d = JSON.parse(raw);
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('INPUT');
  if (text_(d.company, 500)) throw new Error('HONEYPOT');
  if (d.consentimiento !== true) throw new Error('CONSENT');
  const email = text_(d.email, 254).toLowerCase();
  if (!/^[^\s@,;<>\r\n]+@[^\s@,;<>\r\n]+\.[^\s@,;<>\r\n]+$/.test(email)) throw new Error('EMAIL');
  return { nombre: text_(d.nombre, 100).replace(/[\r\n]/g, ' ') || 'hola', email: email, telefono: text_(d.telefono, 40), perfil: text_(d.perfil, 100), mensaje: text_(d.mensaje, 1800) };
}
function cell_(s) { return /^[\s]*[=+@-]/.test(s) ? "'" + s : s; }
function html_(s) { return s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function capitalizar_(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function existing_(sheet, email) {
  if (sheet.getLastRow() < 2) return '';
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][2]).trim().toLowerCase() !== email) continue;
    const state = String(rows[i][7]).trim().toUpperCase();
    if (state.indexOf('ENVIADO') === 0 || state === 'ACEPTADO_ENVIO') return 'already_processed';
    if (['PENDIENTE','ENVIANDO','REVISION_ENVIO'].indexOf(state) >= 0) return 'review_required';
  }
  return '';
}
function reserveBudget_(c) {
  // Persistent hourly attempt counter under the script lock. Does not replace captcha.
  const p = PropertiesService.getScriptProperties();
  const bucket = new Date().toISOString().slice(0, 13);
  const previous = p.getProperty('SEND_HOUR') === bucket ? Number(p.getProperty('SEND_ATTEMPTS') || 0) : 0;
  if (!Number.isFinite(previous) || previous >= c.hourly || MailApp.getRemainingDailyQuota() < 1) throw new Error('QUOTA');
  p.setProperties({ SEND_HOUR: bucket, SEND_ATTEMPTS: String(previous + 1) });
}
function sendPdf_(c, d, blob) {
  const name = capitalizar_(d.nombre);
  MailApp.sendEmail({
    to: d.email, replyTo: c.owner || undefined, name: 'Educando con chIspA',
    subject: name + ', aquí tienes tu Diagnóstico CHISPA',
    body: 'Hola ' + name + ',\n\nAquí tienes el Diagnóstico CHISPA adjunto en PDF.\n\nEn educación buscamos mejor aprendizaje. Si quieres aterrizarlo a tu contexto, responde indicando centro y etapa, objetivo con la IA y una dificultad actual.\n\nJosé Luis · Educando con chIspA\nhttps://educandoconchispa.com/',
    htmlBody: '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#333"><p>Hola <strong>' + html_(name) + '</strong>,</p><p>Aquí tienes el Diagnóstico CHISPA que solicitaste, adjunto en PDF.</p><p><strong>En educación no buscamos máxima productividad, buscamos mejor aprendizaje.</strong> El riesgo real no es la IA, es el sedentarismo intelectual.</p><p>Si quieres aterrizarlo a tu contexto, responde indicando:</p><ol><li>Tipo de centro y etapa.</li><li>Objetivo principal con la IA.</li><li>Una dificultad que os pese en el claustro.</li></ol><p>Un abrazo,<br>José Luis<br><a href="https://educandoconchispa.com/">Educando con chIspA</a></p></div>',
    attachments: [blob]
  });
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  let d, c;
  try { d = input_(e); c = config_(); }
  catch (err) { return json_({status:'error',code:['CONSENT','EMAIL','HONEYPOT','INPUT'].indexOf(err.message)>=0 ? err.message : 'INVALID_REQUEST'}); }
  // Dry run validates only; no Sheets writes, file retrieval or email.
  if (c.dryRun) return json_({status:'validated',sent:false});
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({status:'error',code:'BUSY'});
  let accepted = false, row = null, sheet = null;
  try {
    sheet = SpreadsheetApp.openById(c.sheetId).getSheetByName(c.sheetName);
    if (!sheet || sheet.getLastRow() < 1 || sheet.getMaxColumns() < 9) throw new Error('SHEET');
    const old = existing_(sheet, d.email);
    if (old) return json_({status:old === 'already_processed' ? 'ok' : 'error',code:old,sent:false});
    const file = DriveApp.getFileById(c.pdfId);
    if (file.getMimeType() !== 'application/pdf') throw new Error('PDF');
    const blob = file.getBlob();
    if (blob.getBytes().length > 20 * 1024 * 1024) throw new Error('PDF');
    reserveBudget_(c);
    const now = new Date();
    sheet.appendRow([now,cell_(d.nombre),cell_(d.email),cell_(d.telefono),cell_(d.perfil),cell_(d.mensaje),'Sí','PENDIENTE','']);
    row = sheet.getLastRow();
    sheet.getRange(row, 7).setNote('Consentimiento booleano recibido; versión LeadMagnet v2. Solo solicitud del recurso.');
    SpreadsheetApp.flush();
    sheet.getRange(row, 8).setValue('ENVIANDO'); SpreadsheetApp.flush();
    try { sendPdf_(c, d, blob); accepted = true; }
    catch (err) {
      // Do not automatically resend: the provider's acceptance may be uncertain.
      sheet.getRange(row, 8).setValue('REVISION_ENVIO'); SpreadsheetApp.flush();
      return json_({status:'error',code:'SEND_REVIEW_REQUIRED'});
    }
    sheet.getRange(row, 8, 1, 2).setValues([['ACEPTADO_ENVIO',new Date()]]); SpreadsheetApp.flush();
  } catch (err) {
    console.error('LeadMagnet: ' + (accepted ? 'SEND_ACCEPTED_PERSISTENCE_FAILED' : 'PROCESS_FAILED'));
    return json_({status:'error',code:accepted ? 'SEND_ACCEPTED_PERSISTENCE_FAILED' : (err.message === 'QUOTA' ? 'QUOTA' : 'PROCESS_FAILED')});
  } finally { lock.releaseLock(); }
  // A commercial notification failure never changes the PDF result.
  if (accepted && d.telefono && c.owner) {
    try {
      if (MailApp.getRemainingDailyQuota() > 0) MailApp.sendEmail({to:c.owner,subject:'Lead con teléfono en chIspA',body:'Nombre: '+d.nombre+'\nEmail: '+d.email+'\nTeléfono: '+d.telefono+'\nPerfil: '+d.perfil+'\nMensaje: '+d.mensaje});
    } catch (err) { console.error('LeadMagnet: OWNER_NOTICE_FAILED'); }
  }
  return json_({status:'success',code:'MAIL_ACCEPTED',deliveryConfirmed:false});
}
