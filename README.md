# FUTURE_FS_02 – Client Lead Management System (Mini CRM)

<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/03783835-734c-4deb-ad85-713a04321b83" />
<img width="1919" height="924" alt="image" src="https://github.com/user-attachments/assets/63aaccd0-9585-49f1-8033-4234f4472f79" />
<img width="1917" height="920" alt="image" src="https://github.com/user-attachments/assets/b7464c72-4033-451b-a909-ed527033d4ee" />
<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/d4ba416c-e80a-4923-901d-70437e103f5a" />

A full-stack Mini CRM application built with **React, Node.js, Express, and MySQL** to streamline client lead management. The system provides lead tracking, Kanban-based workflow management, analytics dashboards, AI-powered insights, and secure admin authentication.

## Features
* Lead Management (Create, Read, Update, Delete)
* Lead Status Tracking (New, Contacted, Converted)
* Drag-and-Drop Kanban Board
* Analytics Dashboard with Visual Reports
* AI-Powered Lead Insights using Claude AI
* Secure Admin Authentication with JWT
* Notes and Follow-Up Management
* Responsive User Interface

## Tech Stack
### Frontend
* React (Vite)
* Tailwind CSS
* Lucide React
* Recharts
* @hello-pangea/dnd

### Backend
* Node.js
* Express.js
* MySQL
* bcryptjs
* JSON Web Token (JWT)

## Project Structure
FUTURE_FS_02/
├── client/     # React Frontend
├── server/     # Node.js & Express Backend
└── README.md

## Installation & Setup

### Prerequisites
* Node.js
* MySQL Server

### Database Configuration
Create a MySQL database:
```sql
CREATE DATABASE crm_db;
```

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside the server directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crm_db
JWT_SECRET=your_secret_key
```

Run the backend server:
```bash
node server.js
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Application Access
* Frontend: http://localhost:5173
* Backend API: http://localhost:5000

## Author
Aryan Sharma
SRM Institute of Science and Technology
B.Tech CSE
