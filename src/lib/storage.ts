import type { AppData } from '../types'

const KEY='khurshed_traders_v4_data'
export const emptyData=():AppData=>({
  mills:[],sellers:[],drivers:[],transports:[],orders:[],trucks:[],
  truckSellers:[],orderPayments:[],sellerPayments:[],audits:[]
})
export function loadData():AppData{
  try {
    const raw=localStorage.getItem(KEY)
    return raw ? {...emptyData(),...JSON.parse(raw)} : emptyData()
  } catch { return emptyData() }
}
export function saveData(data:AppData){localStorage.setItem(KEY,JSON.stringify(data))}
export function exportData(data:AppData){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`khurshed-traders-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)
}
export function importData(file:File):Promise<AppData>{
  return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve({...emptyData(),...JSON.parse(String(r.result))})}catch(e){reject(e)}};r.onerror=reject;r.readAsText(file)})
}