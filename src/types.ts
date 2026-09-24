export type ID = string
export type FreightPayer = 'MILL' | 'KHURSHED'
export type PaymentMethod = 'CASH' | 'BANK' | 'BKASH' | 'NAGAD' | 'OTHER'

export interface Mill { id:ID; name:string; address:string; mobile:string; active:boolean }
export interface Seller { id:ID; name:string; address:string; mobile:string; defaultRate:number; openingBalance:number; active:boolean }
export interface Driver { id:ID; name:string; mobile:string; address:string; licenceNo:string; active:boolean }
export interface Transport { id:ID; name:string; mobile:string; address:string; remark:string; active:boolean }
export interface Order { id:ID; feedCompany:string; orderDate:string; totalKg:number; ratePerKg:number; remark:string; status:'ACTIVE'|'PARTIAL'|'COMPLETED'|'CLOSED' }
export interface TruckSeller { id:ID; truckId:ID; sellerId:ID; quantityKg:number; ratePerKg:number; amount:number }
export interface Truck {
  id:ID; truckNumber:string; orderId:ID; millId:ID; driverId:string; transportId:string;
  date:string; weightKg:number; freightPerTon:number; freightPayer:FreightPayer;
  millRateSnapshot:number; note:string; status:'ACTIVE'|'VOID'
}
export interface OrderPayment { id:ID; orderId:ID; date:string; amount:number; method:PaymentMethod; remark:string }
export interface SellerPayment { id:ID; sellerId:ID; date:string; amount:number; method:PaymentMethod; remark:string }
export interface AuditLog { id:ID; entityType:string; entityId:string; action:string; oldValue:string; newValue:string; date:string }
export interface AppData {
  mills:Mill[]; sellers:Seller[]; drivers:Driver[]; transports:Transport[]; orders:Order[];
  trucks:Truck[]; truckSellers:TruckSeller[]; orderPayments:OrderPayment[];
  sellerPayments:SellerPayment[]; audits:AuditLog[];
}