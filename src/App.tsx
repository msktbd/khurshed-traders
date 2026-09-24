import {useState} from 'react'
import type {ComponentType} from 'react'
import {
  BarChart3,Building2,ChevronLeft,CircleDollarSign,Download,Edit3,FileText,
  Home,Menu,Package,Phone,Plus,Route,Search,Truck as TruckIcon,UserRound,Users,
  WalletCards,X,Trash2,DatabaseBackup
} from 'lucide-react'
import type {AppData,FreightPayer,PaymentMethod} from './types'
import {emptyData,exportData,importData,loadData,saveData} from './lib/storage'
import {call,csvDownload,id,kg,money,num,today,ton} from './lib/utils'

type Page='home'|'mills'|'sellers'|'drivers'|'transports'|'orders'|'trucks'|'payments'|'reports'|'search'|'backup'
const pages:{id:Page;label:string;icon:any}[]=[
 {id:'home',label:'হোম',icon:Home},{id:'mills',label:'মিল',icon:Building2},
 {id:'orders',label:'অর্ডার',icon:Package},{id:'sellers',label:'বিক্রেতা',icon:Users},
 {id:'trucks',label:'ট্রাক',icon:TruckIcon},{id:'reports',label:'রিপোর্ট',icon:BarChart3}
]

function Header({go}:{go:(p:Page)=>void}){
 const[open,setOpen]=useState(false)
 return <><header className="top"><button onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><div className="brand-mark">খু</div><b className="brand-name">খুরশেদ ট্রেডার্স</b><button onClick={()=>go('search')}><Search/></button></header>
 {open&&<aside className="drawer">{[['home','হোম',Home],['mills','মিল',Building2],['sellers','বিক্রেতা',Users],['drivers','ড্রাইভার',UserRound],['transports','ট্রান্সপোর্ট',Route],['orders','অর্ডার',Package],['trucks','ট্রাক',TruckIcon],['payments','পেমেন্ট',CircleDollarSign],['reports','রিপোর্ট',BarChart3],['backup','ব্যাকআপ',DatabaseBackup],['search','অনুসন্ধান',Search]].map(([p,l,I])=>{const Icon=I as ComponentType<{size?:number}>;return <button key={String(p)} onClick={()=>{go(p as Page);setOpen(false)}}><Icon size={18}/>{String(l)}</button>})}</aside>}</>
}

function Head({title,back,action}:{title:string;back?:()=>void;action?:()=>void}){
 return <div className="page-head">{back&&<button className="round" onClick={back}><ChevronLeft/></button>}<div><h1>{title}</h1><small>খুরশেদ ট্রেডার্স</small></div>{action&&<button className="round dark" onClick={action}><Plus/></button>}</div>
}

function Dashboard({data,go}:{data:AppData;go:(p:Page)=>void}){
 const d=data.trucks.filter(x=>x.date===today()&&x.status==='ACTIVE')
 const kgToday=d.reduce((s,x)=>s+x.weightKg,0)
 const purchase=data.truckSellers.filter(a=>d.some(t=>t.id===a.truckId)).reduce((s,a)=>s+a.amount,0)
 const sales=d.reduce((s,t)=>s+t.weightKg*t.millRateSnapshot,0)
 const freight=d.filter(t=>t.freightPayer==='KHURSHED').reduce((s,t)=>s+ton(t.weightKg)*t.freightPerTon,0)
 const profit=sales-purchase-freight
 return <><div className="welcome"><div><h1>ড্যাশবোর্ড</h1><p>আজকের ব্যবসার সারসংক্ষেপ</p></div><span>অফলাইন</span></div>
 <div className="stats">{[['আজকের ট্রাক',String(d.length)],['আজকের মোট মাল',kg(kgToday)],['আজকের ক্রয়',money(purchase)],['আজকের বিক্রয়/মিল মূল্য',money(sales)],['আজকের ভাড়া',money(freight)],['আজকের আনুমানিক লাভ',money(profit)],['মোট বকেয়া',money(orderDue(data))],['মোট অগ্রিম',money(orderAdvance(data))]].map(x=><div className="stat" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div>
 <h2 className="section-title">দ্রুত কার্যক্রম</h2><div className="quick">{[
 {t:'নতুন ট্রাক',p:'trucks' as Page,Icon:TruckIcon},
 {t:'নতুন বিক্রেতা',p:'sellers' as Page,Icon:Users},
 {t:'নতুন মিল',p:'mills' as Page,Icon:Building2},
 {t:'নতুন অর্ডার',p:'orders' as Page,Icon:Package},
 {t:'পেমেন্ট',p:'payments' as Page,Icon:CircleDollarSign},
 {t:'অনুসন্ধান',p:'search' as Page,Icon:Search},
 {t:'রিপোর্ট',p:'reports' as Page,Icon:BarChart3}
 ].map(({t,p,Icon})=><button key={p} onClick={()=>go(p)}><Icon size={24}/><span>+ {t}</span></button>)}</div>
 <div className="section"><h2>সাম্প্রতিক ট্রাক</h2>{data.trucks.filter(t=>t.status==='ACTIVE').slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(t=><div className="list-row" key={t.id}><b>{t.truckNumber}</b><span>{t.date} · {kg(t.weightKg)}</span></div>)}{!data.trucks.length&&<div className="empty">এখনও কোনো ট্রাক এন্ট্রি নেই</div>}</div></>
}
function orderDue(data:AppData){return data.orders.reduce((s,o)=>s+o.totalKg*o.ratePerKg,0)-data.orderPayments.reduce((s,p)=>s+p.amount,0)-data.trucks.reduce((s,t)=>s+t.weightKg*t.millRateSnapshot,0)}
function orderAdvance(data:AppData){return Math.max(0,-orderDue(data))}

function Master({data,setData,type,title,Icon,go}:{data:AppData;setData:(d:AppData)=>void;type:'mills'|'sellers'|'drivers'|'transports';title:string;Icon:any;go:(p:Page)=>void}){
 const[editing,setEditing]=useState<string|null>(null),[formOpen,setFormOpen]=useState(false),[form,setForm]=useState<any>({name:'',address:'',mobile:'',defaultRate:'',openingBalance:'',licenceNo:'',remark:''})
 const rows=data[type] as any[]
 const open=(r?:any)=>{setEditing(r?.id??null);setFormOpen(true);setForm(r?{...r,defaultRate:r.defaultRate??'',openingBalance:r.openingBalance??''}:{name:'',address:'',mobile:'',defaultRate:'',openingBalance:'',licenceNo:'',remark:''})}
 const save=()=>{if(!form.name.trim())return alert('নাম লিখুন');const r:any={...form,id:editing??id(type.slice(0,-1)),active:true,defaultRate:num(form.defaultRate),openingBalance:num(form.openingBalance)};const next=editing?rows.map(x=>x.id===editing?r:x):[r,...rows];setData({...data,[type]:next});setEditing(null);setFormOpen(false)}
 return <><Head title={title} back={()=>go('home')} action={()=>open()}/>
 {formOpen&&<div className="form-card">{[['name','নাম'],['mobile','মোবাইল'],['address','ঠিকানা']].map(([k,l])=><label className="field" key={k}>{l}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}{type==='sellers'&&<><label className="field">ডিফল্ট ক্রয় রেট<input inputMode="decimal" value={form.defaultRate} onChange={e=>setForm({...form,defaultRate:e.target.value})}/></label><label className="field">Opening Balance<input inputMode="decimal" value={form.openingBalance} onChange={e=>setForm({...form,openingBalance:e.target.value})}/></label></>}{type==='drivers'&&<label className="field">লাইসেন্স নম্বর<input value={form.licenceNo} onChange={e=>setForm({...form,licenceNo:e.target.value})}/></label>}{type==='transports'&&<label className="field">নোট<input value={form.remark} onChange={e=>setForm({...form,remark:e.target.value})}/></label>}<div className="actions"><button onClick={()=>{setEditing(null);setFormOpen(false)}}>বাতিল</button><button className="primary" onClick={save}>সংরক্ষণ</button></div></div>}
 <div className="list">{rows.map(r=><div className="row-card" key={r.id}><div className="avatar"><Icon size={20}/></div><div className="row-main"><b>{r.name}</b>{r.address&&<span>{r.address}</span>}{r.mobile&&<button className="phone" onClick={()=>call(r.mobile)}><Phone size={14}/>{r.mobile}</button>}</div><button className="edit" onClick={()=>open(r)}><Edit3 size={17}/></button></div>)}{!rows.length&&<div className="empty"><Icon size={38}/><b>কোনো {title} নেই</b><span>+ চাপ দিয়ে যোগ করুন</span></div>}</div></>
}

function OrderPage({data,setData,go}:{data:AppData;setData:(d:AppData)=>void;go:(p:Page)=>void}){
 const[editing,setEditing]=useState<string|null>(null),[formOpen,setFormOpen]=useState(false),[f,setF]=useState<any>({feedCompany:'',orderDate:today(),totalKg:'',ratePerKg:'',remark:''})
 const open=(o?:any)=>{setEditing(o?.id??null);setFormOpen(true);setF(o?{...o}:{feedCompany:'',orderDate:today(),totalKg:'',ratePerKg:'',remark:''})}
 const save=()=>{if(!f.feedCompany.trim()||num(f.totalKg)<=0||num(f.ratePerKg)<=0)return alert('Feed Company, পরিমাণ ও রেট দিন');const o={id:editing??id('order'),feedCompany:f.feedCompany.trim(),orderDate:f.orderDate,totalKg:num(f.totalKg),ratePerKg:num(f.ratePerKg),remark:f.remark,status:'ACTIVE' as const};setData({...data,orders:editing?data.orders.map(x=>x.id===editing?o:x):[o,...data.orders]});setEditing(null);setFormOpen(false)}
 return <><Head title="অর্ডার" back={()=>go('home')} action={()=>open()}/>
 {formOpen&&<div className="form-card"><label className="field">Feed Company / ক্রেতা<input value={f.feedCompany} onChange={e=>setF({...f,feedCompany:e.target.value})}/></label><label className="field">অর্ডার তারিখ<input type="date" value={f.orderDate} onChange={e=>setF({...f,orderDate:e.target.value})}/></label><label className="field">মোট অর্ডার KG<input inputMode="decimal" value={f.totalKg} onChange={e=>setF({...f,totalKg:e.target.value})}/></label><label className="field">অর্ডার রেট/KG<input inputMode="decimal" value={f.ratePerKg} onChange={e=>setF({...f,ratePerKg:e.target.value})}/></label><label className="field">Remark<input value={f.remark} onChange={e=>setF({...f,remark:e.target.value})}/></label><div className="actions"><button onClick={()=>{setEditing(null);setFormOpen(false)}}>বাতিল</button><button className="primary" onClick={save}>সংরক্ষণ</button></div></div>}
 <div className="list">{data.orders.map(o=>{const delivered=data.trucks.filter(t=>t.orderId===o.id&&t.status==='ACTIVE').reduce((s,t)=>s+t.weightKg,0);const mills=[...new Set(data.trucks.filter(t=>t.orderId===o.id&&t.status==='ACTIVE').map(t=>data.mills.find(m=>m.id===t.millId)?.name).filter(Boolean))];const paid=data.orderPayments.filter(p=>p.orderId===o.id).reduce((s,p)=>s+p.amount,0);const value=delivered*o.ratePerKg;return <div className="order-card" key={o.id} onClick={()=>open(o)}><div><b>{o.feedCompany}</b><span>{o.orderDate} · অর্ডার {kg(o.totalKg)}</span><span>ডেলিভারি {kg(delivered)} · বাকি {kg(Math.max(0,o.totalKg-delivered))} · {Math.round(Math.min(100,delivered/o.totalKg*100))}%</span><span>মিল: {mills.length?mills.join(', '):'এখনও ডেলিভারি নেই'}</span><span>ডেলিভারি মূল্য {money(value)} · পেমেন্ট {money(paid)}</span></div><Edit3 size={17}/></div>})}</div></>
}

function TruckPage({data,setData,go}:{data:AppData;setData:(d:AppData)=>void;go:(p:Page)=>void}){
 const blank={truckNumber:'',orderId:'',millId:'',driverId:'',transportId:'',date:today(),weightKg:'',freightPerTon:'',freightPayer:'MILL' as FreightPayer,millRateSnapshot:'',note:''}
 const[f,setF]=useState<any>(blank),[editing,setEditing]=useState<string|null>(null),[alloc,setAlloc]=useState<any[]>([])
 const open=(t?:any)=>{if(!t){setEditing(null);setF(blank);setAlloc([]);return}setEditing(t.id);setF({...t,weightKg:String(t.weightKg),freightPerTon:String(t.freightPerTon),millRateSnapshot:String(t.millRateSnapshot)});setAlloc(data.truckSellers.filter(x=>x.truckId===t.id).map(x=>({...x,quantityKg:String(x.quantityKg),ratePerKg:String(x.ratePerKg)})))}
 const order=data.orders.find(o=>o.id===f.orderId)
 const save=()=>{if(!f.truckNumber||!f.orderId||!f.millId||num(f.weightKg)<=0||num(f.millRateSnapshot)<=0)return alert('Truck, Order, Mill, KG এবং Mill Rate দিন');const total=alloc.reduce((s,a)=>s+num(a.quantityKg),0);if(Math.abs(total-num(f.weightKg))>0.01&&!confirm(`Seller allocation ${kg(total)}, Truck ${kg(num(f.weightKg))}। তবুও সংরক্ষণ করবেন?`))return;const t={id:editing??id('truck'),truckNumber:f.truckNumber,orderId:f.orderId,millId:f.millId,driverId:f.driverId,transportId:f.transportId,date:f.date,weightKg:num(f.weightKg),freightPerTon:num(f.freightPerTon),freightPayer:f.freightPayer,millRateSnapshot:num(f.millRateSnapshot),note:f.note,status:'ACTIVE' as const};const old=data.truckSellers.filter(x=>x.truckId!==t.id);const adds=alloc.filter(a=>a.sellerId&&num(a.quantityKg)>0).map(a=>({id:a.id||id('ts'),truckId:t.id,sellerId:a.sellerId,quantityKg:num(a.quantityKg),ratePerKg:num(a.ratePerKg),amount:num(a.quantityKg)*num(a.ratePerKg)}));setData({...data,trucks:editing?data.trucks.map(x=>x.id===t.id?t:x):[t,...data.trucks],truckSellers:[...old,...adds]});open()}
 return <><Head title="ট্রাক" back={()=>go('home')} action={()=>open()}/><div className="form-card"><h3>{editing?'ট্রাক সম্পাদনা':'নতুন ট্রাক'}</h3><label className="field">ট্রাক নম্বর<input value={f.truckNumber} onChange={e=>setF({...f,truckNumber:e.target.value})}/></label><label className="field">তারিখ<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label><label className="field">অর্ডার<select value={f.orderId} onChange={e=>{const o=data.orders.find(x=>x.id===e.target.value);setF({...f,orderId:e.target.value,millRateSnapshot:o?.ratePerKg||''})}}><option value="">নির্বাচন করুন</option>{data.orders.map(o=><option key={o.id} value={o.id}>{o.feedCompany} · {kg(o.totalKg)} · {o.orderDate}</option>)}</select></label><label className="field">Destination Mill<select value={f.millId} onChange={e=>setF({...f,millId:e.target.value})}><option value="">নির্বাচন করুন</option>{data.mills.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><div className="two"><label className="field">Weight KG<input inputMode="decimal" value={f.weightKg} onChange={e=>setF({...f,weightKg:e.target.value})}/></label><label className="field">Mill Rate/KG<input inputMode="decimal" value={f.millRateSnapshot} onChange={e=>setF({...f,millRateSnapshot:e.target.value})}/></label></div><div className="two"><label className="field">Freight/Ton<input inputMode="decimal" value={f.freightPerTon} onChange={e=>setF({...f,freightPerTon:e.target.value})}/></label><label className="field">Freight Payer<select value={f.freightPayer} onChange={e=>setF({...f,freightPayer:e.target.value})}><option value="MILL">Mill</option><option value="KHURSHED">Khurshed Traders</option></select></label></div><div className="two"><label className="field">Driver<select value={f.driverId} onChange={e=>setF({...f,driverId:e.target.value})}><option value="">নির্বাচন করুন</option>{data.drivers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className="field">Transport<select value={f.transportId} onChange={e=>setF({...f,transportId:e.target.value})}><option value="">নির্বাচন করুন</option>{data.transports.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div><div className="alloc-head"><b>Seller Allocation</b><button onClick={()=>setAlloc([...alloc,{sellerId:'',quantityKg:'',ratePerKg:''}])}><Plus size={16}/> Seller</button></div>{alloc.map((a,i)=><div className="alloc"><select value={a.sellerId} onChange={e=>{const x=[...alloc];x[i].sellerId=e.target.value;const s=data.sellers.find(z=>z.id===e.target.value);x[i].ratePerKg=s?.defaultRate||'';setAlloc(x)}}><option value="">Seller</option>{data.sellers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><input placeholder="KG" inputMode="decimal" value={a.quantityKg} onChange={e=>{const x=[...alloc];x[i].quantityKg=e.target.value;setAlloc(x)}}/><input placeholder="Rate" inputMode="decimal" value={a.ratePerKg} onChange={e=>{const x=[...alloc];x[i].ratePerKg=e.target.value;setAlloc(x)}}/><button onClick={()=>setAlloc(alloc.filter((_,j)=>j!==i))}>×</button></div>)}<div className="reconcile">Seller KG: <b>{kg(alloc.reduce((s,a)=>s+num(a.quantityKg),0))}</b> · Truck: <b>{kg(num(f.weightKg))}</b></div><label className="field">Remark<input value={f.note} onChange={e=>setF({...f,note:e.target.value})}/></label><div className="actions"><button onClick={()=>open()}>Clear</button><button className="primary" onClick={save}>সংরক্ষণ</button></div></div>
 <div className="list">{data.trucks.filter(t=>t.status==='ACTIVE').map(t=><div className="order-card"><div><b>{t.truckNumber}</b><span>{t.date} · {kg(t.weightKg)}</span><span>{data.mills.find(m=>m.id===t.millId)?.name||''} · {data.transports.find(x=>x.id===t.transportId)?.name||'Transport নেই'}</span><span>Freight {money(ton(t.weightKg)*t.freightPerTon)} · Profit {money(t.weightKg*t.millRateSnapshot-data.truckSellers.filter(a=>a.truckId===t.id).reduce((s,a)=>s+a.amount,0)-(t.freightPayer==='KHURSHED'?ton(t.weightKg)*t.freightPerTon:0))}</span></div><button className="edit" onClick={()=>open(t)}><Edit3 size={17}/></button></div>)}</div></>
}

function Payments({data,setData,go}:{data:AppData;setData:(d:AppData)=>void;go:(p:Page)=>void}){
 const[f,setF]=useState<any>({type:'ORDER',entityId:'',date:today(),amount:'',method:'CASH' as PaymentMethod,remark:''})
 const save=()=>{if(!f.entityId||num(f.amount)<=0)return alert('Entity ও Amount দিন');if(f.type==='ORDER'){setData({...data,orderPayments:[{id:id('op'),orderId:f.entityId,date:f.date,amount:num(f.amount),method:f.method,remark:f.remark},...data.orderPayments]})}else{setData({...data,sellerPayments:[{id:id('sp'),sellerId:f.entityId,date:f.date,amount:num(f.amount),method:f.method,remark:f.remark},...data.sellerPayments]})}setF({...f,amount:'',remark:''})}
 return <><Head title="পেমেন্ট" back={()=>go('home')}/><div className="form-card"><div className="tabs"><button className={f.type==='ORDER'?'on':''} onClick={()=>setF({...f,type:'ORDER',entityId:''})}>মিল/অর্ডার পেমেন্ট</button><button className={f.type==='SELLER'?'on':''} onClick={()=>setF({...f,type:'SELLER',entityId:''})}>সেলার পেমেন্ট</button></div><label className="field">{f.type==='ORDER'?'অর্ডার':'সেলার'}<select value={f.entityId} onChange={e=>setF({...f,entityId:e.target.value})}><option value="">নির্বাচন করুন</option>{(f.type==='ORDER'?data.orders:data.sellers).map((x:any)=><option key={x.id} value={x.id}>{f.type==='ORDER'?x.feedCompany:x.name}</option>)}</select></label><label className="field">তারিখ<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label><label className="field">Amount<input inputMode="decimal" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label><label className="field">Method<select value={f.method} onChange={e=>setF({...f,method:e.target.value})}><option value="CASH">Cash</option><option value="BANK">Bank</option><option value="BKASH">bKash</option><option value="NAGAD">Nagad</option><option value="OTHER">Other</option></select></label><label className="field">Remark<input value={f.remark} onChange={e=>setF({...f,remark:e.target.value})}/></label><button className="primary full" onClick={save}>পেমেন্ট সংরক্ষণ</button></div><div className="section"><h2>সাম্প্রতিক পেমেন্ট</h2>{[...data.orderPayments.map(x=>({...x,label:'Order'})),...data.sellerPayments.map(x=>({...x,label:'Seller'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30).map(p=><div className="list-row"><b>{p.label} · {money(p.amount)}</b><span>{p.date} · {p.method}</span></div>)}</div></>
}

function Reports({data,go}:{data:AppData;go:(p:Page)=>void}){
 const[range,setRange]=useState('ALL')
 const rows=data.trucks.filter(t=>t.status==='ACTIVE'&&(range==='ALL'||t.date===range))
 const download=()=>csvDownload(`khurshed-traders-report-${today()}.csv`,[['Date','Truck','Mill','KG','Purchase','Mill Value','Freight','Profit'],...rows.map(t=>{const purchase=data.truckSellers.filter(a=>a.truckId===t.id).reduce((s,a)=>s+a.amount,0);const fr=ton(t.weightKg)*t.freightPerTon;const profit=t.weightKg*t.millRateSnapshot-purchase-(t.freightPayer==='KHURSHED'?fr:0);return [t.date,t.truckNumber,data.mills.find(m=>m.id===t.millId)?.name||'',String(t.weightKg),String(purchase),String(t.weightKg*t.millRateSnapshot),String(fr),String(profit)]})])
 return <><Head title="রিপোর্ট" back={()=>go('home')} action={download}/><div className="form-card"><label className="field">তারিখ<select value={range} onChange={e=>setRange(e.target.value)}><option value="ALL">সব</option><option value={today()}>আজ</option></select></label><div className="report-actions"><button onClick={download}><Download size={17}/> CSV Export</button><button onClick={()=>window.print()}><FileText size={17}/> PDF / Print</button></div></div><div className="section"><h2>ট্রাক / Profit Report</h2>{rows.map(t=><div className="report-row"><b>{t.date} · {t.truckNumber}</b><span>{kg(t.weightKg)} · লাভ {money(t.weightKg*t.millRateSnapshot-data.truckSellers.filter(a=>a.truckId===t.id).reduce((s,a)=>s+a.amount,0)-(t.freightPayer==='KHURSHED'?ton(t.weightKg)*t.freightPerTon:0))}</span></div>)}{!rows.length&&<div className="empty">ডেটা নেই</div>}</div></>
}

function SearchPage({data,go}:{data:AppData;go:(p:Page)=>void}){
 const[q,setQ]=useState('')
 const z=q.trim().toLowerCase()
 const results=[
 ...data.mills.map(x=>({t:'মিল',n:x.name,s:x.mobile,p:'mills' as Page})),
 ...data.sellers.map(x=>({t:'সেলার',n:x.name,s:x.mobile,p:'sellers' as Page})),
 ...data.drivers.map(x=>({t:'ড্রাইভার',n:x.name,s:x.mobile,p:'drivers' as Page})),
 ...data.transports.map(x=>({t:'ট্রান্সপোর্ট',n:x.name,s:x.mobile,p:'transports' as Page})),
 ...data.trucks.map(x=>({t:'ট্রাক',n:x.truckNumber,s:x.date,p:'trucks' as Page}))
 ].filter(x=>(x.n+' '+x.s).toLowerCase().includes(z))
 return <><Head title="অনুসন্ধান" back={()=>go('home')}/><div className="form-card"><input className="searchbox" autoFocus placeholder="নাম, মোবাইল, ট্রাক নম্বর..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="list">{results.map(x=><button className="search-result" onClick={()=>go(x.p)}><b>{x.t}: {x.n}</b><span>{x.s}</span></button>)}{q&&!results.length&&<div className="empty">কিছু পাওয়া যায়নি</div>}</div></>
}

function Backup({data,setData,go}:{data:AppData;setData:(d:AppData)=>void;go:(p:Page)=>void}){
 const fileRef=useState<HTMLInputElement|null>(null)[0]
 return <><Head title="ব্যাকআপ ও রিস্টোর" back={()=>go('home')}/><div className="section"><h2>ডেটা নিরাপত্তা</h2><p>লোকাল ডেটার JSON backup রাখুন এবং প্রয়োজন হলে restore করুন।</p><div className="report-actions"><button onClick={()=>exportData(data)}><Download size={17}/> Backup</button><label className="file-button"><DatabaseBackup size={17}/> Restore<input type="file" accept=".json" onChange={async e=>{const f=e.target.files?.[0];if(f&&confirm('বর্তমান ডেটা replace হবে। চালাবেন?')){try{setData(await importData(f));alert('Restore সফল')}catch{alert('Backup file সঠিক নয়')}}}}/></label></div></div><div className="section"><b>রেকর্ড</b><div className="list-row"><span>Mill</span><b>{data.mills.length}</b></div><div className="list-row"><span>Seller</span><b>{data.sellers.length}</b></div><div className="list-row"><span>Order</span><b>{data.orders.length}</b></div><div className="list-row"><span>Truck</span><b>{data.trucks.length}</b></div></div></>
}

export default function App(){
 const[data,setDataState]=useState<AppData>(loadData)
 const[page,setPage]=useState<Page>('home')
 const setData=(d:AppData)=>{setDataState(d);saveData(d)}
 const go=(p:Page)=>{setPage(p);window.scrollTo({top:0})}
 let content:any
 if(page==='home')content=<Dashboard data={data} go={go}/>
 else if(page==='mills')content=<Master data={data} setData={setData} type="mills" title="মিল" Icon={Building2} go={go}/>
 else if(page==='sellers')content=<Master data={data} setData={setData} type="sellers" title="বিক্রেতা" Icon={Users} go={go}/>
 else if(page==='drivers')content=<Master data={data} setData={setData} type="drivers" title="ড্রাইভার" Icon={UserRound} go={go}/>
 else if(page==='transports')content=<Master data={data} setData={setData} type="transports" title="ট্রান্সপোর্ট" Icon={Route} go={go}/>
 else if(page==='orders')content=<OrderPage data={data} setData={setData} go={go}/>
 else if(page==='trucks')content=<TruckPage data={data} setData={setData} go={go}/>
 else if(page==='payments')content=<Payments data={data} setData={setData} go={go}/>
 else if(page==='reports')content=<Reports data={data} go={go}/>
 else if(page==='search')content=<SearchPage data={data} go={go}/>
 else content=<Backup data={data} setData={setData} go={go}/>
 return <div className="app"><Header go={go}/><main>{content}</main><nav>{pages.map(x=><button key={x.id} className={page===x.id?'active':''} onClick={()=>go(x.id)}><x.icon size={19}/><span>{x.label}</span></button>)}</nav></div>
}