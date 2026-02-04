import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, User, LogOut, Shield, ChevronLeft, ChevronRight, X, Activity } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
    user: UserType;
    onLogout: () => void;
    isMobileOpen: boolean;
    closeMobileMenu: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isMobileOpen, closeMobileMenu, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentExec = searchParams.get('exec');

  const isActive = (path: string, matchExec?: boolean) => {
      if (matchExec !== undefined) {
          return location.pathname === path && !!currentExec === matchExec;
      }
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
  };

  const executives = [
      { name: 'LUIS', color: 'from-blue-400 to-blue-600', initials: 'LU' },
      { name: 'ORALIA', color: 'from-pink-400 to-rose-600', initials: 'OR' },
      { name: 'ANGEL', color: 'from-purple-400 to-indigo-600', initials: 'AN' },
      { name: 'TALINA', color: 'from-emerald-400 to-teal-600', initials: 'TA' }
  ];

  // Clases del contenedor principal
  const containerClasses = `
    flex flex-col bg-slate-900 text-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out z-40
    fixed inset-y-0 left-0 h-full border-r border-slate-800/50
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
    ${isCollapsed ? 'w-20' : 'w-64'}
  `;

  return (
    <>
        {/* Mobile Overlay Backdrop */}
        {isMobileOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                onClick={closeMobileMenu}
            ></div>
        )}

        <div className={containerClasses}>
            {/* Mobile Close Button */}
            <button 
                onClick={closeMobileMenu}
                className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Background Glow */}
            <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none transition-opacity duration-300 ${isCollapsed ? 'opacity-30' : 'opacity-100'}`}>
                <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-cyan-600/10 rounded-full blur-[60px]"></div>
                <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-blue-600/10 rounded-full blur-[60px]"></div>
            </div>

            {/* Header / Logo */}
            <div className="flex flex-col items-center justify-center h-24 border-b border-slate-800/50 relative z-10 transition-all duration-300 mt-8 md:mt-0">
                <div className="text-center group cursor-default flex items-center justify-center w-full h-full">
                    {isCollapsed ? (
                        <div className="flex flex-col items-center justify-center animate-fadeIn">
                            <span className="text-2xl font-black text-cyan-500 tracking-tighter">RC</span>
                            <span className="text-[8px] text-slate-500 font-bold">CRM</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center group-hover:scale-105 transition-transform animate-fadeIn">
                            <div className="flex items-baseline leading-none">
                                <span className="text-3xl font-black text-cyan-500 tracking-tighter">RC</span>
                                <span className="text-3xl font-bold text-slate-300 ml-1">Medi</span>
                                <span className="text-3xl font-bold text-cyan-500">Call</span>
                            </div>
                            <div className="w-full h-0.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 my-1 rounded-full"></div>
                            <span className="text-[8px] tracking-[0.2em] text-slate-400 font-bold uppercase">Endoscopy Services</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Desktop Toggle Button */}
            <button 
                onClick={toggleCollapse}
                className="hidden md:block absolute top-24 -right-3 z-50 bg-slate-800 text-slate-400 hover:text-white p-1 rounded-full border border-slate-700 shadow-md transform translate-y-[-50%] hover:scale-110 transition-all"
                title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            {/* Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto py-6 space-y-8 no-scrollbar z-10 overflow-x-hidden">
                <div onClick={closeMobileMenu}> {/* Auto close on mobile click */}
                    {!isCollapsed && (
                        <p className="px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 transition-opacity duration-300">
                            Menú Principal
                        </p>
                    )}
                    <nav className="space-y-1.5 px-3">
                        <SidebarLink to="/" icon={<LayoutDashboard />} label="Dashboard" isActive={isActive('/', false)} collapsed={isCollapsed} />
                        <SidebarLink to="/calendar" icon={<CalendarDays />} label="Planificación" isActive={isActive('/calendar', false)} collapsed={isCollapsed} />
                        <SidebarLink to="/doctors" icon={<Users />} label="Directorio" isActive={isActive('/doctors', false)} collapsed={isCollapsed} />
                        <SidebarLink to="/procedures" icon={<Activity />} label="Procedimientos" isActive={isActive('/procedures', false)} collapsed={isCollapsed} />
                    </nav>
                </div>

                {user.role === 'admin' && (
                    <div onClick={closeMobileMenu}>
                        {!isCollapsed && (
                            <p className="px-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 animate-fadeIn">
                                Vista de Equipo
                            </p>
                        )}
                        {isCollapsed && <div className="w-full h-px bg-slate-800 my-4 mx-auto w-10"></div>}
                        <nav className="space-y-2 px-3">
                            {executives.map((exec) => {
                                const isSelected = currentExec === exec.name;
                                return (
                                    <Link
                                        key={exec.name}
                                        to={`/calendar?exec=${exec.name}`}
                                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 text-sm font-bold rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                            isSelected 
                                            ? `bg-slate-800 text-white shadow-md ${!isCollapsed && 'translate-x-1'} border border-slate-700` 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                        }`}
                                    >
                                        <div className={`flex items-center z-10 ${isCollapsed ? 'justify-center w-full' : 'w-full'}`}>
                                            <div className={`${!isCollapsed && 'mr-3'} w-8 h-8 rounded-lg bg-gradient-to-br ${exec.color} flex items-center justify-center text-[10px] text-white shadow-sm ring-2 ring-slate-900 flex-shrink-0`}>
                                                {exec.initials}
                                            </div>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 truncate">{exec.name}</span>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-2"></div>}
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-md z-10 border-t border-slate-800">
                <div className={`bg-slate-800/50 rounded-2xl border border-slate-700/50 transition-all duration-300 ${isCollapsed ? 'p-2 flex flex-col items-center' : 'p-4'}`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center mb-2' : 'mb-3'}`}>
                        <div className={`p-0.5 rounded-full bg-gradient-to-br ${user.role === 'admin' ? 'from-yellow-400 to-orange-500' : 'from-cyan-400 to-blue-600'} flex-shrink-0`}>
                            <div className="bg-slate-800 p-2 rounded-full">
                                {user.role === 'admin' ? <Shield className="h-5 w-5 text-yellow-400" /> : <User className="h-5 w-5 text-cyan-400" />}
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{user.role === 'admin' ? 'Super Admin' : 'Ejecutivo'}</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onLogout}
                        className={`flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold ${isCollapsed ? 'w-8 h-8 p-0' : 'w-full py-2 px-4'}`}
                        title="Cerrar Sesión"
                    >
                        <LogOut className={`h-3 w-3 ${!isCollapsed && 'mr-2'}`} /> 
                        {!isCollapsed && 'Salir'}
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};

const SidebarLink = ({ to, icon, label, isActive, collapsed }: { to: string, icon: React.ReactNode, label: string, isActive: boolean, collapsed: boolean }) => (
    <Link
        to={to}
        className={`relative flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 group ${
        isActive 
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        } ${!collapsed && !isActive ? 'hover:translate-x-1' : ''} ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? label : ''}
    >
        <div className={`h-5 w-5 transition-colors flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        </div>
        {!collapsed && <span className="ml-3 truncate">{label}</span>}
    </Link>
);

export default Sidebar;