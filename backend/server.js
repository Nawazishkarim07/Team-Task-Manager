require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Import Error Middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Import Database Schemas
const { User } = require('./models/schemas');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Global Error Handler ---
app.use(errorHandler);

// --- Database Connection & Server Initialization ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');

    // Auto-Seed Admin User (Creates admin if database is empty)
    try {
      const adminExists = await User.findOne({ email: 'admin@test.com' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
          name: 'Admin User',
          email: 'admin@test.com',
          password: hashedPassword,
          role: 'Admin'
        });
        console.log('✅ Admin account forced into database!');
      } else {
         console.log('✅ Admin account already exists.');
      }
    } catch (err) {
      console.log('⚠️ Database Seeding Error:', err.message);
    }

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
  });