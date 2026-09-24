import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite'

let conn:SQLiteConnection|undefined
let db:SQLiteDBConnection|undefined

export async function getNativeDb(){
  if(!Capacitor.isNativePlatform()) return null
  if(!conn) conn=new SQLiteConnection(CapacitorSQLite)
  if(!db){db=await conn.createConnection('khurshed_traders',false,'no-encryption',1,false);await db.open()}
  return db
}
export async function initNativeDb(){
  const d=await getNativeDb(); if(!d)return
  await d.execute(`
  CREATE TABLE IF NOT EXISTS app_meta(key TEXT PRIMARY KEY,value TEXT);
  CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,entity_type TEXT,entity_id TEXT,action TEXT,old_value TEXT,new_value TEXT,created_at TEXT);
  `)
}