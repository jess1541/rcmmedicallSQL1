import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/DoctorList';
import DoctorProfile from './pages/DoctorProfile';
import ExecutiveCalendar from './pages/ExecutiveCalendar';
import ProceduresManager from './pages/ProceduresManager';
import Login from './components/Login';
import { parseData } from './constants';
import { Doctor, User, Procedure, TimeOffEvent } from './types';
import { Menu, Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { io } from 'socket.io-client';

const STORAGE_KEYS = {
    USER: 'rc_medicall_user_v5',
    SIDEBAR: 'rc_medicall_sidebar_collapsed',
    DOCTORS: 'rc_medicall_doctors_data',
    PROCEDURES: 'rc_medicall_procedures_data',
    TIMEOFF: 'rc_medicall_timeoff_data'
};

// Configuración de URLs dinámica para Producción vs Desarrollo
const isProduction = process.env.NODE_ENV === 'production';
const hostname = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : '';

// En producción (Cloud Run), el backend sirve el frontend, así que usamos rutas relativas o el mismo origen
const API_URL = isProduction ? '/api' : `http://${hostname}:8080/api`;
const SOCKET_URL = isProduction ? window.location.origin : `http://${hostname}:8080`;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [timeOffEvents, setTimeOffEvents] = useState<TimeOffEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
      const savedState = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      return savedState === 'true';
  });
  const [isOnline, setIsOnline] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const toggleSidebar = () => {
      const newState = !isSidebarCollapsed;
      setIsSidebarCollapsed(newState);
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(newState));
  };

  const loadFromLocalStorage = () => {
      try {
          const localDocs = localStorage.getItem(STORAGE_KEYS.DOCTORS);
          if (localDocs) setDoctors(JSON.parse(localDocs));
          
          const localProcs = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
          if (localProcs) setProcedures(JSON.parse(localProcs));

          const localTimeOff = localStorage.getItem(STORAGE_KEYS.TIMEOFF);
          if (localTimeOff) setTimeOffEvents(JSON.parse(localTimeOff));
      } catch (e) {
          console.error("Error loading from local storage", e);
      }
  };

  const fetchData = useCallback(async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setIsSyncing(true);

      try {
          // Promise.all with silenced errors to detect offline mode properly without spamming console.error
          const [docRes, procRes] = await Promise.all([
              fetch(`${API_URL}/doctors`).catch(() => null),
              fetch(`${API_URL}/procedures`).catch(() => null)
          ]);

          let hasData = false;

          if (docRes && docRes.ok) {
              const docData = await docRes.json();
              let finalDoctors = docData;
              if (Array.isArray(docData) && docData.length === 0) {
                  console.log("Base de datos vacía, inicializando datos por defecto...");
                  finalDoctors = parseData();
                  // Init data async
                  finalDoctors.forEach((d: Doctor) => {
                      fetch(`${API_URL}/doctors`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(d)
                      }).catch(() => {});
                  });
              }
              setDoctors(finalDoctors);
              localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(finalDoctors));
              hasData = true;
          }

          if (procRes && procRes.ok) {
              const procData = await procRes.json();
              setProcedures(procData);
              localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procData));
              hasData = true;
          }

          // TimeOff is mainly local in server.js version unless added to schema, keeping local for now
          const localTimeOff = localStorage.getItem(STORAGE_KEYS.TIMEOFF);
          if (localTimeOff) setTimeOffEvents(JSON.parse(localTimeOff));

          if (hasData) {
            setIsOnline(true);
          } else {
            if (!docRes && !procRes) {
                throw new Error("No response from backend");
            }
          }

      } catch (error) {
          // Suppress error logging for expected offline mode
          if (process.env.NODE_ENV === 'development') {
             console.warn("Backend not reachable (Offline Mode active)");
          }
          setIsOnline(false);
          loadFromLocalStorage();
      } finally {
          setLoading(false);
          setIsSyncing(false);
      }
  }, []);

  useEffect(() => {
      if (!user) return; 

      let socket: any;
      try {
          socket = io(SOCKET_URL, {
              transports: ['websocket', 'polling'], // Auto-detect best transport
              reconnectionAttempts: 10,
              reconnectionDelay: 3000,
              timeout: 20000
          });

          socket.on('connect', () => {
              setSocketConnected(true);
              setIsOnline(true);
              console.log('🟢 Conectado a Servidor Real-Time');
          });

          socket.on('disconnect', () => {
              setSocketConnected(false);
              console.log('🔴 Desconectado del Socket');
          });

          socket.on('connect_error', () => {
              setSocketConnected(false);
          });

          socket.on('server:doctor_updated', (updatedDoc: Doctor) => {
              console.log("⚡ Recibida actualización de doctor:", updatedDoc.name);
              setDoctors(prev => {
                  const exists = prev.find(d => d.id === updatedDoc.id);
                  let newList;
                  if (exists) {
                      newList = prev.map(d => d.id === updatedDoc.id ? updatedDoc : d);
                  } else {
                      newList = [updatedDoc, ...prev];
                  }
                  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(newList));
                  return newList;
              });
          });

          socket.on('server:doctor_deleted', (id: string) => {
              setDoctors(prev => {
                  const newList = prev.filter(d => d.id !== id);
                  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(newList));
                  return newList;
              });
          });

          socket.on('server:procedure_updated', (updatedProc: Procedure) => {
              console.log("⚡ Recibida actualización de procedimiento");
              setProcedures(prev => {
                  const exists = prev.find(p => p.id === updatedProc.id);
                  let newList;
                  if (exists) {
                      newList = prev.map(p => p.id === updatedProc.id ? updatedProc : p);
                  } else {
                      newList = [...prev, updatedProc];
                  }
                  localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(newList));
                  return newList;
              });
          });

          socket.on('server:procedure_deleted', (id: string) => {
              setProcedures(prev => {
                  const newList = prev.filter(p => p.id !== id);
                  localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(newList));
                  return newList;
              });
          });

      } catch (e) {
          console.error("Socket init error", e);
      }

      return () => {
          if (socket) socket.disconnect();
      };
  }, [user]);

  useEffect(() => {
    try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) setUser(JSON.parse(savedUser));
        loadFromLocalStorage();
        fetchData();
    } catch (e) {
        console.error("Init error", e);
        setLoading(false);
    }
  }, [fetchData]);

  const saveDoctorToApi = async (doc: Doctor) => {
      if (!isOnline) return;
      fetch(`${API_URL}/doctors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc)
      }).catch(() => {});
  };

  const deleteDoctorFromApi = async (id: string) => {
      if (!isOnline) return;
      fetch(`${API_URL}/doctors/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const deleteVisitFromApi = async (doctorId: string, visitId: string) => {
      if (!isOnline) return;
      fetch(`${API_URL}/doctors/${doctorId}/visits/${visitId}`, { method: 'DELETE' }).catch(() => {});
  };

  const saveProcedureToApi = async (proc: Procedure) => {
      if (!isOnline) return;
      fetch(`${API_URL}/procedures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proc)
      }).catch(() => {});
  };

  const deleteProcedureFromApi = async (id: string) => {
      if (!isOnline) return;
      fetch(`${API_URL}/procedures/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const saveTimeOffToApi = async (event: TimeOffEvent) => {
      // TimeOff sync currently mostly local, add backend endpoint if needed
      localStorage.setItem(STORAGE_KEYS.TIMEOFF, JSON.stringify([...timeOffEvents, event]));
  };

  const deleteTimeOffFromApi = async (id: string) => {
      // Local sync
  };

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedInUser));
      fetchData();
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const updateDoctor = (updatedDoctor: Doctor) => {
    // Optimistic UI update
    setDoctors(prev => prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
    saveDoctorToApi(updatedDoctor);
  };

  const addDoctor = (newDoctor: Doctor) => {
      setDoctors(prev => [newDoctor, ...prev]);
      saveDoctorToApi(newDoctor);
  };

  const deleteDoctor = (id: string) => {
      setDoctors(prev => prev.filter(d => d.id !== id));
      deleteDoctorFromApi(id);
  };

  const handleDeleteVisit = (doctorId: string, visitId: string) => {
      setDoctors(prev => prev.map(doc => {
          if (doc.id === doctorId) {
              return { ...doc, visits: doc.visits.filter(v => v.id !== visitId) };
          }
          return doc;
      }));
      deleteVisitFromApi(doctorId, visitId);
  };

  const addProcedure = (newProc: Procedure) => {
      setProcedures(prev => [...prev, newProc]);
      saveProcedureToApi(newProc);
  };

  const updateProcedure = (updatedProc: Procedure) => {
      setProcedures(prev => prev.map(p => p.id === updatedProc.id ? updatedProc : p));
      saveProcedureToApi(updatedProc);
  };

  const deleteProcedure = (id: string) => {
      setProcedures(prev => prev.filter(p => p.id !== id));
      deleteProcedureFromApi(id);
  };

  const addTimeOff = (event: TimeOffEvent) => {
      setTimeOffEvents(prev => [...prev, event]);
      saveTimeOffToApi(event);
  };

  const deleteTimeOff = (id: string) => {
      setTimeOffEvents(prev => prev.filter(t => t.id !== id));
      deleteTimeOffFromApi(id);
  };

  const importFullBackup = (data: { doctors: Doctor[], procedures: Procedure[], timeOff?: TimeOffEvent[] }) => {
      if (data.doctors) {
          setDoctors(data.doctors);
          data.doctors.forEach(d => saveDoctorToApi(d));
      }
      if (data.procedures) {
          setProcedures(data.procedures);
          data.procedures.forEach(p => saveProcedureToApi(p));
      }
      if (data.timeOff) {
          setTimeOffEvents(data.timeOff);
      }
      alert("Respaldo restaurado.");
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold animate-pulse">Cargando Medicall CRM...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <div className="flex h-screen bg-[#f8fafc]">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 w-full bg-slate-900 text-white z-50 p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
                <span className="font-black text-cyan-400">RC</span>
                <span className="font-bold">MediCall</span>
            </div>
            <div className="flex items-center gap-3">
                {isSyncing && <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />}
                {socketConnected ? <Zap className="w-4 h-4 text-yellow-400 fill-current" /> : (isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />)}
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg">
                    <Menu className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>

        <Sidebar 
            user={user} 
            onLogout={handleLogout} 
            isMobileOpen={isMobileMenuOpen} 
            closeMobileMenu={() => setIsMobileMenuOpen(false)} 
            isCollapsed={isSidebarCollapsed} 
            toggleCollapse={toggleSidebar}
        />
        
        <div className={`flex-1 flex flex-col h-full relative pt-16 md:pt-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <main className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-8 relative z-10 w-full">
            <div className="max-w-7xl mx-auto min-w-[320px]">
                {/* Connection Status Indicator */}
                {!isOnline && (
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl mb-4 text-xs font-bold flex items-center border border-red-100 animate-fadeIn">
                        <WifiOff className="w-4 h-4 mr-2" />
                        Modo Offline: Sin conexión al servidor.
                    </div>
                )}
                {isOnline && !socketConnected && (
                    <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl mb-4 text-xs font-bold flex items-center border border-yellow-100 animate-fadeIn">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sincronizando tiempo real...
                    </div>
                )}

                <Routes>
                <Route path="/" element={<Dashboard doctors={doctors} user={user} procedures={procedures} onImportBackup={importFullBackup} />} />
                <Route path="/doctors" element={<DoctorList doctors={doctors} onAddDoctor={addDoctor} onDeleteDoctor={deleteDoctor} user={user} />} />
                <Route path="/doctors/:id" element={<DoctorProfile doctors={doctors} onUpdate={updateDoctor} onDeleteVisit={handleDeleteVisit} user={user} />} />
                <Route path="/calendar" element={
                    <ExecutiveCalendar 
                        doctors={doctors} 
                        onUpdateDoctors={updateDoctor} 
                        onDeleteVisit={handleDeleteVisit} 
                        user={user} 
                    />} 
                />
                <Route path="/procedures" element={<ProceduresManager procedures={procedures} doctors={doctors} onAddProcedure={addProcedure} onUpdateProcedure={updateProcedure} onDeleteProcedure={deleteProcedure} user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;