const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// --- Project Schema ---
const projectSchema = new mongoose.Schema({
  projectCode: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// --- Task Schema ---
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  deadline: { type: Date, required: true }
}, { timestamps: true });

projectSchema.index({ createdBy: 1 });
projectSchema.index({ members: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ projectId: 1 });

module.exports = {
  User: mongoose.model('User', userSchema),
  Project: mongoose.model('Project', projectSchema),
  Task: mongoose.model('Task', taskSchema)
};
