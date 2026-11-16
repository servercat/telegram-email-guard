import {readFileSync,writeFileSync,existsSync,chmodSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const args=process.argv.slice(2);
const has=x=>args.includes(x);
const fail=message=>{throw Error(message)};
function run(command,parameters){const r=spawnSync(command,parameters,{stdio:'inherit',shell:process.platform==='win32'&&command==='npm'});if(r.status!==0)fail(`${command} failed / 执行失败`)}
function config(){return Object.fromEntries(readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith('#')).map(line=>{const i=line.indexOf('=');if(i<1)fail('Invalid .env line / 配置行无效');return[line.slice(0,i).trim(),line.slice(i+1).trim().replace(/^(['"])(.*)\1$/,'$2')]}))}
async function main(){
 if(has('--init')){
  if(existsSync('.env'))fail('.env already exists; preserved / 已有配置未覆盖');
  let s=readFileSync('.env.example','utf8');const password=randomBytes(24).toString('hex');
  for(const [key,value]of Object.entries({POSTGRES_PASSWORD:password,DATABASE_URL:`postgresql://guard:${password}@postgres:5432/guard`,OTP_HASH_SECRET:randomBytes(32).toString('hex'),TELEGRAM_WEBHOOK_SECRET:randomBytes(32).toString('hex'),TOKEN_SECRET:randomBytes(32).toString('hex')}))s=s.replace(new RegExp(`^${key}=.*$`,'m'),`${key}=${value}`);
  writeFileSync('.env',s,{mode:0o600});console.log('Created private .env with random secrets. Fill provider/domain values, then run --check. / 已生成配置与随机密钥，请补齐服务商及域名后检查。');return;
 }
 if(!existsSync('.env'))fail('Run npm run deploy -- --init first / 请先初始化配置');
 const env=config();
 const required=['TELEGRAM_BOT_TOKEN','TELEGRAM_BOT_USERNAME','TELEGRAM_WEBHOOK_SECRET','TELEGRAM_GROUP_IDS','ADMIN_TELEGRAM_IDS','RESEND_API_KEY','RESEND_FROM_EMAIL','POSTGRES_PASSWORD','DATABASE_URL','OTP_HASH_SECRET','PUBLIC_BASE_URL','MINI_APP_BASE_URL','SITE_DOMAIN'];
 if(env.RECAPTCHA_ENABLED!=='true')fail('Set RECAPTCHA_ENABLED=true for this guided production deployment / 引导部署需启用人机验证');
 required.push('RECAPTCHA_SITE_KEY','RECAPTCHA_SECRET_KEY','RECAPTCHA_HOSTNAME');
 const missing=required.filter(k=>!env[k]||/CHANGE_ME|YOUR_|example\.com/.test(env[k]));if(missing.length)fail('Missing/placeholder configuration / 配置未完成: '+missing.join(', '));
 if(env.NODE_ENV!=='production'||env.DEMO_MODE!=='false')fail('Require NODE_ENV=production and DEMO_MODE=false');
 for(const k of ['OTP_HASH_SECRET','TELEGRAM_WEBHOOK_SECRET','POSTGRES_PASSWORD'])if(env[k].length<32)fail(`${k}: use at least 32 characters / 至少 32 字符`);
 const origin=new URL(env.PUBLIC_BASE_URL),mini=new URL(env.MINI_APP_BASE_URL);if(origin.protocol!=='https:'||mini.protocol!=='https:'||origin.origin!==mini.origin||origin.hostname!==env.SITE_DOMAIN||origin.hostname!==env.RECAPTCHA_HOSTNAME||origin.pathname!=='/'||mini.pathname!=='/')fail('HTTPS origins and hostnames must match / HTTPS 根地址、站点与验证码域名须一致');
 if(!/^-100\d+(,-100\d+)*$/.test(env.TELEGRAM_GROUP_IDS)||!/^\d+(,\d+)*$/.test(env.ADMIN_TELEGRAM_IDS))fail('Use comma-separated numeric group/admin IDs / 请填写逗号分隔的数字 ID');
 const db=new URL(env.DATABASE_URL);if(db.hostname!=='postgres'||decodeURIComponent(db.password)!==env.POSTGRES_PASSWORD)fail('DATABASE_URL must use postgres host and matching password / 数据库主机与密码须匹配');
 if(process.platform!=='win32')chmodSync('.env',0o600);
 async function telegram(method,data={}){let r;try{r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)})}catch{fail(`Telegram ${method}: network unavailable / 网络不可用`)}const b=await r.json();if(!b.ok)fail(`Telegram ${method} failed (HTTP ${r.status}); check configuration/permissions / 检查配置与权限`);return b.result}
 const bot=await telegram('getMe');if(bot.username.toLowerCase()!==env.TELEGRAM_BOT_USERNAME.replace(/^@/,'').toLowerCase())fail('Bot username does not match token / 用户名与 Token 不匹配');
 for(const chat of env.TELEGRAM_GROUP_IDS.split(',')){const member=await telegram('getChatMember',{chat_id:chat,user_id:bot.id});if(member.status!=='administrator'||!member.can_restrict_members||!member.can_delete_messages)fail('Bot requires administrator, restrict and delete permissions / Bot 需要管理员、限制成员和删除消息权限')}
 console.log('Configuration and Bot permissions passed / 配置与 Bot 权限检查通过');
 if(has('--check'))return;
 const mode=args[args.indexOf('--mode')+1];if(!['dedicated','nginx'].includes(mode)||!has('--deploy'))fail('Use --check or --deploy --mode dedicated|nginx / 请选择检查或部署模式');
 run('docker',['compose','version']);run('npm',['test']);run('npm',['run','build']);
 if(mode==='dedicated')run('docker',['compose','-p','email-guard','up','-d','--build']);else run('docker',['compose','-p','email-guard','-f','docker-compose.yml','-f','deploy/compose.server.yml','up','-d','--build','app']);
 let healthy=false;for(let i=0;i<30;i++){try{const r=await fetch(origin.origin+'/api/health',{signal:AbortSignal.timeout(5000)});const b=await r.json();if(r.ok&&b.ok&&b.database===true&&b.demo===false){healthy=true;break}}catch{}await new Promise(r=>setTimeout(r,2000))}if(!healthy)fail('HTTPS health failed; webhook unchanged. Check DNS, TLS and proxy / 健康检查失败，未修改 Webhook，请检查 DNS、证书及代理');
 await telegram('setWebhook',{url:origin.origin+'/api/telegram/webhook',secret_token:env.TELEGRAM_WEBHOOK_SECRET,allowed_updates:['message','chat_member','my_chat_member','widget_query'],max_connections:1});
 await telegram('setChatMenuButton',{menu_button:{type:'web_app',text:'邮箱验证 / Verify email',web_app:{url:mini.origin}}});
 const hook=await telegram('getWebhookInfo');if(hook.url!==origin.origin+'/api/telegram/webhook')fail('Webhook verification failed / Webhook 检查失败');
 console.log('Deployment complete / 部署完成: '+origin.origin+'\nTest with a regular Telegram account: CAPTCHA → email → OTP → restored permissions. / 请使用普通账号测试完整流程。');
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
