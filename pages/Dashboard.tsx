import React, { useMemo, useState, useRef } from 'react';
import { Doctor, User, Procedure, TimeOffEvent } from '../types';
import { Users, ShieldCheck, Download, Calendar, ArrowRight, CheckCircle2, TrendingUp, Filter, Award, Activity, DollarSign, Coins, X, MapPin, Target, Briefcase, PieChart, Database, Upload, AlertTriangle, Save, FileSpreadsheet } from 'lucide-react';

interface DashboardProps {
  doctors: Doctor[];
  user: User;
  procedures: Procedure[];
  onImportBackup?: (data: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ doctors, user, procedures, onImportBackup }) => {
  const [filterExecutive, setFilterExecutive] = useState<string | null>(user.role === 'executive' ? user.name : null);
  const [activeModal, setActiveModal] = useState<'planned' | 'completed' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executives = [
      { name: 'LUIS', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-700', text: 'text-blue-600', bgLight: 'bg-blue-50' },
      { name: 'ORALIA', color: 'bg-pink-500', gradient: 'from-pink-500 to-rose-600', text: 'text-pink-600', bgLight: 'bg-pink-50' },
      { name: 'ANGEL', color: 'bg-purple-500', gradient: 'from-purple-500 to-indigo-600', text: 'text-purple-600', bgLight: 'bg-purple-50' },
      { name: 'TALINA', color: 'bg-teal-500', gradient: 'from-emerald-500 to-teal-600', text: 'text-teal-600', bgLight: 'bg-teal-50' }
  ];

  const filteredDoctors = useMemo(() => {
      return filterExecutive ? doctors.filter(d => d.executive === filterExecutive) : doctors;
  }, [doctors, filterExecutive]);

  const stats = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let plannedVisits = 0;
    let completedVisits = 0;
    const classifications = { A: 0, B: 0, C: 0, None: 0 };

    filteredDoctors.forEach(doc => {
        doc.visits.forEach(v => {
            const vDate = new Date(v.date + 'T00:00:00');
            if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
                if (v.status === 'completed') completedVisits++;
                if (v.status === 'planned' && v.outcome !== 'CITA') plannedVisits++;
            }
        });
        if (doc.classification === 'A') classifications.A++;
        else if (doc.classification === 'B') classifications.B++;
        else if (doc.classification === 'C') classifications.C++;
        else classifications.None++;
    });

    const teamBreakdown = executives.map(exec => {
        const execDocs = doctors.filter(d => d.executive === exec.name);
        let execPlanned = 0;
        let execCompleted = 0;
        execDocs.forEach(d => {
            d.visits.forEach(v => {
                const vDate = new Date(v.date + 'T00:00:00');
                if (vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear) {
                    if (v.status === 'completed') execCompleted++;
                    if (v.status === 'planned' && v.outcome !== 'CITA') execPlanned++;
                }
            });
        });

        const execProcs = procedures.filter(p => {
            const pDate = new Date(p.date + 'T00:00:00');
            return p.status === 'performed' && 
                   pDate.getMonth() === currentMonth && 
                   pDate.getFullYear() === currentYear &&
                   execDocs.some(d => d.id === p.doctorId);
        });

        return {
            ...exec,
            doctors: execDocs.length,
            planned: execPlanned,
            completed: execCompleted,
            revenue: execProcs.reduce((acc, curr) => acc + (curr.cost || 0), 0),
            commission: execProcs.reduce((acc, curr) => acc + (curr.commission || 0), 0),
            performance: (execPlanned + execCompleted) > 0 ? Math.round((execCompleted / (execPlanned + execCompleted)) * 100) : 0
        };
    });

    const relevantProcedures = procedures.filter(p => {
        const pDate = new Date(p.date + 'T00:00:00');
        const belongs = filterExecutive ? filteredDoctors.some(d => d.id === p.doctorId) : true;
        return p.status === 'performed' && pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear && belongs;
    });

    return { 
        totalDoctors: filteredDoctors.length, 
        completedVisits, 
        totalRevenue: relevantProcedures.reduce((a, c) => a + (c.cost || 0), 0),
        totalCommission: relevantProcedures.reduce((a, c) => a + (c.commission || 0), 0),
        performance: (plannedVisits + completedVisits) > 0 ? Math.round((completedVisits / (plannedVisits + completedVisits)) * 100) : 0,
        classifications, 
        teamBreakdown 
    };
  }, [filteredDoctors, doctors, procedures, filterExecutive]);

  // --- EXPORT LOGIC ---
  const downloadCSV = (content: string, fileName: string) => {
      // Add BOM for Excel UTF-8 compatibility
      const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportVisits = () => {
      const headers = ['FECHA', 'HORA', 'EJECUTIVO', 'MÉDICO/HOSPITAL', 'ESPECIALIDAD', 'OBJETIVO', 'RESULTADO', 'NOTA', 'SEGUIMIENTO', 'ESTADO'];
      
      const rows = doctors.flatMap(doc => {
          return doc.visits.map(v => {
              // Filtrar por ejecutivo si está activo el filtro
              if (filterExecutive && doc.executive !== filterExecutive) return null;
              
              return [
                  v.date,
                  v.time || '',
                  doc.executive,
                  `"${doc.name}"`, // Quote to handle commas in names
                  doc.specialty || doc.category,
                  `"${v.objective || ''}"`,
                  v.outcome,
                  `"${v.note || ''}"`,
                  `"${v.followUp || ''}"`,
                  v.status === 'completed' ? 'REALIZADA' : 'PLANEADA'
              ].join(',');
          }).filter(Boolean);
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      downloadCSV(csvContent, `REPORTE_VISITAS_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportProcedures = () => {
      const headers = ['FECHA', 'HORA', 'HOSPITAL', 'MÉDICO', 'EJECUTIVO', 'PROCEDIMIENTO', 'TÉCNICO', 'PAGO', 'COSTO', 'COMISIÓN', 'ESTADO', 'NOTAS'];
      
      const rows = procedures.map(proc => {
          const doc = doctors.find(d => d.id === proc.doctorId);
          const executive = doc ? doc.executive : 'DESCONOCIDO';
          
          if (filterExecutive && executive !== filterExecutive) return null;

          return [
              proc.date,
              proc.time || '',
              `"${proc.hospital || ''}"`,
              `"${proc.doctorName}"`,
              executive,
              `"${proc.procedureType}"`,
              `"${proc.technician || ''}"`,
              proc.paymentType,
              proc.cost || 0,
              proc.commission || 0,
              proc.status === 'performed' ? 'REALIZADO' : 'PROGRAMADO',
              `"${proc.notes || ''}"`
          ].join(',');
      }).filter(Boolean);

      const csvContent = [headers.join(','), ...rows].join('\n');
      downloadCSV(csvContent, `REPORTE_PROCEDIMIENTOS_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportTimeOff = () => {
      const storedTimeOff = localStorage.getItem('rc_medicall_timeoff_v5');
      const timeOffData: TimeOffEvent[] = storedTimeOff ? JSON.parse(storedTimeOff) : [];
      
      const headers = ['EJECUTIVO', 'INICIO', 'FIN', 'DURACIÓN', 'MOTIVO', 'NOTAS'];
      const rows = timeOffData.map(t => {
          if (filterExecutive && t.executive !== filterExecutive) return null;
          return [
              t.executive,
              t.startDate,
              t.endDate,
              t.duration,
              t.reason,
              `"${t.notes || ''}"`
          ].join(',');
      }).filter(Boolean);

      const csvContent = [headers.join(','), ...rows].join('\n');
      downloadCSV(csvContent, `REPORTE_AUSENCIAS_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // --- BACKUP LOGIC ---
  const handleExportBackup = () => {
      const backup = {
          doctors,
          procedures,
          timeOff: JSON.parse(localStorage.getItem('rc_medicall_timeoff_v5') || '[]'),
          exportedAt: new Date().toISOString(),
          version: '5.0'
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RESPALDO_CRM_RC_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.doctors && Array.isArray(data.doctors)) {
                  if (window.confirm("¿Seguro que deseas restaurar este respaldo? Se sobreescribirá la información actual.")) {
                      onImportBackup?.(data);
                  }
              } else {
                  alert("Formato de archivo no válido.");
              }
          } catch (error) {
              alert("Error al procesar el archivo JSON.");
          }
      };
      reader.readAsText(file);
  };

  const currentMonthName = new Date().toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/50 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">
                Hola, <span className="text-blue-600">{user.name}</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {user.role === 'admin' ? 'PANEL DE CONTROL PROTEGIDO' : 'MI PANEL DE RESULTADOS'}
            </p>
          </div>
          
          <div className="flex gap-3">
              {user.role === 'admin' && filterExecutive && (
                  <button onClick={() => setFilterExecutive(null)} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black text-xs uppercase tracking-widest transition shadow-lg">
                      <Filter className="w-4 h-4 inline mr-2" /> Vista Global
                  </button>
              )}
              {user.role === 'admin' && (
                  <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl flex items-center text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                      <Save className="w-3 h-3 mr-2" /> Datos Protegidos
                  </div>
              )}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directorio</p>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-slate-800">{stats.totalDoctors}</p>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Médicos Activos</p>
        </div>
        
        <div onClick={() => setActiveModal('completed')} className="cursor-pointer bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Visitas {currentMonthName}</p>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-4xl font-black">{stats.completedVisits}</p>
          <div className="w-full bg-white/20 h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${stats.performance}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventas Mes</p>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Realizadas</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisiones</p>
            <Coins className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">${stats.totalCommission.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Acumulado Equipo</p>
        </div>
      </div>

      {/* REPORTING & BACKUP CENTER */}
      {user.role === 'admin' && (
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              
              <div className="relative z-10 space-y-8">
                  {/* Title Section */}
                  <div className="flex items-center gap-5">
                      <div className="p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 text-blue-400">
                          <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white">Centro de Reportes y Datos</h3>
                          <p className="text-sm text-blue-200 font-medium">Exportación de datos para análisis en Excel y copias de seguridad.</p>
                      </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Excel Exports */}
                      <button 
                        onClick={exportVisits}
                        className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-emerald-600 hover:border-emerald-500 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 transition-all active:scale-95"
                      >
                          <FileSpreadsheet className="w-4 h-4 mr-2" /> Reporte Visitas
                      </button>
                      <button 
                        onClick={exportProcedures}
                        className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-emerald-600 hover:border-emerald-500 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 transition-all active:scale-95"
                      >
                          <FileSpreadsheet className="w-4 h-4 mr-2" /> Reporte Proc.
                      </button>
                      <button 
                        onClick={exportTimeOff}
                        className="flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-orange-500 hover:border-orange-400 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 transition-all active:scale-95"
                      >
                          <FileSpreadsheet className="w-4 h-4 mr-2" /> Reporte Ausencias
                      </button>

                      {/* System Backups */}
                      <button 
                        onClick={handleExportBackup}
                        className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/20 backdrop-blur-md text-slate-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                      >
                          <Download className="w-4 h-4 mr-2" /> Respaldo Completo
                      </button>
                      
                      <div className="relative">
                        <button 
                            onClick={handleImportClick}
                            className="w-full h-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                        >
                            <Upload className="w-4 h-4 mr-2" /> Restaurar
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileImport} 
                            accept=".json" 
                            className="hidden" 
                        />
                      </div>
                  </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-blue-300/60 border-t border-white/10 pt-4">
                  <AlertTriangle className="w-3 h-3" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Nota: Los reportes se generan en formato .CSV compatibles con Excel.</p>
              </div>
          </div>
      )}

      {/* ADMIN CONTROL TABLE (Rest of Dashboard) */}
      {user.role === 'admin' && !filterExecutive && (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Target className="w-6 h-6" /></div>
                  <div>
                      <h3 className="text-xl font-black text-slate-800">Auditoría de Ejecutivos</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control de desempeño mensual</p>
                  </div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <tr>
                              <th className="px-8 py-4">Ejecutivo</th>
                              <th className="px-6 py-4">Médicos</th>
                              <th className="px-6 py-4">Planeadas</th>
                              <th className="px-6 py-4">Realizadas</th>
                              <th className="px-6 py-4">Efectividad</th>
                              <th className="px-6 py-4">Venta</th>
                              <th className="px-8 py-4 text-right">Detalle</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {stats.teamBreakdown.map(exec => (
                              <tr key={exec.name} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${exec.gradient} flex items-center justify-center text-white font-black text-[10px]`}>{exec.name.substring(0,2)}</div>
                                          <span className="font-bold text-slate-800">{exec.name}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-5 font-medium text-slate-600">{exec.doctors}</td>
                                  <td className="px-6 py-5 font-bold text-indigo-600">{exec.planned}</td>
                                  <td className="px-6 py-5 font-bold text-emerald-600">{exec.completed}</td>
                                  <td className="px-6 py-5">
                                      <div className="flex items-center gap-2">
                                          <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                                              <div className="bg-indigo-500 h-full" style={{ width: `${exec.performance}%` }}></div>
                                          </div>
                                          <span className="text-[10px] font-black text-slate-500">{exec.performance}%</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-5 font-black text-slate-800">${exec.revenue.toLocaleString()}</td>
                                  <td className="px-8 py-5 text-right">
                                      <button onClick={() => setFilterExecutive(exec.name)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                          <ArrowRight className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* FEED DE ACTIVIDAD GLOBAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[600px]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800">Actividad del Equipo</h3>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">Historial Reciente</span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-0">
                  <div className="divide-y divide-slate-50">
                    {filteredDoctors
                        .flatMap(d => d.visits.map(v => ({...v, doctorName: d.name, executive: d.executive})))
                        .filter(v => v.status === 'completed')
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 30)
                        .map((visit, idx) => (
                            <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase line-clamp-1">{visit.doctorName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-blue-500 uppercase">Ejecutivo: {visit.executive}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{visit.date}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${visit.outcome === 'INTERESADO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{visit.outcome}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 italic border border-slate-100 uppercase">"{visit.note}"</div>
                            </div>
                        ))}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-purple-500" /> Clasificación</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <span className="text-xs font-black text-emerald-700 uppercase">VIP (A)</span>
                          <span className="text-2xl font-black text-emerald-800">{stats.classifications.A}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <span className="text-xs font-black text-blue-700 uppercase">REGULAR (B)</span>
                          <span className="text-2xl font-black text-blue-800">{stats.classifications.B}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-xs font-black text-slate-500 uppercase">BÁSICO (C)</span>
                          <span className="text-2xl font-black text-slate-800">{stats.classifications.C}</span>
                      </div>
                  </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative">
                  <PieChart className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-cyan-400" /> Equipo</h3>
                  <div className="space-y-3">
                      {executives.map(e => (
                          <div key={e.name} className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-300">{e.name}</span>
                              <span className="text-xs font-black">{doctors.filter(d => d.executive === e.name).length} Leads</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;