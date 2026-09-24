# Khurshed Traders V4.0.1 — Full Business MVP

A mobile-first Bengali business management app for Khurshed Traders.

## Implemented business flow

Master data:
- Mill
- Seller
- Driver
- Transport

Transactions:
- Order (Feed Company + date + total KG + rate + remark; no mill allocation at order creation)
- Truck
- Multiple sellers per truck
- Seller quantity/rate/amount
- Weight reconciliation warning
- Freight per ton
- Freight payer: Mill / Khurshed Traders
- Order installment payments
- Seller payments
- Profit calculation

Operations:
- Persistent "খুরশেদ ট্রেডার্স" header on every function
- Phone call action for Seller / Driver / Transport
- Transport master to avoid repeated name/number entry
- Search
- Dashboard KPIs
- CSV report
- Print/PDF report
- JSON backup/restore
- Offline local persistence
- Capacitor Android build workflow

## Business formulas

Mill value = truck KG × mill rate snapshot

Seller purchase = sum(seller KG × seller rate)

Khurshed freight = truck tons × freight/ton, only when Khurshed Traders pays

Net margin = Mill value - Seller purchase - Khurshed freight

Order delivered KG = sum active truck KG for that order

Order remaining KG = ordered KG - delivered KG

Order payment balance = delivered/order receivable value - order payments

Historical truck rates are stored as snapshots.

## Install

npm install --no-audit --no-fund
npm run build

## Android

npx cap add android
npx cap sync android

GitHub Actions builds the debug APK.
