import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContextValue';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={JSON.parse(localStorage.getItem('user')) ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute><Projects /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to={JSON.parse(localStorage.getItem('user')) ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
