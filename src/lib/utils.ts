export const today=()=>new Date().toISOString().slice(0,10)
export const id=(p:string)=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
export const num=(v:string|number)=>Number(v)||0
export const money=(v:number)=>`৳${Math.round(v).toLocaleString('bn-BD')}`
export const kg=(v:number)=>`${Number(v||0).toLocaleString('bn-BD')} কেজি`
export const ton=(v:number)=>Number(v||0)/1000
export const call=(mobile:string)=>mobile && (window.location.href=`tel:${mobile}`)
export function csvDownload(name:string,rows:string[][]){
  const esc=(s:string)=>`"${String(s??'').replaceAll('"','""')}"`
  const text=rows.map(r=>r.map(esc).join(',')).join('\n')
  const blob=new Blob(["\ufeff"+text],{type:'text/csv;charset=utf-8'})
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)
}