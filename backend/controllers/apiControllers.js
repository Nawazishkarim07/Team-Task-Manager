const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User, Project, Task } = require('../models/schemas');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id),
});

const toObjectIds = (ids = []) => {
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  return [...new Set(validIds.map((id) => id.toString()))];
};

const populateProject = (query) => (
  query
    .populate('createdBy', 'name email role')
    .populate('members', 'name email role')
);

const populateTask = (query) => (
  query
    .populate('assignedTo', 'name email role')
    .populate('projectId', 'title projectCode')
);

// --- Auth Controllers ---
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'Member' } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    res.status(201).json(userPayload(user));
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json(userPayload(user));
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// --- Project Controllers ---
exports.createProject = async (req, res, next) => {
  try {
    const { title, projectCode, description = '', members = [] } = req.body;
    const normalizedProjectCode = projectCode.toUpperCase().trim();
    const memberIds = toObjectIds([...members, req.user._id]);

    const projectExists = await Project.findOne({ projectCode: normalizedProjectCode });
    if (projectExists) {
      return res.status(400).json({ message: 'A project with this Project ID already exists' });
    }

    const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (memberCount !== memberIds.length) {
      return res.status(400).json({ message: 'One or more project members are invalid' });
    }

    const project = await Project.create({
      projectCode: normalizedProjectCode,
      title,
      description,
      createdBy: req.user._id,
      members: memberIds,
    });

    const populated = await populateProject(Project.findById(project._id));
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin'
      ? {}
      : { members: req.user._id };
    const projects = await populateProject(Project.find(filter).sort({ createdAt: -1 }));
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.addProjectMembers = async (req, res, next) => {
  try {
    const memberIds = toObjectIds(req.body.members);
    if (memberIds.length === 0) {
      return res.status(400).json({ message: 'Select at least one valid member' });
    }

    const users = await User.find({ _id: { $in: memberIds } }).select('_id');
    if (users.length !== memberIds.length) {
      return res.status(400).json({ message: 'One or more members are invalid' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: { $each: memberIds } } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const populated = await populateProject(Project.findById(project._id));
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.removeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberId = req.params.userId;
    project.members = project.members.filter((id) => id.toString() !== memberId);
    await project.save();

    await Task.updateMany(
      { projectId: project._id, assignedTo: memberId, status: { $ne: 'Done' } },
      { status: 'To Do' }
    );

    const populated = await populateProject(Project.findById(project._id));
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// --- Task Controllers ---
exports.createTask = async (req, res, next) => {
  try {
    const { title, description = '', assignedTo, projectId, deadline, status = 'To Do' } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    const isProjectMember = project.members.some((id) => id.toString() === assignedTo);
    if (!isProjectMember) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      deadline,
      status,
    });

    const populated = await populateTask(Task.findById(task._id));
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin'
      ? {}
      : { assignedTo: req.user._id };

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const tasks = await populateTask(Task.find(filter).sort({ deadline: 1, createdAt: -1 }));
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    task.status = req.body.status;
    await task.save();

    const populated = await populateTask(Task.findById(task._id));
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { assignedTo: req.user._id };
    const tasks = await populateTask(Task.find(filter).sort({ deadline: 1 }));
    const now = new Date();

    const stats = {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === 'Done').length,
      pending: tasks.filter((task) => task.status !== 'Done').length,
      overdue: tasks.filter((task) => task.status !== 'Done' && task.deadline < now).length,
    };

    res.json({
      ...stats,
      assignedTasks: tasks.filter((task) => task.assignedTo?._id.toString() === req.user._id.toString()),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};
