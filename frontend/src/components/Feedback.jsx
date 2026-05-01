import { CheckCircle2, CircleDashed, ClipboardList, Loader2, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export const ButtonSpinner = () => (
  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
);

export const SkeletonCard = () => (
  <div className="min-h-[120px] rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
    <div className="flex items-center gap-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-slate-800" />
      <div className="w-full space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
        <div className="h-8 w-16 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  </div>
);

export const EmptyState = ({ icon: Icon = SearchX, title, message }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-3xl border border-dashed border-white/10 bg-slate-900/45 p-8 text-center backdrop-blur-xl"
  >
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80 text-cyan-300 shadow-lg shadow-cyan-950/30">
      <Icon size={24} />
    </div>
    <h3 className="font-semibold text-white">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>
  </motion.div>
);

const statusClasses = {
  'To Do': 'border-rose-800 bg-rose-950/80 text-rose-100 focus:border-rose-500 focus:ring-rose-500/20',
  'In Progress': 'border-amber-800 bg-amber-950/80 text-amber-100 focus:border-amber-500 focus:ring-amber-500/20',
  Done: 'border-emerald-800 bg-emerald-950/80 text-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20',
};

const statusIcons = {
  'To Do': CircleDashed,
  'In Progress': ClipboardList,
  Done: CheckCircle2,
};

export const StatusSelect = ({ value, onChange, disabled = false, label = 'Task status' }) => {
  const Icon = statusIcons[value] || CircleDashed;

  return (
    <label className="relative inline-flex w-full min-w-[170px] sm:w-auto">
      <span className="sr-only">{label}</span>
      <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-current" />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full rounded-full border py-2 pl-9 pr-9 text-sm font-semibold outline-none transition duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${statusClasses[value]}`}
      >
        <option>To Do</option>
        <option>In Progress</option>
        <option>Done</option>
      </select>
    </label>
  );
};

export const MotionButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ y: -1, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);
