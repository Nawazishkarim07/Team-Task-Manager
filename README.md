# Team Task Manager

A full-stack, role-based task management web application built to facilitate team collaboration, project organization, and real-time progress tracking. Developed as part of a full-stack evaluation assignment.

---

## 🌐 Live Deployment

- Frontend (Vercel): https://team-task-manager-sandy.vercel.app/login  
- Backend API (Railway): https://team-task-manager-production-2380.up.railway.app  
- Demo Video: https://drive.google.com/file/d/1l97Qz85ZIp9vHHAG5yKdv4mcQRI9rfCG/view?usp=sharing  

---

## 📌 Assignment Feature Coverage

This application fulfills all required assignment criteria:

- Authentication (Signup/Login using JWT)
- Project & Team Management (create projects, manage members)
- Task Management (create, assign, update status)
- Dashboard (task statistics, overdue tracking)
- Role-Based Access Control (Admin / Member)
- REST API with MongoDB database
- Fully deployed and functional

---

## 🚀 Core Features

### 🔐 Authentication
- Secure Signup and Login
- JWT-based authentication
- Password hashing using bcrypt
- Protected backend routes

### 🔑 Role-Based Access Control (RBAC)

**Admin:**
- Create and manage projects  
- Add/remove members  
- Create and assign tasks  

**Member:**
- View assigned projects  
- Update only their assigned tasks  

---

### 📁 Project Management
- Create new projects  
- Add team members  
- View all projects  

---

### ✅ Task Management
- Create tasks with:
  - Title
  - Description
  - Assigned user
  - Deadline
  - Status (To Do / In Progress / Done)
- Update task status
- Data stored in MongoDB

---

### 📊 Dashboard
- Total tasks  
- Completed tasks  
- Pending tasks  
- Overdue tasks  
- Tasks assigned to current user  

---

## 🛠️ Tech Stack

**Frontend**
- React 18  
- Vite  
- Tailwind CSS  
- React Router  
- Axios  

**Backend**
- Node.js  
- Express.js  
- JWT Authentication  

**Database**
- MongoDB Atlas  
- Mongoose  

**Deployment**
- Vercel (Frontend)  
- Railway (Backend)  
- MongoDB Atlas (Database)  

---

## 🧠 System Architecture

This application follows a RESTful client-server architecture:

- React frontend handles UI and routing  
- Axios manages API communication  
- Express backend handles business logic and authentication  
- MongoDB stores application data  
- JWT middleware secures protected routes  

---

## 🔌 API Endpoints

### Auth
- POST /api/auth/signup  
- POST /api/auth/login  

### Projects
- POST /api/projects  
- GET /api/projects  

### Tasks
- POST /api/tasks  
- GET /api/tasks  
- PUT /api/tasks/:id  

### Dashboard
- GET /api/dashboard  

---

## 🧱 Database Design

**User**
- name  
- email (unique)  
- password (hashed)  
- role (Admin / Member)  

**Project**
- title  
- description  
- createdBy  
- members[]  

**Task**
- title  
- description  
- assignedTo  
- projectId  
- status  
- deadline  

**Relationships**
- One Project → Many Tasks  
- One User → Many Assigned Tasks  

---

## 📂 Project Structure
team-task-manager/
├── frontend/                # frontend (React)
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                # backend (Node/Express)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── README.md

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
Frontend_URL=https://team-task-manager-sandy.vercel.app

### Frontend (`client/.env`)
VITE_API_URL=https://team-task-manager-production-2380.up.railway.app/api

---

## 🚀 Installation & Setup

### Clone Repository
### Backend Setup
cd server
npm install
npm run dev

### Frontend Setup
cd client
npm install
npm run dev

---

## 🌐 Deployment

- Backend deployed on Railway with environment variables  
- Frontend deployed on Vercel and connected to backend  
- MongoDB Atlas used as cloud database  

---

## 🧪 Demo Credentials

**Admin**
- Email: admin@test.com  
- Password: password123  

**Member**
- Email: member@test.com  
- Password: password123  

---

## ✨ UI Highlights

- Modern dark-themed UI  
- Fully responsive design  
- Clean and intuitive dashboard  
- Smooth user experience  

---

## ⚠️ Challenges & Learnings

- Implementing secure JWT authentication  
- Designing role-based access control  
- Managing relationships between users, projects, and tasks  
- Handling full-stack deployment (Railway + Vercel)  

---

## 🚀 Future Improvements

- Real-time updates (WebSockets)  
- Drag-and-drop task board  
- Notification system  
- Advanced filtering and search  

---

## 👨‍💻 Author

- Md Nawazish Karim  
- GitHub: https://github.com/Nawazishkarim07  