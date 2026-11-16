export const widgetStates = ['WAITING','OTP_SENT','VERIFYING','VERIFIED','EXPIRING','EXPIRED','SYSTEM_ERROR'] as const;
export type WidgetState = typeof widgetStates[number];
export const miniStates = ['EMAIL','EMAIL_ERROR','SENDING','SENT','OTP','OTP_ERROR','OTP_EXPIRED','RESENDING','VERIFYING','SUCCESS','MAX_ATTEMPTS','TIMEOUT','NETWORK_ERROR','SYSTEM_ERROR','RESTORING'] as const;
export type MiniState = typeof miniStates[number];
export type Session = {id:string; status:string; captchaRequired?:boolean; captchaSiteKey?:string; email?:string; expiresAt:number; otpExpiresAt?:number; resendAt?:number; attemptsLeft:number; sendsLeft:number; adminUrl?:string; groupUrl?:string};
export const widgetCopy:Record<WidgetState,{title:string;description:string;icon:string;tone:string;action:string;step:number}> = {
 WAITING:{title:'欢迎加入我们的群组！',description:'为了维护群组交流环境，请完成邮箱验证，解锁您的发言权限。',icon:'shield',tone:'blue',action:'立即开始验证',step:1},
 OTP_SENT:{title:'验证码已发送！',description:'请前往 Mini App 输入邮件中的 6 位验证码，完成邮箱验证。',icon:'mail',tone:'blue',action:'打开验证页面',step:2},
 VERIFYING:{title:'正在验证中…',description:'我们正在安全地确认您的邮箱信息，请稍候。',icon:'loader',tone:'blue',action:'验证处理中',step:2},
 VERIFIED:{title:'邮箱验证成功！',description:'邮箱验证已完成，群组权限状态将根据实际结果更新。',icon:'check',tone:'green',action:'查看权限状态',step:3},
 EXPIRING:{title:'验证即将过期！',description:'剩余时间不多了，请尽快完成邮箱验证。',icon:'clock',tone:'orange',action:'立即继续验证',step:2},
 EXPIRED:{title:'验证已过期',description:'未能在规定时间内完成验证。权限处理状态请联系管理员确认。',icon:'alert',tone:'red',action:'联系群组管理员',step:0},
 SYSTEM_ERROR:{title:'系统暂时不可用',description:'服务正在恢复中，这不代表验证失败，请稍后刷新重试。',icon:'gear',tone:'gray',action:'刷新验证状态',step:0}
};
export const miniLabels:Record<MiniState,string>={EMAIL:'邮箱输入',EMAIL_ERROR:'邮箱格式错误',SENDING:'邮件发送中',SENT:'邮件发送成功',OTP:'验证码输入',OTP_ERROR:'验证码错误',OTP_EXPIRED:'验证码过期',RESENDING:'重新发送中',VERIFYING:'验证处理中',SUCCESS:'验证成功',MAX_ATTEMPTS:'错误次数上限',TIMEOUT:'验证总时限结束',NETWORK_ERROR:'网络连接失败',SYSTEM_ERROR:'系统暂时不可用',RESTORING:'群组权限恢复中'};
export const countdown=(until:number,now=Date.now())=>{const s=Math.max(0,Math.ceil((until-now)/1000));return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`};
export function stateFromSession(s:Session):MiniState {if(s.status==='UNMUTED')return 'SUCCESS';if(['VERIFIED','UNMUTE_PENDING','UNMUTE_RETRY'].includes(s.status))return 'RESTORING';if(s.status==='FAILED_MAX_ATTEMPTS')return 'MAX_ATTEMPTS';if(['EXPIRED','PERMANENT_MUTE_PENDING','PERMANENT_MUTED'].includes(s.status))return 'TIMEOUT';if(s.status==='SYSTEM_ERROR')return 'SYSTEM_ERROR';if(s.otpExpiresAt)return s.otpExpiresAt<=Date.now()?'OTP_EXPIRED':'OTP';return 'EMAIL'}
