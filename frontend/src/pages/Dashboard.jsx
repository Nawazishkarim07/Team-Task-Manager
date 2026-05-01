import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import API from '../api/axiosSetup';
import { AuthContext } from '../context/AuthContextValue';
import { CheckCircle, AlertCircle, Clock, LayoutDashboard, FolderKanban, ClipboardList, ArrowRight } from 'lucide-react';
import { ButtonSpinner, EmptyState, MotionButton, SkeletonCard, StatusSelect } from '../components/Feedback';
import { itemVariants, pageVariants } from '../components/motionVariants';

const iconColorClasses = {
  blue: 'from-blue-500 to-cyan-400 text-cyan-100 shadow-blue-950/50',
  emerald: 'from-emerald-500 to-cyan-400 text-emerald-50 shadow-emerald-950/50',
  amber: 'from-amber-500 to-violet-500 text-amber-50 shadow-amber-950/50',
  rose: 'from-rose-500 to-violet-500 text-rose-50 shadow-rose-950/50',
};

const statusIndicatorClasses = {
  'To Do': 'from-rose-500 to-fuchsia-500',
  'In Progress': 'from-amber-400 to-violet-500',
  Done: 'from-emerald-400 to-cyan-400',
};

const CountUp = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 700;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.round(value * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return displayValue;
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -6, scale: 1.015 }}
    className="group relative min-h-[132px] overflow-hidden rounded-3xl bg-gradient-to-br from-white/16 via-white/5 to-transparent p-px shadow-2xl shadow-slate-950/50"
  >
    <div className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70 bg-gradient-to-br from-blue-600/25 via-violet-500/15 to-cyan-400/25" />
    <div className="relative flex h-full items-center space-x-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${iconColorClasses[color]} shadow-xl`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    </div>
  </motion.div>
);

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const getProjectDisplayId = (project) => project?.projectCode || project?._id?.slice(-8).toUpperCase();

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    assignedTasks: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;

    API.get('/dashboard')
      .then((res) => {
        if (isMounted) {
          setDashboard(res.data);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err.response?.data?.message || 'Failed to load dashboard';
          setError(message);
          toast.error(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateTaskStatus = async (taskId, status) => {
    setUpdatingTaskId(taskId);

    try {
      const { data } = await API.put(`/tasks/${taskId}`, { status });
      setDashboard((current) => {
        const replaceTask = (task) => (task._id === data._id ? data : task);
        const tasks = current.tasks.map(replaceTask);
        const assignedTasks = current.assignedTasks.map(replaceTask);
        const now = new Date();

        return {
          ...current,
          tasks,
          assignedTasks,
          completed: tasks.filter((task) => task.status === 'Done').length,
          pending: tasks.filter((task) => task.status !== 'Done').length,
          overdue: tasks.filter((task) => task.status !== 'Done' && new Date(task.deadline) < now).length,
        };
      });
      toast.success('Task status updated');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update task';
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
      <header className="relative z-10 mb-8 md:mb-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Welcome, {user?.name || 'User'}
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-2 text-slate-400">
              Role: <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-cyan-200">{user?.role}</span>
            </motion.p>
            <motion.p variants={itemVariants} className="mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
              Projects are the center of the workspace. Jump straight into your active project hub, then manage tasks and members from there.
            </motion.p>
          </div>
          <MotionButton onClick={logout} className="secondary-button min-h-12 px-5 py-2 self-start">
            Logout
          </MotionButton>
        </div>

        <motion.div variants={itemVariants} className="mt-6">
          <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.985 }}>
            <Link
              to="/projects"
              className="group relative block overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 p-[1px] shadow-[0_24px_80px_rgba(8,47,73,0.45)]"
            >
              <span className="absolute inset-0 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-90 bg-cyan-400/35" />
              <span className="relative grid min-h-[190px] gap-8 rounded-[2rem] bg-slate-950/55 px-6 py-6 backdrop-blur-xl md:grid-cols-[1.3fr_0.7fr] md:px-8 md:py-7">
                <span className="flex flex-col justify-between gap-6">
                  <span>
                    <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/90">
                      Primary Workspace
                    </span>
                    <span className="mt-4 block text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                      Open Projects
                    </span>
                    <span className="mt-3 block max-w-xl text-sm leading-6 text-slate-200/80 md:text-base">
                      Create projects, track the right tasks, and keep member work visible from one place.
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                    Go to project workspace
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </span>

                <span className="flex items-center justify-start md:justify-end">
                  <span className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/15 bg-white/10 text-white shadow-2xl shadow-cyan-950/30 md:h-28 md:w-28">
                    <FolderKanban size={42} />
                  </span>
                </span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </header>

      {error && (
        <motion.div variants={itemVariants} className="relative z-10 mb-6 rounded-2xl border border-rose-400/20 bg-rose-950/50 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
          {error}
        </motion.div>
      )}

      <motion.div variants={pageVariants} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard title="Total Tasks" value={<CountUp value={dashboard.total} />} icon={LayoutDashboard} color="blue" />
            <StatCard title="Completed" value={<CountUp value={dashboard.completed} />} icon={CheckCircle} color="emerald" />
            <StatCard title="Pending" value={<CountUp value={dashboard.pending} />} icon={Clock} color="amber" />
            <StatCard title="Overdue" value={<CountUp value={dashboard.overdue} />} icon={AlertCircle} color="rose" />
          </>
        )}
      </motion.div>

      <motion.section variants={itemVariants} className="relative z-10 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white md:text-2xl">My Assigned Tasks</h2>
          {loading && <span className="inline-flex items-center gap-2 text-sm text-slate-500"><ButtonSpinner /> Loading</span>}
        </div>

        <div className="space-y-3">
          {!loading && dashboard.assignedTasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assigned tasks"
              message="You are all clear for now. Assigned work will appear here as soon as it is created."
            />
          ) : (
            dashboard.assignedTasks.map((task) => (
              <motion.div
                key={task._id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.005 }}
                className="premium-card relative overflow-hidden p-5"
              >
                <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${statusIndicatorClasses[task.status]}`} />
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white md:text-lg">{task.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {task.projectId?.title || 'No project'} ({getProjectDisplayId(task.projectId)}) | Due {formatDate(task.deadline)}
                    </p>
                    {task.description && <p className="text-sm text-slate-500 mt-2">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {updatingTaskId === task._id && <ButtonSpinner />}
                    <StatusSelect
                    value={task.status}
                    disabled={updatingTaskId === task._id}
                    onChange={(status) => updateTaskStatus(task._id, status)}
                  />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
