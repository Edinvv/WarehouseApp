# Warehouse Management System — Phase 1 Plan

---

## What are we building?

A role-based warehouse management system where:
- **Admins** manage the whole system — sectors, products, users
- **Supervisors** manage their sector — create tasks, assign workers, monitor stock
- **Workers** see their assigned tasks on a Kanban board, update status, leave comments

Real-time notifications (SignalR) fire when stock drops, a task is assigned, or a new message arrives.
The frontend is a React app with a Kanban board per sector (like Trello, but for a warehouse).

---

## Architecture in plain English

We have 4 .NET projects. Each one has a specific job and a strict rule about who it can talk to.

```
Domain          → knows nothing. Just your data shapes.
Application     → knows Domain. Defines what the app can DO.
Infrastructure  → knows Application + Domain. Does the actual database/SignalR work.
API             → knows Application. Handles HTTP. Talks to the outside world.
```

**The rule that never breaks:** inner layers never know about outer layers.
Domain never imports anything. Application never touches the database.
If you break this rule, the architecture falls apart.

---

## Phase 1 Roadmap

### Step 1 — Foundation (project references + packages)
We wire up the 4 projects so they reference each other correctly,
then install all the NuGet packages each project needs.
This is CLI work — no code files yet.
**You will learn:** how .NET project references enforce the dependency rule.

---

### Step 2 — Domain Entities
We write the C# classes that represent the real-world objects in our warehouse.
No packages, no database, no logic — just plain classes with properties.

The entities we create:
- **AppUser** — extends IdentityUser (adds FirstName, LastName)
- **Sector** — a zone in the warehouse (Electronics, Clothing, etc.)
- **Product** — a product stored in a sector, has a minimum stock threshold
- **WarehouseTask** — a task assigned to a worker in a sector (the Kanban card)
- **Comment** — a comment left on a task
- **Message** — a private message between two users
- **Notification** — a notification stored for a user

We also write 3 enums:
- **TaskStatus** — Todo, InProgress, Done (the Kanban columns)
- **TaskPriority** — Low, Medium, High
- **NotificationType** — LowStock, TaskAssigned, NewMessage, NewComment

**You will learn:** how to model a real domain in C#, why Guid IDs are better than int for production apps, how navigation properties create relationships between entities.

---

### Step 3 — Application Layer (interfaces + DTOs + use cases)
This is the brain of the app. No database here — just contracts and logic.

**Interfaces** — we define two contracts:
- `IAppDbContext` — the shape of the database (what tables exist). Infrastructure will implement this.
- `INotificationService` — how to send a real-time notification. Infrastructure will implement this too.

**DTOs** — Data Transfer Objects. These are what the API returns to the frontend.
They are NOT your entities — they only contain the fields the client needs.
One DTO per entity (SectorDto, ProductDto, TaskDto, etc.)

**CQRS with MediatR** — every use case is its own class.
A Query reads data and returns it. A Command changes data.
We write one query or command per feature:
- GetSectors, CreateSector
- GetProductsBySector, CreateProduct
- GetTasksBySector (this feeds the Kanban board), CreateTask, UpdateTaskStatus
- AddComment
- SendMessage, GetMessages

**You will learn:** why CQRS keeps code clean (one class = one job), what MediatR does and why it's used instead of services, why DTOs exist and what happens if you return entities directly.

---

### Step 4 — Infrastructure (database + SignalR)
This is where we implement what Application defined.

**AppDbContext** — extends IdentityDbContext (gives us all the Identity tables for free).
It implements IAppDbContext. This is the real EF Core database class.

**Entity Configurations** — we tell EF Core about our relationships.
Which foreign keys exist, what happens when a row is deleted, max lengths for strings.
One configuration file per entity.

**NotificationHub** — the SignalR hub. This is the server-side websocket endpoint.
When a client connects, they join a group named after their userId.
This means we can push a notification to one specific user.

**NotificationService** — implements INotificationService.
Uses SignalR's HubContext to push messages to connected clients.

**DependencyInjection.cs** — a single method `AddInfrastructure()` that registers everything.
API just calls this one method and gets everything configured.

**You will learn:** what IdentityDbContext gives you for free, how EF Core configurations work, how SignalR groups allow targeting specific users, why each layer registers its own dependencies.

---

### Step 5 — API (Program.cs + Controllers)
This is the HTTP layer. It receives requests and sends responses.

**appsettings.json** — database connection string + JWT configuration (key, issuer, expiry).

**Program.cs** — the startup file. Registers:
- Infrastructure (calls AddInfrastructure)
- MediatR (so controllers can send commands/queries)
- Identity (user management, password hashing, roles)
- JWT Bearer authentication
- CORS (so the React app on a different port can talk to the API)
- SignalR hub route

Also seeds the database on startup: creates the 3 roles (Admin, Supervisor, Worker)
and one default admin account so we can log in immediately.

**Controllers — one per feature area:**
- AuthController — register, login, returns a JWT token
- SectorsController — get all sectors, create sector (Admin only)
- ProductsController — get products by sector, create product (Admin/Supervisor)
- TasksController — get tasks by sector (feeds Kanban), create task, update status
- CommentsController — add a comment to a task
- MessagesController — send a message, get a conversation

**Rule for all controllers:** receive request → call MediatR.Send() → return response.
No business logic. No database calls. Just routing.

**You will learn:** how Identity + JWT work together, why controllers should be thin, how roles protect specific endpoints, how JWT claims carry the logged-in user's ID so controllers know who is making the request.

---

### Step 6 — Migrations + First Run
We generate the database migration (the SQL that creates all our tables),
run the app for the first time, and test every endpoint using Scalar UI.

Test checklist:
- Login as admin → get a JWT token
- Create a sector
- Create a product in that sector
- Create a task assigned to a worker
- Verify the worker gets a notification
- Post a comment on the task
- Send a private message

**You will learn:** how EF Core migrations work, how to test an API without a frontend.

---

### Step 7 — React Frontend
A Vite + React app with Tailwind CSS.

**Pages:**
- LoginPage — email/password form, stores JWT in localStorage
- DashboardPage — shows all sectors as clickable cards
- SectorBoardPage — the Kanban board for one sector
- MessagesPage — private messaging between users

**Kanban Board (SectorBoardPage):**
Fetches all tasks for the sector. Groups them by status into 3 columns (Todo / In Progress / Done).
Each task is a card showing: title, assigned worker's name, due date color
(red = overdue, yellow = due soon, white = fine).
Workers can move cards between columns.

**Real-time notifications:**
On login, the React app connects to the SignalR hub (passes the JWT in the URL).
When a notification arrives, a bell icon in the navbar shows a badge count.

**Private messaging:**
A list of users → click one → see the conversation → type and send.

**You will learn:** how to connect a React app to a .NET API, how to use SignalR from JavaScript, how to build a Kanban board UI with Tailwind.

---

### Step 8 — Deploy
- Add PostgreSQL support to Infrastructure (switch from SQLite for production)
- Add a Dockerfile to the API project
- Deploy API + PostgreSQL database to **Railway** (free tier)
- Deploy React app to **Vercel** (free tier)
- Smoke test the live URL — make sure everything works end to end

**You will learn:** how to configure an app for different environments (dev vs prod), how to deploy a .NET container, how environment variables replace hardcoded config in production.

---

## What you will know when Phase 1 is done

- Clean Architecture — why it exists and how to enforce it
- ASP.NET Core Identity — the professional way to handle auth
- CQRS with MediatR — how to structure business logic cleanly
- EF Core with Identity — relationships, configurations, migrations
- SignalR — real-time server-to-client communication
- React with a real backend — auth, protected routes, live data
- Deployment — a working live URL you can put on your CV

---

## Phase 2 (after deployment — future)

- Drag and drop between Kanban columns
- Checklists inside task cards (sub-tasks)
- Dashboard with charts (stock levels, task completion)
- Activity log (who did what, when)

---




IRequest<T> — marks this record as a MediatR request that returns T
IRequestHandler<TRequest, TResponse> — marks a class as the handler for that request