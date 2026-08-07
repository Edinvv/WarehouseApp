<img width="469" height="711" alt="arhitectureflow drawio" src="https://github.com/user-attachments/assets/9c871445-c3a8-42c3-9cb3-1da19518cf92" />
<img width="2304" height="1162" alt="completeflow drawio (1)" src="https://github.com/user-attachments/assets/53b0741d-fea4-45bf-a88d-50f682bf51a8" />
# WarehouseApp

## 🚀 Live Demo
**[https://warehouse-o5zvcldzm-edco1.vercel.app](https://warehouse-o5zvcldzm-edco1.vercel.app)**

> Login: `admin@warehouse.com` / `Admin123!`

A full-stack warehouse management system built for restaurant supply operations. Supports the full inbound and outbound order lifecycle with real-time notifications, role-based access control, and barcode scanning for warehouse workers.

---

## Tech Stack

**Backend**
- ASP.NET Core Web API (.NET 10)
- Clean Architecture (Domain / Application / Infrastructure / API)
- CQRS with MediatR
- Entity Framework Core + PostgreSQL (Neon)
- ASP.NET Identity + JWT Authentication
- SignalR (real-time notifications)

**Frontend**
- React (Vite)
- React Router
- Context API (Auth, Notifications)

---

## Roles

| Role | Capabilities |
|------|-------------|
| Admin | Create and review orders, mark arrivals, dispatch outbound orders |
| Supervisor | Create inbound orders, assign workers to tasks, manage operations |
| Worker | View assigned tasks, scan barcodes to complete pick/unload items |

---

## Features

- **Inbound Orders** — Supervisor creates, Admin approves, workers unload and scan items, stock auto-updated on completion
- **Outbound Orders** — Admin creates from existing stock, stock validated at approval, workers pick by sector, stock deducted on dispatch
- **Stock Tracking** — Inventory updated automatically on inbound received and outbound dispatched
- **Barcode Scanning** — Workers scan product barcodes in task detail view to check off items
- **Real-time Notifications** — SignalR pushes delivery and task assignment notifications to relevant roles instantly
- **Role-based UI** — Workers see only their tasks; Kanban and order management hidden from worker accounts
- **Seed Data** — App seeds 3 sectors and 12 products on first run for demo purposes

---

## Business Flow

### Inbound Order
1. Supervisor creates an inbound order with expected products
2. Admin reviews and approves or rejects
3. Admin marks the order as Arrived when the delivery reaches the warehouse
4. Supervisor receives a real-time notification and assigns workers
5. Workers scan/check off each item in their unloading task
6. Admin marks the order as Received — stock is updated automatically

### Outbound Order
1. Admin creates an outbound order by selecting products from existing stock
2. Admin approves — stock levels are validated at this point
3. Pick tasks are created per warehouse sector, Supervisor notified via SignalR
4. Supervisor assigns workers to pick tasks
5. Workers scan product barcodes in their sector to check off items
6. Admin marks the order as Dispatched — stock is deducted automatically

---

## Running Locally

### Prerequisites
- .NET 10 SDK
- Node.js 18+

### Backend
```bash
dotnet run --project WarehouseApp.API
```
The API runs on `https://localhost:7xxx` (check console output for exact port).

### Frontend
```bash
cd warehouse-client
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`.

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@warehouse.com | Admin123! |

> Supervisor and Worker accounts can be created through the app after logging in as Admin. Stock and sectors are seeded automatically on first run.

---

## Architecture

```
┌─────────────────────────────────────────┐
│              React Frontend             │
│        Role-based UI (JWT auth)         │
└────────────────────┬────────────────────┘
                     │ HTTP + SignalR
┌────────────────────▼────────────────────┐
│              API Layer                  │
│     Controllers + JWT Middleware        │
└────────────────────┬────────────────────┘
                     │ MediatR
┌────────────────────▼────────────────────┐
│           Application Layer             │
│      Commands / Queries / Handlers      │
└──────────┬─────────────────┬────────────┘
           │                 │
┌──────────▼──────┐  ┌───────▼────────────┐
│  Domain Layer   │  │  Infrastructure    │
│  Entities &     │  │  EF Core, Identity │
│  Enums          │  │  SignalR, SQLite   │
└─────────────────┘  └────────────────────┘
```

---

## Project Status

DEPLOYED
