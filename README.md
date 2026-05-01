# Team Task Manager

A full-stack, role-based task management web application built to facilitate team collaboration, project organization, and real-time progress tracking. Developed as part of a full-stack evaluation assignment.

---

## 🌐 Live Deployment

- Frontend (Vercel): https://team-task-manager-sandy.vercel.app/login 
- Backend API (Railway): team-task-manager-production-2380.up.railway.app 
- Demo Video: https://drive.google.com/file/d/1l97Qz85ZIp9vHHAG5yKdv4mcQRI9rfCG/view?usp=sharing  

---

## 📌 Assignment Feature Coverage

This application fulfills all required assignment criteria:

- ✔ Authentication (Signup/Login using JWT)
- ✔ Project & Team Management (create projects, manage members)
- ✔ Task Management (create, assign, update status)
- ✔ Dashboard (task statistics, overdue tracking)
- ✔ Role-Based Access Control (Admin / Member)
- ✔ REST API with MongoDB database
- ✔ Deployed and fully functional

---

## 🚀 Core Features

### 🔐 Authentication
- Secure Signup and Login
- JWT-based authentication
- Password hashing using bcrypt
- Protected backend routes

---

### 🔑 Role-Based Access Control (RBAC)

Admin:
- Create and manage projects  
- Add/remove members  
- Create and assign tasks  

Member:
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
- Persistent storage in MongoDB

---

### 📊 Dashboard
- Total tasks  
- Completed tasks  
- Pending tasks  
- Overdue tasks  
- Tasks assigned to current user  

---

## 🛠️ Tech Stack

### Frontend
- React 18  
- Vite  
- Tailwind CSS v4  
- React Router v6  
- Axios  

### Backend
- Node.js  
- Express.js  
- JWT Authentication  

### Database
- MongoDB Atlas  
- Mongoose ODM  

### Deployment
- Frontend: Vercel  
- Backend: Railway  
- Database: MongoDB Atlas  

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

### User
- name  
- email (unique)  
- password (hashed)  
- role (Admin / Member)  

### Project
- title  
- description  
- createdBy  
- members[]  

### Task
- title  
- description  
- assignedTo  
- projectId  
- status  
- deadline  

### Relationships
- One Project → Many Tasks  
- One User → Many Assigned Tasks  

---

## 📂 Project Structure

id="cwqk2u" /frontend   → React application   /backend    → Express API  

---

## ⚙️ Environment Variables

### Backend (backend/.env)
id="9pn03g" PORT=5001 MONGO_URI=your_mongodb_connection_string JWT_SECRET=your_secret CLIENT_URL=https://your-frontend-url.vercel.app

### Frontend (frontend/.env)
id="yz42v4" VITE_API_URL=https://your-backend-url.up.railway.app/api

---

## 🚀 Installation & Setup

### Clone Repository
id="7a0r2h" git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git cd YOUR_REPO_NAME

---

### Backend Setup
id="gqv4c8" cd backend npm install npm run dev

---

### Frontend Setup
id="rb7f9z" cd frontend npm install npm run dev

---

## 🌐 Deployment

- Backend deployed on Railway with environment variables  
- Frontend deployed on Vercel and connected to backend  
- MongoDB Atlas used as cloud database  

---

## 🧪 Demo Credentials

Admin
- Email: admin@test.com  
- Password: password123  

Member
- Email: member@test.com  
- Password: password123  

---

## ✨ UI Highlights

- Modern dark-themed UI  
- Responsive design  
- Clean and intuitive layout  
- Smooth user experience  

---

## ⚠️ Challenges & Learnings

- Implementing secure JWT authentication  
- Designing role-based access control  
- Managing relationships between entities  
- Handling full-stack deployment (Railway + Vercel)  

---

## 🚀 Future Improvements

- Real-time updates (WebSockets)  
- Drag-and-drop task board  
- Notifications system  
- Advanced filtering/search  

---

## 👨‍💻 Author

- Your Name  
- GitHub: https://github.com/Nawazishkarim07  
