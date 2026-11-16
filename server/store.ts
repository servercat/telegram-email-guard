import {Pool,type PoolClient} from 'pg';
import {readFile} from 'node:fs/promises';
import type {Stored} from './service';
import {Fault} from './security';
export const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL}):undefined;
export async function migrate(){if(pool)await pool.query(await readFile(new URL('../db/001.sql',import.meta.url),'utf8'))}
export async function withSession(id:string,userId:number,fn:(s:Stored,c?:PoolClient)=>Promise<void>,demo=false):Promise<Stored>{if(demo){const s=demoSessions.get(id);if(!s||s.userId!==userId)throw new Fault('SESSION_NOT_FOUND',404);if(locks.has(id))throw new Fault('RATE_LIMITED',429);locks.add(id);try{await fn(s);return s}finally{locks.delete(id)}}if(!pool)throw new Fault('SYSTEM_ERROR',503);const c=await pool.connect();let s:Stored;try{await c.query('BEGIN');const result=await c.query('SELECT data FROM verification_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE',[id,userId]);if(!result.rows[0])throw new Fault('SESSION_NOT_FOUND',404);s=result.rows[0].data;let error;try{await fn(s,c)}catch(e){error=e}await c.query('UPDATE verification_sessions SET data=$2,updated_at=now() WHERE id=$1',[id,s]);await c.query('COMMIT');if(error)throw error;return s}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
export const demoSessions=new Map<string,Stored>();const locks=new Set<string>();
export async function save(s:Stored){if(!pool)throw new Fault('SYSTEM_ERROR',503);await pool.query('INSERT INTO verification_sessions(id,user_id,chat_id,data) VALUES($1,$2,$3,$4)',[s.id,s.userId,s.chatId,s])}
