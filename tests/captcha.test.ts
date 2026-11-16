import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyCaptcha} from '../server/captcha';
import {hashToken} from '../server/security';

test('reCAPTCHA checks response, hostname, timestamp and upstream availability',async()=>{
 const originalFetch=globalThis.fetch;
 const originalSecret=process.env.RECAPTCHA_SECRET_KEY;
 const originalHost=process.env.RECAPTCHA_HOSTNAME;
 process.env.RECAPTCHA_SECRET_KEY='test-secret';
 process.env.RECAPTCHA_HOSTNAME='verify.affyun.com';
 const reply=(data:unknown)=>{globalThis.fetch=async(_url,options)=>{assert.equal(options?.method,'POST');assert.equal(new URLSearchParams(String(options?.body)).get('response'),'test-token');return new Response(JSON.stringify(data))}};
 try{
  await assert.rejects(verifyCaptcha(''),/CAPTCHA_REQUIRED/);
  await assert.rejects(verifyCaptcha('x'.repeat(8193)),/CAPTCHA_REQUIRED/);
  const valid={success:true,hostname:'verify.affyun.com',challenge_ts:new Date().toISOString()};
  reply(valid);assert.equal(await verifyCaptcha('test-token'),hashToken('test-token'));
  for(const invalid of [null,{...valid,success:false},{...valid,hostname:'evil.example'},{...valid,challenge_ts:new Date(Date.now()-121000).toISOString()},{...valid,challenge_ts:new Date(Date.now()+60000).toISOString()}]){
   reply(invalid);await assert.rejects(verifyCaptcha('test-token'),/CAPTCHA_INVALID/);
  }
  globalThis.fetch=async()=>{throw Error('offline')};await assert.rejects(verifyCaptcha('test-token'),/CAPTCHA_UNAVAILABLE/);
  delete process.env.RECAPTCHA_SECRET_KEY;await assert.rejects(verifyCaptcha('test-token'),/CAPTCHA_UNAVAILABLE/);
 }finally{
  globalThis.fetch=originalFetch;
  if(originalSecret===undefined)delete process.env.RECAPTCHA_SECRET_KEY;else process.env.RECAPTCHA_SECRET_KEY=originalSecret;
  if(originalHost===undefined)delete process.env.RECAPTCHA_HOSTNAME;else process.env.RECAPTCHA_HOSTNAME=originalHost;
 }
});
