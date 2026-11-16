import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

test('deployment initializer generates matching secrets, preserves config and blocks incomplete deployment',()=>{
 const root=mkdtempSync(join(process.cwd(),'.deploy-test-'));
 try{
  mkdirSync(join(root,'scripts'));copyFileSync('scripts/deploy.mjs',join(root,'scripts/deploy.mjs'));copyFileSync('.env.example',join(root,'.env.example'));
  const run=(...args:string[])=>spawnSync(process.execPath,[join(root,'scripts/deploy.mjs'),...args],{encoding:'utf8'});
  assert.equal(run('--check').status,1);
  const initialized=run('--init');assert.equal(initialized.status,0,initialized.stderr);
  const first=readFileSync(join(root,'.env'),'utf8');const value=(key:string)=>first.match(new RegExp('^'+key+'=(.*)$','m'))![1];
  assert.match(value('OTP_HASH_SECRET'),/^[a-f0-9]{64}$/);assert.match(value('POSTGRES_PASSWORD'),/^[a-f0-9]{48}$/);
  assert.equal(new URL(value('DATABASE_URL')).password,value('POSTGRES_PASSWORD'));
  assert(!initialized.stdout.includes(value('OTP_HASH_SECRET')));
  assert.equal(run('--init').status,1);assert.equal(readFileSync(join(root,'.env'),'utf8'),first);
  const check=run('--deploy','--mode','dedicated');assert.equal(check.status,1);assert.match(check.stderr,/RECAPTCHA_ENABLED/);
  writeFileSync(join(root,'.env'),first.replace('RECAPTCHA_ENABLED=false','RECAPTCHA_ENABLED=true'));
  const missing=run('--check');assert.equal(missing.status,1);assert.match(missing.stderr,/Missing\/placeholder/);assert(!missing.stderr.includes(value('POSTGRES_PASSWORD')));

  const complete=Object.fromEntries(readFileSync(join(root,'.env'),'utf8').trim().split(/\r?\n/).map(line=>{const i=line.indexOf('=');return[line.slice(0,i),line.slice(i+1)]}));
  Object.assign(complete,{TELEGRAM_BOT_TOKEN:'fake-token-for-test',TELEGRAM_BOT_USERNAME:'test_bot',TELEGRAM_GROUP_IDS:'-100123456',ADMIN_TELEGRAM_IDS:'123',RESEND_API_KEY:'fake-mail-key',RESEND_FROM_EMAIL:'test@test.invalid',SITE_DOMAIN:'verify.test.invalid',PUBLIC_BASE_URL:'https://verify.test.invalid',MINI_APP_BASE_URL:'https://verify.test.invalid',RECAPTCHA_SITE_KEY:'fake-site',RECAPTCHA_SECRET_KEY:'fake-secret',RECAPTCHA_HOSTNAME:'verify.test.invalid'});
  writeFileSync(join(root,'.env'),Object.entries(complete).map(([k,v])=>k+'='+v).join('\n'));
  const mock=join(root,'mock.mjs');
  writeFileSync(mock,`import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';import {appendFileSync} from 'node:fs';
cp.spawnSync=(cmd,args)=>{appendFileSync(new URL('./events.log',import.meta.url),cmd+' '+args.join(' ')+'\\n');return {status:0}};syncBuiltinESMExports();
globalThis.fetch=async(url,options)=>{const method=String(url).split('/').pop();appendFileSync(new URL('./events.log',import.meta.url),method+'\\n');if(method==='health')return {ok:true,json:async()=>({ok:true,database:true,demo:false})};const result=method==='getMe'?{id:1,username:'test_bot'}:method==='getChatMember'?{status:'administrator',can_restrict_members:true,can_delete_messages:true}:method==='getWebhookInfo'?{url:'https://verify.test.invalid/api/telegram/webhook'}:true;return {status:200,json:async()=>({ok:true,result})}};`);
  const deployed=spawnSync(process.execPath,['--import',pathToFileURL(mock).href,join(root,'scripts/deploy.mjs'),'--deploy','--mode','nginx'],{encoding:'utf8'});
  assert.equal(deployed.status,0,deployed.stderr);
  const events=readFileSync(join(root,'events.log'),'utf8');
  assert.match(events,/deploy\/compose.server.yml/);assert(events.indexOf('health')<events.indexOf('setWebhook'));assert.match(events,/setChatMenuButton/);assert.match(deployed.stdout,/Deployment complete/);
 }finally{assert(root.startsWith(join(process.cwd(),'.deploy-test-')));rmSync(root,{recursive:true,force:true})}
});
