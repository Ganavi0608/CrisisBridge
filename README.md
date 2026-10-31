# CrisisBridge – Emergency Resource Coordination System

## 1. Project Overview

**CrisisBridge** is a DBMS-based emergency resource coordination system designed to manage donations and distribute essential resources to people affected by natural disasters and emergency situations.

The system connects donors, emergency events and relief requests through a centralized database. It helps administrators record donations, manage relief requirements, manually allocate available resources and monitor the fulfillment status of requests.

The main objective is to improve the organization, tracking and coordination of emergency relief resources.

## 2. Objectives

- Maintain records of donors and donated resources.
- Manage emergency events such as floods and storms.
- Register relief requests from affected areas.
- Track the resources and quantities required for each request.
- Record donations received from individuals and organizations.
- Manually allocate donated resources to relief requests.
- Monitor request fulfillment and resource shortages.
- Generate reports for tracking relief activities.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend tooling | Vite |
| Backend | Node.js |
| Backend framework | Express.js |
| Database | MySQL 8.0 |
| Database connectivity | MySQL2 |
| API communication | REST API |
| Development tools | VS Code, MySQL Workbench |
| Version control | Git and GitHub |

## 4. Main Features

### Dashboard
Displays an overview of the system, including donor information, active emergency events, relief requests and donation statistics.

### Donor Management
- Register new donors.
- Store donor contact details.
- Support Individual, NGO and Corporate donor types.
- View registered donors.

### Resource Management
- Add new resource categories.
- Maintain resource names and measurement units.
- View available resource categories.

### Donation Management
- Record donations from registered donors.
- Select the donated resource.
- Enter donation quantities and dates.
- View donation records.

### Relief Request Management
- Register relief requests associated with emergency events.
- Record requester details and affected locations.
- Set urgency levels.
- Add required resources and quantities.
- Track request statuses.

### Manual Resource Allocation
- Select a donation and a matching relief request.
- Allocate resources manually.
- Validate available donation and requested quantities.
- Maintain an allocation history.

### Emergency Event Management
- Add new emergency events.
- Specify event names, types, affected areas and dates.
- Edit event information.
- Update event statuses to Active, Resolved or Closed.

### Reports
- View resource fulfillment information.
- Identify outstanding resource shortages.
- Monitor the progress of relief requests.

## 5. Database Design

The project uses a MySQL database named `crisisbridge`.

It consists of seven main tables:

| Table | Purpose |
|---|---|
| donors | Stores donor details |
| resources | Stores resource categories and units |
| emergency_events | Stores emergency event information |
| relief_requests | Stores relief requests |
| request_items | Stores resources required for each request |
| donations | Stores donation records |
| allocations | Stores resource allocation records |

### Important Relationships

- One donor can make multiple donations.
- One resource can be associated with multiple donations.
- One emergency event can have multiple relief requests.
- One relief request can contain multiple request items.
- One resource can be requested in multiple request items.
- One donation can be allocated across multiple request items.
- One request item can receive allocations from multiple donations.

Primary keys and foreign keys maintain relationships and referential integrity between tables.

## 6. Project Structure

```text
CrisisBridge/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Allocations.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Donors.jsx
│   │   ├── Resources.jsx
│   │   ├── Donations.jsx
│   │   ├── ReliefRequests.jsx
│   │   ├── Events.jsx
│   │   └── Reports.jsx
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   └── crisisbridge.sql
│
├── .gitignore
└── README.md
```

## 7. Installation and Setup

### Prerequisites

Install the following:

- Node.js and npm
- MySQL Server 8.0
- MySQL Workbench
- Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ganavi0608/CrisisBridge.git
cd CrisisBridge
```

### Step 2: Set Up the Database

1. Open MySQL Workbench.
2. Connect to your MySQL server.
3. Create a database named `crisisbridge`, if it does not already exist.
4. Import the `database/crisisbridge.sql` file.
5. Verify that all seven tables have been created.

### Step 3: Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crisisbridge
```

Replace `your_mysql_password` with your own MySQL password.

**Important:** Never upload your `.env` file or database password to GitHub.

Start the backend server:

```bash
npm start
```

The backend runs at:

`http://localhost:5000`

### Step 4: Configure the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

`http://localhost:5173`

## 8. API Endpoints

The backend provides REST API endpoints for managing project data.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/test-db | Test database connection |
| GET | /api/dashboard | Dashboard statistics |
| GET | /api/recent-requests | Recent relief requests |
| GET, POST | /api/donors | Manage donors |
| GET, POST | /api/resources | Manage resources |
| GET, POST | /api/donations | Manage donations |
| GET | /api/events | Retrieve active events |
| GET | /api/events/all | Retrieve all events |
| POST | /api/events | Add emergency event |
| PUT | /api/events/:id | Update emergency event |
| GET, POST | /api/relief-requests | Manage relief requests |
| GET | /api/allocation-donations | Retrieve donation balances |
| GET | /api/allocation-requests | Retrieve request balances |
| GET, POST | /api/allocations | Manage allocations |
| GET | /api/reports/fulfillment | View fulfillment report |
| GET | /api/reports/shortages | View shortage report |

## 9. Data Integrity and Validation

The database uses:

- **Primary Keys** to uniquely identify records.
- **Foreign Keys** to maintain relationships between tables.
- **NOT NULL constraints** to ensure required information is provided.
- **UNIQUE constraints** to prevent duplicate values where required.
- **CHECK constraints** to validate quantities and permitted status values.
- **Transactions** for operations that involve multiple related database changes.

The allocation process validates resource compatibility and checks available quantities before recording an allocation.

## 10. Future Enhancements

Possible future improvements include:

- User authentication and role-based access.
- Email or SMS notifications for relief updates.
- Location-based emergency coordination.
- Improved inventory tracking.
- More detailed administrative reporting.

## 11. Team

**Project Name:** CrisisBridge – Emergency Resource Coordination System

**Project Type:** DBMS Mini Project

**Team Size:** 2 Members

## 12. Repository

GitHub: https://github.com/Ganavi0608/CrisisBridge

---

**CrisisBridge – Connecting Donations with Emergency Needs.**
