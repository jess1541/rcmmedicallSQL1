import React, { useState, useMemo, useEffect } from 'react';
import { Doctor, Procedure, User } from '../types';
import { ChevronLeft, ChevronRight, Plus, Check, Search, Activity, X, Trash2, DollarSign, User as UserIcon, Building2, Clock, CreditCard } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format } from 'date-fns';

registerLocale('es', es);

interface ProceduresManagerProps {
  procedures: Procedure[];
  doctors: Doctor[];
  onAddProcedure: (proc: Procedure) => void;
  onUpdateProcedure: (proc: Procedure) => void;
  onDeleteProcedure: (id: string) => void;
  user: User;
}

type ViewMode = 'month' | 'week' | 'day';

const ProceduresManager: React.FC<ProceduresManagerProps> = ({ procedures, doctors, onAddProcedure, onUpdateProcedure, onDeleteProcedure, user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<Partial<Procedure>>({
      date: new Date().toISOString().split('T')[0],
      time: '',
      hospital: '',
      doctorId: '',
      doctorName: '',
      procedureType: '',
      paymentType: 'DIRECTO',
      cost: 0,
      commission: 0,
      technician: '',
      notes: '',
      status: 'scheduled'
  });
  
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [displayCost, setDisplayCost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = useMemo(() => {
      if (!searchTerm) return [];
      return doctors.filter(d => {
          const matchesCategory = d.category === 'MEDICO' || !d.category;
          const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesProfile = user.role === 'admin' || d.executive === user.name;
          return matchesCategory && matchesSearch && matchesProfile;
      });
  }, [doctors, searchTerm, user]);

  useEffect(() => {
      if (formData.cost) {
          const comm = formData.cost * 0.03; 
          setFormData(prev => ({ ...prev, commission: comm }));
      } else {
          setFormData(prev => ({ ...prev, commission: 0 }));
      }
  }, [formData.cost]);

  useEffect(() => {
      if (formData.time) {
          const [hours, minutes] = formData.time.split(':').map(Number);
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          setSelectedTime(date);
      } else {
          setSelectedTime(null);
      }
  }, [isModalOpen, editingProcedure]);

  // --- HELPERS ---
  const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const parseCurrencyInput = (val: string) => {
      const cleanVal = val.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleanVal);
      return isNaN(num) ? 0 : num;
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numericValue = parseCurrencyInput(rawValue);
      setFormData(prev => ({...prev, cost: numericValue}));
      setDisplayCost(rawValue); 
  };

  const handleCostBlur = () => {
      if (formData.cost) {
          setDisplayCost(new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formData.cost));
      } else {
          setDisplayCost('');
      }
  };

  const getProcedureExecutive = (doctorId: string) => {
      const doc = doctors.find(d => d.id === doctorId);
      return doc ? doc.executive : 'Desconocido';
  }

  const getDaysForView = (): (Date | null)[] => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      if (viewMode === 'month') {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDayOfMonth = new Date(year, month, 1).getDay(); 
          const days: (Date | null)[] = [];
          for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
          for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
          return days;
      } else if (viewMode === 'week') {
          const startOfWeek = new Date(currentDate);
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          const days: Date[] = [];
          for (let i = 0; i < 7; i++) {
              const d = new Date(startOfWeek);
              d.setDate(startOfWeek.getDate() + i);
              days.push(d);
          }
          return days;
      } else { 
          return [new Date(currentDate)];
      }
  };

  const calendarDays = getDaysForView();

  const visibleProcedures = useMemo(() => {
      if (user.role === 'admin') {
          return procedures;
      }
      return procedures.filter(proc => {
          const doc = doctors.find(d => d.id === proc.doctorId);
          return doc && doc.executive === user.name;
      });
  }, [procedures, doctors, user]);

  const getProceduresForDay = (day: Date) => {
      const dateStr = day.toISOString().split('T')[0];
      return visibleProcedures.filter(p => p.date === dateStr);
  };

  const handleDragStart = (e: React.DragEvent, proc: Procedure) => {
      setIsDragging(true);
      e.dataTransfer.setData("text/plain", JSON.stringify(proc));
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
      e.preventDefault();
      setIsDragging(false);
      try {
          const data = e.dataTransfer.getData("text/plain");
          if (!data) return;
          const proc = JSON.parse(data) as Procedure;
          const newDateStr = targetDate.toISOString().split('T')[0];
          
          if (proc.date !== newDateStr) {
              onUpdateProcedure({ ...proc, date: newDateStr });
          }
      } catch (error) { console.error("Drop error:", error); }
  };

  const prevPeriod = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
  };

  const nextPeriod = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
  };

  const handleSave = () => {
      if (!formData.doctorId || !formData.procedureType) {
          alert("Seleccione un médico y el tipo de procedimiento.");
          return;
      }

      if (editingProcedure) {
          onUpdateProcedure({ ...editingProcedure, ...formData } as Procedure);
      } else {
          onAddProcedure({ 
              ...formData, 
              id: `proc-${Date.now()}`,
              status: 'scheduled' 
          } as Procedure);
      }
      closeModal();
  };

  const handleDelete = () => {
      if (editingProcedure && confirm("¿Está seguro de eliminar este procedimiento agendado permanentemente?")) {
          onDeleteProcedure(editingProcedure.id);
          closeModal();
      }
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingProcedure(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '',
        hospital: '',
        doctorId: '',
        doctorName: '',
        procedureType: '',
        paymentType: 'DIRECTO',
        cost: 0,
        commission: 0,
        technician: '',
        notes: '',
        status: 'scheduled'
      });
      setSelectedTime(null);
      setDisplayCost('');
      setSearchTerm('');
  };

  const openModal = (date?: Date, proc?: Procedure) => {
      if (proc) {
          setEditingProcedure(proc);
          setFormData(proc);
          setDisplayCost(proc.cost ? new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(proc.cost) : '');
          setSearchTerm(proc.doctorName);
      } else {
          if (date) {
              setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }));
          } else {
              setFormData(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] }));
          }
          setDisplayCost('');
      }
      setIsModalOpen(true);
  };

  const getHeaderTitle = () => {
      if (viewMode === 'day') return currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  const handleTimeChange = (date: Date | null) => {
      setSelectedTime(date);
      if (date) {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setFormData(prev => ({ ...prev, time: `${hours}:${minutes}` }));
      } else {
          setFormData(prev => ({ ...prev, time: '' }));
      }
  };

  return (
    <div className="space-y-6 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-lg gap-4">
            <div>
                <h1 className="text-2xl font-black text-slate-800">Procedimientos</h1>
                <p className="text-sm text-slate-500 font-medium">
                    {user.role === 'admin' ? 'Vista Global de Procedimientos' : 'Mis Procedimientos Asignados'}
                </p>
            </div>
            
            <div className="flex gap-3 items-center">
                <div className="bg-slate-100/50 p-1 rounded-xl flex shadow-inner border border-slate-200/50">
                   <button onClick={() => setViewMode('month')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mes</button>
                   <button onClick={() => setViewMode('week')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button>
                   <button onClick={() => setViewMode('day')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Día</button>
                </div>

                <button onClick={() => openModal()} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center">
                    <Plus className="w-5 h-5 mr-2" /> Agendar
                </button>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/30">
                <button onClick={prevPeriod} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-6 h-6 text-slate-600" /></button>
                <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight">
                    {getHeaderTitle()}
                </h2>
                <button onClick={nextPeriod} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-slate-600" /></button>
            </div>

            {viewMode !== 'day' && (
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                        <div key={d} className="py-3 text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">{d}</div>
                    ))}
                </div>
            )}

            <div className={`flex-1 ${viewMode === 'day' ? 'p-4' : 'grid grid-cols-7 auto-rows-fr'}`}>
                {calendarDays.map((day, idx) => {
                    if (viewMode !== 'day' && !day) return <div key={`empty-${idx}`} className="bg-slate-50/20 min-h-[120px] border-b border-r border-slate-100"></div>;
                    
                    if (!day) return null; 

                    const dayProcedures = getProceduresForDay(day);
                    const isToday = new Date().toDateString() === day.toDateString();

                    return (
                        <div key={idx} 
                             onDragOver={handleDragOver}
                             onDrop={(e) => handleDrop(e, day)}
                             onClick={() => openModal(day)}
                             className={`${viewMode === 'day' ? 'h-full border rounded-2xl bg-slate-50/30 p-4' : 'min-h-[120px] p-2 border-b border-r border-slate-100'} hover:bg-blue-50/20 transition-colors cursor-pointer relative group ${isToday && viewMode !== 'day' ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4 text-indigo-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                                {dayProcedures.map(proc => (
                                    <div 
                                        key={proc.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, proc)}
                                        onClick={(e) => { e.stopPropagation(); openModal(undefined, proc); }}
                                        className={`p-2 rounded-lg text-[10px] font-bold border shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02] flex flex-col gap-0.5 ${
                                            proc.status === 'scheduled' 
                                            ? 'bg-gradient-to-r from-red-50 to-white border-red-100 text-red-800' 
                                            : 'bg-gradient-to-r from-green-50 to-white border-green-100 text-green-800'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="truncate uppercase flex-1">{proc.doctorName}</span>
                                            {proc.time && <span className="text-[8px] bg-white/50 px-1 rounded ml-1">{proc.time}</span>}
                                        </div>
                                        {proc.hospital && <span className="text-[8px] opacity-70 truncate">{proc.hospital}</span>}
                                        {proc.cost && proc.cost > 0 && (
                                            <span className="text-[9px] font-black opacity-70">
                                                {formatCurrency(proc.cost)}
                                            </span>
                                        )}
                                        {user.role === 'admin' && (
                                            <div className="mt-1 border-t border-white/20 pt-0.5">
                                                <span className="text-[8px] opacity-80 uppercase">{getProcedureExecutive(proc.doctorId)}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {viewMode === 'day' && dayProcedures.length === 0 && (
                                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">
                                        No hay procedimientos para este día.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* MODAL - Updated Layout for Full Visibility */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn scale-100 transform transition-all flex flex-col max-h-[90vh]">
                    {/* Header - Fixed */}
                    <div className={`p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-gradient-to-r ${formData.status === 'scheduled' ? 'from-slate-50 to-white' : 'from-green-50 to-white'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${formData.status === 'scheduled' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">
                                    {editingProcedure ? 'Editar Procedimiento' : 'Agendar Procedimiento'}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {formData.status === 'scheduled' ? 'Programación' : 'Realizado'}
                                </p>
                            </div>
                        </div>
                        <button onClick={closeModal} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500"><X className="w-5 h-5" /></button>
                    </div>
                    
                    {/* Body - Scrollable */}
                    <div className="p-8 space-y-6 overflow-y-auto flex-1">
                        {editingProcedure && (
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Estado Actual:</span>
                                <button 
                                    onClick={() => setFormData(prev => ({...prev, status: prev.status === 'scheduled' ? 'performed' : 'scheduled'}))}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-sm ${
                                        formData.status === 'scheduled' 
                                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' 
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                                    }`}
                                >
                                    {formData.status === 'scheduled' ? 'PENDIENTE' : 'REALIZADO'}
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Fecha</label>
                                <input 
                                    type="date" 
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-slate-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Hora (AM/PM)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                                    <DatePicker
                                        selected={selectedTime}
                                        onChange={handleTimeChange}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption="Hora"
                                        dateFormat="h:mm aa"
                                        placeholderText="--:-- --"
                                        className="w-full pl-9 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-slate-900 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Ejecutivo que Agenda</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={user.name} 
                                    disabled
                                    className="w-full pl-9 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl p-3 text-sm font-bold outline-none cursor-not-allowed uppercase"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Hospital / Clínica</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={formData.hospital || ''}
                                    onChange={e => setFormData({...formData, hospital: e.target.value.toUpperCase()})}
                                    className="w-full pl-9 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder-slate-300 uppercase text-slate-900 bg-white"
                                    placeholder="NOMBRE DEL HOSPITAL..."
                                />
                            </div>
                        </div>

                        {/* Payment Type Selection */}
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Método de Pago</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select 
                                    value={formData.paymentType || 'DIRECTO'}
                                    onChange={e => setFormData({...formData, paymentType: e.target.value as any})}
                                    className="w-full pl-9 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none cursor-pointer uppercase text-slate-900 bg-white"
                                >
                                    <option value="DIRECTO">DIRECTO</option>
                                    <option value="ASEGURADORA">ASEGURADORA</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Costo (MXN)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={displayCost}
                                        onChange={handleCostChange}
                                        onBlur={handleCostBlur}
                                        className="w-full pl-9 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder-slate-300 text-slate-900 bg-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Comisión (3%)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                                    <input 
                                        type="text"
                                        readOnly
                                        value={formData.commission ? new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(formData.commission) : '0.00'}
                                        className="w-full pl-9 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-sm font-bold outline-none cursor-default"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Médico Responsable</label>
                            <div className="relative group">
                               <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                               <input 
                                   type="text" 
                                   placeholder="BUSCAR POR NOMBRE..." 
                                   value={searchTerm}
                                   onChange={e => { setSearchTerm(e.target.value.toUpperCase()); setFormData(prev => ({...prev, doctorId: ''})) }}
                                   className="w-full pl-10 border border-slate-200 rounded-xl p-3 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder-slate-300 text-slate-900 bg-white"
                               />
                            </div>
                            {searchTerm && !formData.doctorId && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-lg w-full z-20">
                                    {filteredDoctors.map(doc => (
                                        <div 
                                            key={doc.id} 
                                            onClick={() => { setFormData(prev => ({...prev, doctorId: doc.id, doctorName: doc.name})); setSearchTerm(doc.name); }}
                                            className="p-3 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer uppercase border-b last:border-0 border-slate-50 transition-colors"
                                        >
                                            {doc.name}
                                        </div>
                                    ))}
                                    {filteredDoctors.length === 0 && <div className="p-4 text-xs text-slate-400 text-center font-medium">No se encontraron resultados</div>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Tipo de Procedimiento</label>
                                <input 
                                    type="text" 
                                    value={formData.procedureType}
                                    onChange={e => setFormData({...formData, procedureType: e.target.value.toUpperCase()})}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder-slate-300 text-slate-900 bg-white"
                                    placeholder="EJ: ENDOSCOPIA"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Nombre del Técnico</label>
                                <input 
                                    type="text"
                                    value={formData.technician || ''}
                                    onChange={e => setFormData({...formData, technician: e.target.value.toUpperCase()})}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder-slate-300 uppercase text-slate-900 bg-white"
                                    placeholder="NOMBRE..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Notas Adicionales</label>
                            <textarea 
                                rows={3}
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value.toUpperCase()})}
                                className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium uppercase focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm placeholder-slate-300 text-slate-900 bg-white"
                                placeholder="DETALLES IMPORTANTES..."
                            />
                        </div>
                    </div>

                    {/* Footer - Fixed */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
                        {editingProcedure ? (
                            <button 
                                onClick={handleDelete} 
                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors"
                                title="Eliminar registro"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        ) : <div></div>}
                        
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 text-sm flex items-center">
                                <Check className="w-4 h-4 mr-2" />
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProceduresManager;