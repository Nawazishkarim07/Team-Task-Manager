import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContextValue';
import { ButtonSpinner } from '../components/Feedback';

const FULL_TEXT = 'TEAM TASK MANAGER';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back');
      } else {
        await signup(form);
        toast.success('Account created');
      }

      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Authentication failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern - Full Page */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 32px,
            #10b981 32px,
            #10b981 33px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 32px,
            #10b981 32px,
            #10b981 33px
          )`,
          backgroundSize: '33px 33px'
        }} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-slate-950/80" />
      </div>

{/* Content Container - Login Left, Banner Right (Side by Side) */}
      <div className="relative z-10 w-full max-w-5xl flex flex-row items-center justify-between gap-12">
        {/* Login Box - Left Side */}
        <div className="flex-1 max-w-md bg-slate-900/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50 transition duration-300 hover:border-slate-600">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome</h2>
            <p className="text-slate-400 mt-2">{mode === 'login' ? 'Sign in to your workspace' : 'Create your workspace account'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-lg py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Signup
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-900 bg-rose-950/70 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  value={form.name}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition"
                  onChange={(e) => updateField('name', e.target.value)}
                />
                <select
                  value={form.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition"
              onChange={(e) => updateField('email', e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={form.password}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition"
              onChange={(e) => updateField('password', e.target.value)}
            />
            <button
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 text-white font-semibold py-3 rounded-lg transition shadow-[0_0_15px_rgba(8,145,178,0.35)]"
>
              {loading && <ButtonSpinner />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Authenticate' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Banner - Right Side */}
        <div className="flex-1 text-right">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white inline-block"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              textShadow: `
                3px 3px 0 #0d9488,
                -1px -1px 0 #14b8a6,
                1px -1px 0 #0d9488,
                -1px 1px 0 #14b8a6,
                0 0 20px rgba(34,211,238,0.6),
                0 0 40px rgba(6,182,212,0.4)
              `,
            }}
          >
            {displayText}
            <span 
              className="text-emerald-400"
              style={{
                opacity: showCursor ? 1 : 0,
                animation: 'blink 0.5s infinite',
              }}
            >
              .
            </span>
          </h1>
        </div>
      </div>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
