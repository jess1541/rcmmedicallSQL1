import React, { useState } from 'react';
import { User } from '../types';
import { Lock, UserCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const USERS: User[] = [
  { name: 'Administrador', role: 'admin', password: 'admin' },
  { name: 'LUIS', role: 'executive', password: 'luis01' },
  { name: 'ORALIA', role: 'executive', password: 'oralia02' },
  { name: 'ANGEL', role: 'executive', password: 'angel03' },
  { name: 'TALINA', role: 'executive', password: 'talina04' },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.name === selectedUser);
    
    if (user && user.password === password) {
      setIsAnimating(true);
      setTimeout(() => {
          onLogin(user);
      }, 800); // Wait for animation
    } else {
      setError('Contraseña incorrecta o usuario no seleccionado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className={`relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-700 ${isAnimating ? 'scale-110 opacity-0 translate-y-[-50px]' : 'scale-100 opacity-100'}`}>
        
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-4">
                <div className="flex items-baseline leading-none">
                    <span className="text-5xl font-black text-cyan-400 tracking-tighter">RC</span>
                    <span className="text-5xl font-bold text-white ml-1">Medi</span>
                    <span className="text-5xl font-bold text-cyan-400">Call</span>
                    <span className="text-sm align-top ml-0.5 text-cyan-400 font-bold">®</span>
                </div>
                <div className="w-64 h-0.5 bg-gradient-to-r from-slate-400 via-white to-slate-400 my-2 rounded-full opacity-50"></div>
                <span className="text-xs tracking-[0.3em] text-slate-300 font-bold uppercase">Endoscopy Services</span>
          </div>
          <p className="text-blue-200 text-sm mt-4 font-medium">Plataforma de Gestión Comercial</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Quién eres</label>
            <div className="relative">
                <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <select 
                  value={selectedUser}
                  onChange={(e) => { setSelectedUser(e.target.value); setError(''); }}
                  className="w-full bg-slate-800/50 border border-slate-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block pl-10 p-3 appearance-none transition-all hover:bg-slate-800/70"
                >
                  <option value="" disabled>-- Selecciona tu perfil --</option>
                  {USERS.map(u => (
                    <option key={u.name} value={u.name} className="text-slate-900">{u.name}</option>
                  ))}
                </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blue-200 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent block pl-10 pr-10 p-3 transition-all hover:bg-slate-800/70 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-bold flex items-center animate-fadeIn">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full group relative flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-cyan-200 group-hover:text-white transition-colors" />
            </span>
            Iniciar Sesión
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400">
                Acceso restringido. Solo personal autorizado.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;