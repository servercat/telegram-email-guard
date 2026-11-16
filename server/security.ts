import {createHmac,timingSafeEqual,randomInt,randomBytes,createHash} from 'node:crypto';
export class Fault extends Error{constructor(public code:string,public status=400){super(code)}}
export const hashToken=(s:string)=>createHash('sha256').update(s).digest('hex');
export const token=()=>randomBytes(24).toString('base64url');
export const otpCode=()=>randomInt(0,1000000).toString().padStart(6,'0');
export const otpHash=(id:string,otp:string,secret:string)=>createHmac('sha256',secret).update(`${id}:${otp}`).digest('hex');
export function equal(a:string,b:string){return a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b))}
export function authenticate(raw:string,botToken:string,now=Math.floor(Date.now()/1000)):{id:number}{if(!raw||raw.length>16000)throw new Fault('UNAUTHORIZED',401);const params=new URLSearchParams(raw);if(new Set(params.keys()).size!==Array.from(params).length)throw new Fault('UNAUTHORIZED',401);const signature=params.get('hash')||'';params.delete('hash');const data=Array.from(params).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>`${k}=${v}`).join('\n');const secret=createHmac('sha256','WebAppData').update(botToken).digest();const expected=createHmac('sha256',secret).update(data).digest('hex');if(!equal(signature,expected))throw new Fault('UNAUTHORIZED',401);const date=Number(params.get('auth_date'));if(!date||date>now+30||now-date>3600)throw new Fault('AUTH_EXPIRED',401);let user;try{user=JSON.parse(params.get('user')||'null')}catch{throw new Fault('UNAUTHORIZED',401)}if(!Number.isSafeInteger(user?.id)||user.id<=0)throw new Fault('UNAUTHORIZED',401);return user}
export function validEmail(email:string){return email.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)}
export const maskEmail=(s:string)=>{const[a,b]=s.split('@');return `${a[0]}•••@${b}`};
export const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
