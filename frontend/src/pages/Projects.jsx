import { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import API from '../api/axiosSetup';
import { AuthContext } from '../context/AuthContextValue';
import { ChevronRight, ClipboardList, Filter, Folder, FolderPlus, Search, UserPlus, X } from 'lucide-react';
import { ButtonSpinner, EmptyState, MotionButton, SkeletonCard, StatusSelect } from '../components/Feedback';
import { itemVariants, pageVariants } from '../components/motionVariants';

const emptyProjectForm = { projectCode: '', title: '', description: '' };
const emptyTaskForm = {
  title: '',
  description: '',
  assignedTo: '',
  deadline: '',
  status: 'To Do',
};

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const getProjectDisplayId = (project) => project?.projectCode || project?._id?.slice(-8).toUpperCase();

const statusIndicatorClasses = {
  'To Do': 'from-rose-500 to-fuchsia-500',
  'In Progress': 'from-amber-400 to-violet-500',
  Done: 'from-emerald-400 to-cyan-400',
};

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('All');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'Admin';
  const activeProject = useMemo(
    () => projects.find((project) => project._id === activeProjectId),
    [projects, activeProjectId]
  );
  const availableMembers = useMemo(() => {
    if (!activeProject) return users;
    const existing = new Set(activeProject.members?.map((member) => member._id));
    return users.filter((member) => !existing.has(member._id));
  }, [activeProject, users]);
  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) => (
      project.title.toLowerCase().includes(query)
      || project.projectCode?.toLowerCase().includes(query)
      || project.description?.toLowerCase().includes(query)
    ));
  }, [projects, projectSearch]);
  const filteredTasks = useMemo(() => {
    if (taskStatusFilter === 'All') return tasks;
    return tasks.filter((task) => task.status === taskStatusFilter);
  }, [tasks, taskStatusFilter]);

useEffect(() => {
    let isMounted = true;

    // First, always fetch projects
    API.get('/projects')
      .then((res) => {
        if (!isMounted) return;
        const loadedProjects = res.data;
        setProjects(loadedProjects);
        setTasksLoading(Boolean(loadedProjects[0]?._id));
        setActiveProjectId((current) => current || loadedProjects[0]?._id || '');
      })
      .catch((err) => {
        if (isMounted) {
          const message = err.response?.data?.message || 'Failed to load projects';
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    // Then, if admin, fetch users separately (so project loading doesn't fail if users fail)
    if (isAdmin) {
      API.get('/users')
        .then((res) => {
          if (isMounted) {
            setUsers(res.data);
          }
        })
        .catch((err) => {
          if (isMounted) {
            const message = err.response?.data?.message || 'Failed to load team members';
            console.error('Users load error:', message);
            // Don't show error toast for users - let projects load first
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!activeProjectId) {
      return;
    }

    let isMounted = true;

    API.get(`/tasks?projectId=${activeProjectId}`)
      .then((res) => {
        if (isMounted) {
          setTasks(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err.response?.data?.message || 'Failed to load tasks';
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setTasksLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeProjectId]);

  const refreshProjects = async () => {
    const { data } = await API.get('/projects');
    setProjects(data);
    setActiveProjectId((current) => current || data[0]?._id || '');
    return data;
  };

  const selectProject = (projectId) => {
    if (projectId !== activeProjectId) {
      setTasksLoading(true);
    }
    setActiveProjectId(projectId);
  };

  const refreshTasks = async (projectId = activeProjectId) => {
    if (!projectId) return;
    const { data } = await API.get(`/tasks?projectId=${projectId}`);
    setTasks(data);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingProject(true);

    try {
      const { data } = await API.post('/projects', { ...projectForm, projectCode: projectForm.projectCode.toUpperCase(), members: [] });
      setProjectForm(emptyProjectForm);
      await refreshProjects();
      setActiveProjectId(data._id);
      toast.success('Project created');
    } catch (err) {
      const message = err.response?.data?.message || 'Error creating project';
      setError(message);
      toast.error(message);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd || !activeProjectId) return;
    setError('');
    setAddingMember(true);

    try {
      const { data } = await API.put(`/projects/${activeProjectId}/members`, { members: [memberToAdd] });
      setProjects((current) => current.map((project) => (project._id === data._id ? data : project)));
      setMemberToAdd('');
      toast.success('Member added');
    } catch (err) {
      const message = err.response?.data?.message || 'Error adding member';
      setError(message);
      toast.error(message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setError('');

    try {
      const { data } = await API.delete(`/projects/${activeProjectId}/members/${memberId}`);
      setProjects((current) => current.map((project) => (project._id === data._id ? data : project)));
      await refreshTasks();
      toast.success('Member removed');
    } catch (err) {
      const message = err.response?.data?.message || 'Error removing member';
      setError(message);
      toast.error(message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingTask(true);

    try {
      await API.post('/tasks', { ...taskForm, projectId: activeProjectId });
      setTaskForm(emptyTaskForm);
      await refreshTasks();
      toast.success('Task created');
    } catch (err) {
      const message = err.response?.data?.message || 'Error creating task';
      setError(message);
      toast.error(message);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError('');
    setUpdatingTaskId(taskId);

    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status });
      setTasks((current) => current.map((task) => (task._id === data._id ? data : task)));
      toast.success('Task status updated');
    } catch (err) {
      const message = err.response?.data?.message || 'Error updating task';
      setError(message);
      toast.error(message);
    } finally {
      setUpdatingTaskId('');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="app-surface p-4 sm:p-6 md:p-8"
    >
      <header className="relative z-10 mb-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-400 shadow-lg shadow-blue-950/40">
              <Folder size={28} className="text-white" />
            </span>
            Project Hub
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 mt-3">Manage projects, members, and assigned tasks.</motion.p>
        </div>
        <motion.div whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Link to="/dashboard" className="secondary-button min-h-12 px-5 py-2 flex items-center justify-center gap-2">
            Back to Dashboard <ChevronRight size={18} />
          </Link>
        </motion.div>
      </header>

      {error && (
        <motion.div variants={itemVariants} className="relative z-10 mb-6 rounded-2xl border border-rose-400/20 bg-rose-950/50 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
          {error}
        </motion.div>
      )}

      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(280px,340px)_1fr] gap-6 xl:gap-8">
        <motion.aside variants={pageVariants} className="space-y-5">
          {isAdmin && (
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} className="premium-card p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FolderPlus size={20} className="text-cyan-300" /> New Project
              </h2>
              <form onSubmit={handleCreateProject} className="space-y-3">
                <input
                  type="text"
                  placeholder="Project ID, e.g. PROJ-001"
                  required
                  value={projectForm.projectCode}
                  onChange={(e) => setProjectForm((current) => ({ ...current, projectCode: e.target.value.toUpperCase() }))}
                  className="premium-input w-full p-3"
                  aria-label="Project ID"
                />
                <input
                  type="text"
                  placeholder="Project title"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm((current) => ({ ...current, title: e.target.value }))}
                  className="premium-input w-full p-3"
                />
                <textarea
                  placeholder="Description"
                  rows="3"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((current) => ({ ...current, description: e.target.value }))}
                  className="premium-input w-full p-3 resize-none"
                />
                <MotionButton
                  disabled={creatingProject}
                  className="premium-button inline-flex min-h-12 w-full items-center justify-center gap-2 py-3"
                >
                  {creatingProject && <ButtonSpinner />}
                  {creatingProject ? 'Creating...' : 'Create Project'}
                </MotionButton>
              </form>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="premium-card p-3">
            <div className="px-2 pt-2 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Projects
              </h2>
              <label className="relative mt-3 block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects"
                  className="premium-input h-11 w-full pl-9 pr-3 text-sm"
                />
              </label>
            </div>
            {loading ? (
              <div className="space-y-3 p-2">
                <SkeletonCard />
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={Folder}
                title="No projects yet"
                message={isAdmin ? 'Create your first project to start organizing work.' : 'You have not been added to any projects yet.'}
              />
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matching projects"
                message="Try a different search term or clear the search field."
              />
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <motion.button
                    key={project._id}
                    type="button"
                    whileHover={{ x: 3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectProject(project._id)}
                    className={`w-full text-left rounded-2xl p-3 transition duration-200 border ${activeProjectId === project._id ? 'border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-950/20' : 'border-transparent hover:bg-white/5'}`}
                  >
                    <span className="mb-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                      {getProjectDisplayId(project)}
                    </span>
                    <span className="block font-semibold text-white">{project.title}</span>
                    <span className="block text-xs text-slate-500 mt-1">{project.members?.length || 0} members</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.aside>

        <motion.main variants={pageVariants} className="space-y-6">
          {!activeProject ? (
            <EmptyState
              icon={Folder}
              title="Select a project"
              message="Choose a project from the sidebar to view members and tasks."
            />
          ) : (
            <>
              <motion.section variants={itemVariants} whileHover={{ y: -3 }} className="premium-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                      Project ID: {getProjectDisplayId(activeProject)}
                    </span>
                    <h2 className="text-2xl font-bold text-white md:text-3xl">{activeProject.title}</h2>
                    <p className="text-slate-400 mt-2">{activeProject.description || 'No description provided.'}</p>
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                    Created {formatDate(activeProject.createdAt)}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Members</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.members?.map((member) => (
                      <span key={member._id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 backdrop-blur">
                        {member.name}
                        {isAdmin && member._id !== user?._id && (
                          <button type="button" onClick={() => handleRemoveMember(member._id)} className="text-slate-500 hover:text-rose-300">
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {isAdmin && (
                    <form onSubmit={handleAddMember} className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <select
                        value={memberToAdd}
                        onChange={(e) => setMemberToAdd(e.target.value)}
                        className="premium-input flex-1 p-3"
                      >
                        <option value="">Select member to add</option>
                        {availableMembers.map((member) => (
                          <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                        ))}
                      </select>
                      <MotionButton
                        disabled={addingMember || !memberToAdd}
                        className="secondary-button inline-flex min-h-12 items-center justify-center gap-2 px-4"
                      >
                        {addingMember ? <ButtonSpinner /> : <UserPlus size={18} />}
                        {addingMember ? 'Adding...' : 'Add'}
                      </MotionButton>
                    </form>
                  )}
                </div>
              </motion.section>

              {isAdmin && (
                <motion.section variants={itemVariants} whileHover={{ y: -3 }} className="premium-card p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ClipboardList className="text-cyan-300" /> Create Task
                  </h3>
                  <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Task title"
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm((current) => ({ ...current, title: e.target.value }))}
                      className="premium-input p-3"
                    />
                    <select
                      required
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm((current) => ({ ...current, assignedTo: e.target.value }))}
                      className="premium-input p-3"
                    >
                      <option value="">Assign to member</option>
                      {activeProject.members?.map((member) => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      required
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm((current) => ({ ...current, deadline: e.target.value }))}
                      className="premium-input p-3"
                    />
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm((current) => ({ ...current, status: e.target.value }))}
                      className="premium-input p-3"
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                    <textarea
                      placeholder="Task description"
                      rows="3"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm((current) => ({ ...current, description: e.target.value }))}
                      className="premium-input md:col-span-2 p-3 resize-none"
                    />
                    <MotionButton
                      disabled={creatingTask}
                      className="premium-button md:col-span-2 inline-flex min-h-12 items-center justify-center gap-2 py-3"
                    >
                      {creatingTask && <ButtonSpinner />}
                      {creatingTask ? 'Creating task...' : 'Create and Assign Task'}
                    </MotionButton>
                  </form>
                </motion.section>
              )}

              <motion.section variants={itemVariants} className="premium-card p-5 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-bold text-white">Tasks</h3>
                  <label className="premium-input inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                    <Filter size={16} />
                    <span className="sr-only">Filter tasks by status</span>
                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                      className="bg-transparent text-white outline-none"
                    >
                      <option>All</option>
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </label>
                </div>
                <div className="space-y-3">
                  {tasksLoading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : tasks.length === 0 ? (
                    <EmptyState
                      icon={ClipboardList}
                      title="No tasks yet"
                      message={isAdmin ? 'Create and assign the first task for this project.' : 'No tasks have been assigned in this project yet.'}
                    />
                  ) : filteredTasks.length === 0 ? (
                    <EmptyState
                      icon={Filter}
                      title="No tasks match this filter"
                      message="Switch the status filter to see more tasks."
                    />
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.div
                        key={task._id}
                        variants={itemVariants}
                        whileHover={{ y: -4, scale: 1.004 }}
                        className="premium-card relative overflow-hidden p-4"
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${statusIndicatorClasses[task.status]}`} />
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <h4 className="text-base font-bold text-white md:text-lg">{task.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Project {task.projectId?.title || 'No project'} ({getProjectDisplayId(task.projectId)}) | Assigned to {task.assignedTo?.name || 'Unknown'} | Due {formatDate(task.deadline)}
                            </p>
                            {task.description && <p className="text-sm text-slate-400 mt-2">{task.description}</p>}
                          </div>
                          {task.assignedTo?._id === user?._id ? (
                            <div className="flex items-center gap-3">
                              {updatingTaskId === task._id && <ButtonSpinner />}
                              <StatusSelect
                              value={task.status}
                              disabled={updatingTaskId === task._id}
                              onChange={(status) => handleStatusChange(task._id, status)}
                            />
                            </div>
                          ) : (
                            <StatusSelect value={task.status} disabled onChange={() => {}} />
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.section>
            </>
          )}
        </motion.main>
      </div>
    </motion.div>
  );
}
