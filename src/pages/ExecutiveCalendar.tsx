import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Doctor, Visit, User, TimeOffEvent } from '../types';
import { ChevronLeft, ChevronRight, Plus, Check, Search, Edit3, Calendar, ExternalLink, X, Lock, Clock, MapPin, Coffee, CalendarClock, CheckCircle2, User as UserIcon, Trash2, Building, Briefcase } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);

interface ExecutiveCalendarProps {
  doctors: Doctor[];
  onUpdateDoctors: (doctors: Doctor[]) => void;
  onDeleteVisit: (doctorId: string, visitId: string) => void;
  user: User;
}

type ViewMode = 'month' | 'week' | 'day';

const ExecutiveCalendar: React.FC<ExecutiveCalendarProps> = ({ doctors, onUpdateDoctors, onDeleteVisit, user }) => {
  const location = useLocation();
  const [selectedExecutive, setSelectedExecutive] = useState(user.role === 'executive' ? user.name : '');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isDragging, setIsDragging] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointmentMode, setIsAppointmentMode] = useState(false); 
  const [selectedDayForPlan, setSelectedDayForPlan] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [searchDoctorTerm, setSearchDoctorTerm] = useState('');
  const [planObjective, setPlanObjective] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisitToReport, setSelectedVisitToReport] = useState<{docId: string, visit: Visit} | null>(null);
  const [reportNote, setReportNote] = useState('');
  const [reportOutcome, setReportOutcome] = useState('SEGUIMIENTO');
  const [reportFollowUp, setReportFollowUp] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportTime, setReportTime] = useState(''); // Time for the current report/edit
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editObjective, setEditObjective] = useState('');
  
  // Next Visit Planning State
  const [nextVisitDate, setNextVisitDate] = useState<Date | null>(null);
  const [nextVisitTime, setNextVisitTime] = useState('09:00'); // New State for Next Visit Time

  const [timeOffEvents, setTimeOffEvents] = useState<TimeOffEvent[]>([]);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState<Partial<TimeOffEvent>>({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      duration: 'TODO EL DÍA',
      reason: 'JUNTA',
      notes: ''
  });
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOffEvent | null>(null);

  // Updated Time Slots: 09:00 - 20:00 every 30 mins
  const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 9; hour <= 20; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          if (hour !== 20) {
              slots.push(`${hour.toString().padStart(2, '0')}:30`);
          }
      }
      return slots;
  };
  const visitTimeSlots = useMemo(() => generateTimeSlots(), []);
  const appointmentTimeSlots = ['09:00', '16:00'];

  const executives = useMemo(() => {
    const execs = new Set(doctors.map(d => d.executive));
    return Array.from(execs).sort();
  }, [doctors]);

  useEffect(() => {
      if (user.role === 'executive') {
          setSelectedExecutive(user.name);
      } else {
          const params = new URLSearchParams(location.search);
          const execParam = params.get('exec');
          if (execParam) setSelectedExecutive(execParam);
          else if (!selectedExecutive && executives.length > 0) setSelectedExecutive(executives[0]);
      }
  }, [location, executives, selectedExecutive, user]);

  useEffect(() => {
      const storedTimeOff = localStorage.getItem('rc_medicall_timeoff');
      if (storedTimeOff) {
          setTimeOffEvents(JSON.parse(storedTimeOff));
      }
  }, []);

  const myDoctors = useMemo(() => {
      return doctors.filter(d => d.executive === selectedExecutive);
  }, [doctors, selectedExecutive]);

  const myTimeOffs = useMemo(() => {
      return timeOffEvents.filter(t => t.executive === selectedExecutive);
  }, [timeOffEvents, selectedExecutive]);

  const filteredDoctorsForModal = useMemo(() => {
      if (!searchDoctorTerm) return [];
      return myDoctors.filter(d => d.name.toLowerCase().includes(searchDoctorTerm.toLowerCase()));
  }, [myDoctors, searchDoctorTerm]);

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

  const toLocalDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const isDateInRange = (checkDate: string, start: string, end: string) => {
      return checkDate >= start && checkDate <= end;
  };

  const parseDateString = (dateStr: string) => {
      if (!dateStr) return new Date();
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
  };

  const formatDateToString = (date: Date | null) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date: Date) => {
      const dateStr = toLocalDateString(date);
      const events: { type: 'visit' | 'timeoff', data: any }[] = [];
      
      myDoctors.forEach(doc => {
          const visits = doc.visits || [];
          visits.forEach(visit => {
              if (visit.date === dateStr) {
                  events.push({ type: 'visit', data: { docId: doc.id, docName: doc.name, docCategory: doc.category, visit, address: doc.address } });
              }
          });
      });

      myTimeOffs.forEach(toff => {
          if (isDateInRange(dateStr, toff.startDate, toff.endDate)) {
              events.push({ type: 'timeoff', data: toff });
          }
      });

      return events.sort((a, b) => {
          // Sort logic strictly by time
          if (a.type === 'timeoff' && b.type !== 'timeoff') return -1;
          if (a.type !== 'timeoff' && b.type === 'timeoff') return 1;

          if (a.type === 'visit' && b.type === 'visit') {
              const timeA = a.data.visit.time || '23:59';
              const timeB = b.data.visit.time || '23:59';
              
              if (timeA !== timeB) {
                  return timeA.localeCompare(timeB);
              }
              
              // Secondary sort: Status
              if (a.data.visit.status === 'completed' && b.data.visit.status !== 'completed') return 1;
              if (a.data.visit.status !== 'completed' && b.data.visit.status === 'completed') return -1;
          }
          return 0;
      });
  };

  const handleDayClick = (date: Date, asAppointment = false) => {
      setSelectedDayForPlan(date.getDate());
      setCurrentDate(new Date(date)); 
      setIsAppointmentMode(asAppointment);
      setIsModalOpen(true); 
      setSelectedDoctorId('');
      setSearchDoctorTerm('');
      
      if (asAppointment) {
          setPlanObjective('CITA DE CONTACTO');
      } else {
          setPlanObjective('');
          setAppointmentTime('09:00');
      }
  };

  const handleTimeSlotClick = (time: string) => {
      setAppointmentTime(time);
      handleDayClick(currentDate, false); // Always standard visit from generic slot click
  };

  const savePlan = () => {
      if (!selectedDayForPlan || !selectedDoctorId) {
          alert("Seleccione un contacto.");
          return;
      }
      if (!planObjective.trim()) {
          alert("El objetivo es obligatorio.");
          return;
      }
      
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDayForPlan).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const updatedDoctors = doctors.map(doc => {
          if (doc.id === selectedDoctorId) {
              const newVisit: Visit = {
                  id: Date.now().toString(),
                  date: dateStr,
                  time: appointmentTime,
                  note: isAppointmentMode ? 'CITA PROGRAMADA' : 'Visita Planeada',
                  objective: planObjective.toUpperCase(),
                  outcome: isAppointmentMode ? 'CITA' : 'PLANEADA',
                  status: 'planned'
              };
              const currentVisits = doc.visits || [];
              return { ...doc, visits: [...currentVisits, newVisit] };
          }
          return doc;
      });

      onUpdateDoctors(updatedDoctors);
      setIsModalOpen(false);
      alert(isAppointmentMode ? "Cita programada correctamente." : "Visita agendada correctamente.");
  };

  const openReportModal = (docId: string, visit: Visit) => {
      // Logic for Appointments: Just return, or show simple alert, do NOT open report management
      if ((visit.outcome as string) === 'CITA') {
          return; 
      }

      setSelectedVisitToReport({ docId, visit });
      setReportNote(visit.note === 'Visita Planeada' || visit.note === 'CITA PROGRAMADA' ? '' : visit.note);
      
      const outcome = visit.outcome as string;
      setReportOutcome(outcome === 'PLANEADA' || outcome === 'CITA' ? 'SEGUIMIENTO' : outcome);
      
      setReportFollowUp(visit.followUp || '');
      setReportDate(visit.date);
      setReportTime(visit.time || '');
      setIsEditingPlan(false);
      setEditObjective(visit.objective || '');
      setNextVisitDate(null);
      setNextVisitTime('09:00'); // Reset next visit time default
      setReportModalOpen(true);
  };

  const confirmDeleteVisit = () => {
      if (!selectedVisitToReport) return;
      const { docId, visit } = selectedVisitToReport;
      if (window.confirm("¿Eliminar este registro permanentemente del calendario y sistema?")) {
          onDeleteVisit(docId, visit.id);
          setReportModalOpen(false);
          setSelectedVisitToReport(null);
      }
  }

  const savePlanChanges = () => {
      if (!selectedVisitToReport) return;
      if (!editObjective.trim()) {
          alert("El objetivo es obligatorio.");
          return;
      }

      const updatedDoctors = doctors.map(doc => {
          if (doc.id === selectedVisitToReport.docId) {
              const updatedVisits = (doc.visits || []).map(v => {
                  if (v.id === selectedVisitToReport.visit.id) {
                      return { ...v, date: reportDate, time: reportTime, objective: editObjective.toUpperCase() };
                  }
                  return v;
              });
              return { ...doc, visits: updatedVisits };
          }
          return doc;
      });
      onUpdateDoctors(updatedDoctors);
      setReportModalOpen(false);
  }

  const saveReport = () => {
      if (!selectedVisitToReport) return;
      if (!reportNote.trim() || !reportFollowUp.trim()) {
          alert("Reporte y Siguiente Paso son obligatorios.");
          return;
      }
      
      const updatedDoctors = doctors.map(doc => {
          if (doc.id === selectedVisitToReport.docId) {
              let updatedVisits = (doc.visits || []).map(v => {
                  if (v.id === selectedVisitToReport.visit.id) {
                      return {
                          ...v,
                          date: reportDate,
                          time: reportTime, // Update time
                          note: reportNote.toUpperCase(),
                          outcome: reportOutcome as any,
                          followUp: reportFollowUp.toUpperCase(),
                          status: 'completed' as const
                      };
                  }
                  return v;
              });

              // --- Create Next Visit if Planned ---
              if (nextVisitDate) {
                  const newVisit: Visit = {
                      id: `nv-${Date.now()}`,
                      date: formatDateToString(nextVisitDate),
                      time: nextVisitTime, // Use selected time
                      note: 'Visita Planeada',
                      objective: reportFollowUp.toUpperCase(), // Use follow up as new objective
                      outcome: 'PLANEADA',
                      status: 'planned'
                  };
                  updatedVisits = [...updatedVisits, newVisit];
              }

              return { ...doc, visits: updatedVisits };
          }
          return doc;
      });

      onUpdateDoctors(updatedDoctors);
      setReportModalOpen(false);
      if (nextVisitDate) alert("Reporte guardado y próxima visita agendada.");
  };

  // Drag Handling
  const handleDragStart = (e: React.DragEvent, docId: string, visit: Visit) => {
      // Allow dragging everything (including completed visits and CITA) to the trash or reschedule
      setIsDragging(true);
      const data = JSON.stringify({ docId, visitId: visit.id });
      e.dataTransfer.setData("text/plain", data);
      e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragEnd = () => setIsDragging(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  
  // Handle Drop on Day (Month/Week View) or Time Slot (Day View)
  const handleDrop = (e: React.DragEvent, targetDate: Date, targetTime?: string) => {
      e.preventDefault();
      setIsDragging(false);
      try {
          const data = e.dataTransfer.getData("text/plain");
          if (!data) return;
          const { docId, visitId } = JSON.parse(data);
          
          const newDateStr = toLocalDateString(targetDate);
          
          const updatedDoctors = doctors.map(doc => {
              if (doc.id === docId) {
                  const updatedVisits = (doc.visits || []).map(v => {
                      if (v.id === visitId) {
                          // Update date and time if provided (from slot drop), otherwise keep existing time
                          return { 
                              ...v, 
                              date: newDateStr,
                              time: targetTime || v.time
                          };
                      }
                      return v;
                  });
                  return { ...doc, visits: updatedVisits };
              }
              return doc;
          });
          onUpdateDoctors(updatedDoctors);
      } catch (error) { console.error("Drop error:", error); }
  };

  // Función elimina_elemento (handleTrashDrop)
  const handleTrashDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const data = e.dataTransfer.getData("text/plain");
      if (!data) return;
      
      try {
          const parsed = JSON.parse(data);
          const { docId, visitId } = parsed;
          
          if (docId && visitId) {
              if (window.confirm("¿Confirmas que deseas eliminar este elemento permanentemente del sistema?")) {
                  onDeleteVisit(docId, visitId);
              }
          }
      } catch (error) {
          console.error("Error al eliminar elemento:", error);
      }
  };

  // ... TimeOff logic ...
  const handleOpenTimeOffModal = () => {
      setNewTimeOff({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          duration: 'TODO EL DÍA',
          reason: 'JUNTA',
          notes: ''
      });
      setIsTimeOffModalOpen(true);
  };

  const handleSaveTimeOff = () => {
      const event: TimeOffEvent = {
          id: `toff-${Date.now()}`,
          executive: selectedExecutive,
          startDate: newTimeOff.startDate || new Date().toISOString().split('T')[0],
          endDate: newTimeOff.endDate || new Date().toISOString().split('T')[0],
          duration: newTimeOff.duration as any || 'TODO EL DÍA',
          reason: newTimeOff.reason as any || 'JUNTA',
          notes: newTimeOff.notes || ''
      };

      const updated = [...timeOffEvents, event];
      setTimeOffEvents(updated);
      localStorage.setItem('rc_medicall_timeoff', JSON.stringify(updated));
      setIsTimeOffModalOpen(false);
  };

  const handleDeleteTimeOff = (id: string) => {
      if (window.confirm("¿Eliminar este registro?")) {
          const updated = timeOffEvents.filter(t => t.id !== id);
          setTimeOffEvents(updated);
          localStorage.setItem('rc_medicall_timeoff', JSON.stringify(updated));
          setSelectedTimeOff(null);
      }
  };

  const getHeaderTitle = () => {
      if (viewMode === 'day') return currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  const isCompleted = selectedVisitToReport?.visit.status === 'completed';

  const isCita = (visit: Visit) => (visit.outcome as string) === 'CITA';

  // Helper for rendering event chips
  const renderEventChip = (evt: any, i: number, isSlot: boolean = false) => {
      const isTimeOff = evt.type === 'timeoff';
      const isCompleted = !isTimeOff && evt.data.visit.status === 'completed';
      const isAppointment = !isTimeOff && isCita(evt.data.visit);
      
      const chipClasses = isSlot 
        ? `absolute left-0 right-0 mx-2 p-2 rounded shadow-sm cursor-pointer transition-colors z-10 border-l-4 ${
            isAppointment 
            ? 'bg-pink-100 border-pink-500 hover:bg-pink-200 cursor-default' // Cita Pink
            : (isCompleted 
                ? 'bg-green-100 border-green-500 hover:bg-green-200' // Completed Green
                : 'bg-blue-100 border-blue-500 hover:bg-blue-200') // Planned Blue
          }`
        : `px-2 py-1 rounded text-[8px] font-bold border shadow-sm flex items-center gap-1 transition-all hover:scale-[1.02] relative pr-1 cursor-grab active:cursor-grabbing w-full mb-1 ${
            isTimeOff 
            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-800'
            : (isAppointment 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-pink-300' // Cita Pink
                : (isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-emerald-300' // Completed Green
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-blue-200')) // Planned Blue
        }`;

      return (
        <div 
            key={i}
            draggable
            onDragStart={(e) => handleDragStart(e, evt.data.docId, evt.data.visit)}
            onDragEnd={handleDragEnd}
            onClick={(e) => { e.stopPropagation(); isTimeOff ? setSelectedTimeOff(evt.data) : openReportModal(evt.data.docId, evt.data.visit); }}
            className={chipClasses}
        >
            {isSlot ? (
                <>
                    <span className={`text-xs font-bold block ${
                        isAppointment ? 'text-pink-900' : (isCompleted ? 'text-green-900' : 'text-blue-900')
                    }`}>{evt.data.docName} ({evt.data.docCategory || 'MEDICO'})</span>
                    <span className={`text-[10px] uppercase ${
                        isAppointment ? 'text-pink-700' : (isCompleted ? 'text-green-700' : 'text-blue-700')
                    }`}>{evt.data.visit.objective}</span>
                </>
            ) : (
                <>
                    <span className="truncate leading-tight flex-1">
                        {!isTimeOff && <span className="font-black mr-1 opacity-90">{evt.data.visit.time || '??:??'}</span>}
                        {isTimeOff ? evt.data.reason : evt.data.docName}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-white flex-shrink-0" />}
                    {isAppointment && <Lock className="w-2 h-2 text-white/80 ml-1" />}
                </>
            )}
        </div>
      );
  };

  return (
    <div className="space-y-6 pb-10 relative">

       {/* TOOLBAR */}
       <div className="flex flex-col xl:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-lg shadow-blue-500/5 gap-4">
           {/* ... (Toolbar code same as before) ... */}
           <div className="text-center xl:text-left">
               <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Calendario</h1>
               <p className="text-xs md:text-sm text-slate-500 font-medium">Gestión de rutas y tiempos.</p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-3 items-center w-full xl:w-auto">
               <button 
                   onClick={() => handleDayClick(currentDate, true)}
                   className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-pink-500/30 transition-all active:scale-95 flex items-center w-full md:w-auto justify-center"
               >
                   <Clock className="w-4 h-4 mr-2" />
                   Programar Cita
               </button>

               <button 
                   onClick={handleOpenTimeOffModal}
                   className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center w-full md:w-auto justify-center"
               >
                   <Coffee className="w-4 h-4 mr-2" />
                   Ausencia
               </button>

               <div className="bg-slate-100/50 p-1 rounded-xl flex shadow-inner w-full md:w-auto border border-slate-200/50">
                   <button onClick={() => setViewMode('month')} className={`flex-1 md:flex-none px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mes</button>
                   <button onClick={() => setViewMode('week')} className={`flex-1 md:flex-none px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button>
                   <button onClick={() => setViewMode('day')} className={`flex-1 md:flex-none px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Día</button>
               </div>

               <div 
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={handleTrashDrop}
                    className={`w-full md:w-16 h-10 md:h-auto rounded-xl flex items-center justify-center transition-all border-2 border-dashed cursor-pointer ${isDragging ? 'bg-red-50 border-red-400 text-red-500 scale-110 shadow-lg shadow-red-200' : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-red-300 hover:text-red-300'}`}
                    title="Arrastra aquí para eliminar (elimina_elemento)"
               >
                   <Trash2 className="h-5 w-5 pointer-events-none" />
               </div>

               {user.role === 'admin' && (
                   <div className="flex items-center bg-blue-50/50 p-1.5 pl-3 rounded-xl border border-blue-100/50 w-full md:w-auto">
                       <span className="text-[10px] font-black text-blue-600 mr-2 uppercase tracking-wide">Vista:</span>
                       <select className="bg-transparent border-0 text-blue-900 text-sm font-bold focus:ring-0 block p-1 cursor-pointer w-full" value={selectedExecutive} onChange={(e) => setSelectedExecutive(e.target.value)}>
                           {executives.map(e => <option key={e} value={e}>{e}</option>)}
                       </select>
                   </div>
               )}
           </div>
       </div>

       {/* CALENDAR VIEW */}
       <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[600px]">
           {/* ... Header Navigation ... */}
           <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 sticky top-0 z-20 bg-white/95 backdrop-blur">
               <button onClick={prevPeriod} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ChevronLeft className="h-5 w-5" /></button>
               <h2 className="text-lg md:text-xl font-black text-slate-800 capitalize tracking-tight text-center">{getHeaderTitle()}</h2>
               <button onClick={nextPeriod} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><ChevronRight className="h-5 w-5" /></button>
           </div>

           <div className="flex-1 overflow-auto bg-slate-50/30">
               <div className={`h-full flex flex-col ${viewMode !== 'day' ? 'min-w-[800px]' : 'min-w-full'}`}>
                   {/* Headers for Month/Week */}
                   {viewMode !== 'day' && (
                       <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                           {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                               <div key={d} className="py-2 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{d}</div>
                           ))}
                       </div>
                   )}

                   <div className={`flex-1 ${viewMode === 'day' ? 'flex flex-col' : 'grid grid-cols-7 auto-rows-fr gap-px'}`}>
                       {calendarDays.map((day, idx) => {
                           if (viewMode !== 'day' && day === null) return <div key={`empty-${idx}`} className="bg-slate-50/20 min-h-[100px]"></div>;
                           
                           const events = day ? getEventsForDate(day) : [];
                           const isToday = day ? new Date().toDateString() === day.toDateString() : false;

                           if (viewMode === 'day' && day) {
                               return (
                                   <div key={idx} className="flex-1 bg-white p-4 md:p-8 animate-fadeIn flex">
                                       {/* Time Column */}
                                       <div className="w-24 flex-shrink-0 border-r border-slate-100 pr-4 pt-2">
                                           {visitTimeSlots.map(time => (
                                               <div key={time} className="h-24 text-xs font-bold text-slate-400 flex items-start justify-between group relative">
                                                   <span className="-mt-3 bg-white pr-2 z-10">{time}</span>
                                                   <button 
                                                        onClick={(e) => { e.stopPropagation(); handleTimeSlotClick(time); }}
                                                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full p-1 transition-all transform hover:scale-110 z-20"
                                                        title="Planear Visita aquí"
                                                   >
                                                       <Plus className="h-3 w-3" />
                                                   </button>
                                               </div>
                                           ))}
                                       </div>

                                       {/* Events Column */}
                                       <div className="flex-1 pl-4 relative pt-2">
                                            {/* Grid Lines */}
                                            {visitTimeSlots.map((time, tIdx) => (
                                                 <div 
                                                    key={`line-${time}`} 
                                                    className="absolute w-full border-t border-slate-100"
                                                    style={{ top: `${tIdx * 6}rem` }} // h-24 is 6rem
                                                 ></div>
                                            ))}
                                            
                                            {visitTimeSlots.map((time, tIdx) => {
                                                const slotEvents = events.filter(e => e.type === 'visit' && e.data.visit.time === time);
                                                return (
                                                    <div 
                                                        key={time} 
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, day, time)}
                                                        className="absolute w-full hover:bg-blue-50/30 transition-colors z-0"
                                                        style={{ top: `${tIdx * 6}rem`, height: '6rem' }}
                                                    >
                                                        {slotEvents.map((evt, i) => renderEventChip(evt, i, true))}
                                                    </div>
                                                )
                                            })}
                                       </div>
                                   </div>
                               )
                           }
                           
                           if (!day) return null;

                           // Month/Week View Cell
                           return (
                               <div key={idx} 
                                   onDragOver={handleDragOver}
                                   onDrop={(e) => handleDrop(e, day)}
                                   onClick={() => handleDayClick(day)}
                                   className={`min-h-[120px] bg-white p-2 border border-slate-100 hover:bg-blue-50/20 transition-colors cursor-pointer relative group flex flex-col gap-1 ${isToday ? 'ring-1 ring-inset ring-blue-200 bg-blue-50/10' : ''}`}
                               >
                                   <div className="flex justify-between items-start">
                                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>
                                            {day.getDate()}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 bg-slate-100 p-1 rounded-full text-slate-400 hover:text-blue-500 transition-all">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                   </div>
                                   
                                   <div className="flex-1 w-full overflow-y-auto max-h-[120px] no-scrollbar space-y-1">
                                       {events.map((evt, i) => renderEventChip(evt, i))}
                                   </div>
                               </div>
                           )
                       })}
                   </div>
               </div>
           </div>
       </div>

       {/* MODALS */}
       {/* 1. Plan Visit Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="text-lg font-black text-slate-800 flex items-center">
                           {isAppointmentMode ? <Clock className="w-5 h-5 mr-2 text-pink-500" /> : <Calendar className="w-5 h-5 mr-2 text-blue-500" />}
                           {isAppointmentMode ? 'Programar Cita' : 'Planear Visita'}
                       </h3>
                       <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                   </div>
                   <div className="p-6 space-y-4 overflow-y-auto">
                        {isAppointmentMode && (
                           <div className="bg-pink-50 p-3 rounded-xl border border-pink-100 flex items-center text-pink-700 text-xs font-bold">
                               <Lock className="w-4 h-4 mr-2" />
                               Cita Bloqueada - Prioridad Alta
                           </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contacto</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="BUSCAR MÉDICO..." 
                                    value={searchDoctorTerm} 
                                    onChange={(e) => setSearchDoctorTerm(e.target.value.toUpperCase())}
                                    className="w-full pl-10 border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {searchDoctorTerm && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-lg">
                                    {filteredDoctorsForModal.map(doc => (
                                        <div 
                                            key={doc.id} 
                                            onClick={() => { setSelectedDoctorId(doc.id); setSearchDoctorTerm(doc.name); }}
                                            className={`p-3 text-xs font-bold border-b last:border-0 cursor-pointer ${selectedDoctorId === doc.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <div className="uppercase">{doc.name}</div>
                                            <div className="text-[10px] text-slate-400 font-normal flex items-center mt-1">
                                                <Building className="w-3 h-3 mr-1" /> {doc.hospital || doc.address}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredDoctorsForModal.length === 0 && <div className="p-4 text-xs text-slate-400 text-center">No encontrado</div>}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hora</label>
                            <select 
                                value={appointmentTime} 
                                onChange={(e) => setAppointmentTime(e.target.value)}
                                className="w-full border border-slate-200 bg-white rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {visitTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Objetivo</label>
                            <textarea 
                                rows={2}
                                value={planObjective}
                                onChange={(e) => setPlanObjective(e.target.value.toUpperCase())}
                                className="w-full border border-slate-200 bg-white rounded-xl p-3 text-sm uppercase font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder={isAppointmentMode ? "MOTIVO DE LA CITA..." : "OBJETIVO DE LA VISITA..."}
                            />
                        </div>
                   </div>
                   <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                       <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                       <button onClick={savePlan} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">Guardar</button>
                   </div>
               </div>
           </div>
       )}

       {/* 2. Report/Edit Modal */}
       {reportModalOpen && selectedVisitToReport && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <div>
                           <div className="flex space-x-4 mb-2">
                                <button onClick={() => setIsEditingPlan(false)} className={`text-sm font-black uppercase border-b-2 pb-1 transition-colors ${!isEditingPlan ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                                    Reportar
                                </button>
                                <button onClick={() => setIsEditingPlan(true)} className={`text-sm font-black uppercase border-b-2 pb-1 transition-colors ${isEditingPlan ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                                    Editar Plan
                                </button>
                           </div>
                           <h3 className="text-base font-bold text-slate-800 uppercase flex items-center">
                               {isEditingPlan ? 'Modificar Planificación' : 'Reportar Resultado'}
                           </h3>
                       </div>
                       <div className="flex items-center gap-2">
                            <button onClick={confirmDeleteVisit} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" title="Eliminar Visita">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => setReportModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                       </div>
                   </div>

                   <div className="p-6 space-y-5 overflow-y-auto">
                       {/* Common Fields */}
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                               <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold bg-slate-50" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                               <select value={reportTime} onChange={(e) => setReportTime(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-bold bg-slate-50">
                                   {visitTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                           </div>
                       </div>

                       {isEditingPlan ? (
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Objetivo (Editar)</label>
                               <textarea 
                                   rows={3}
                                   value={editObjective}
                                   onChange={(e) => setEditObjective(e.target.value.toUpperCase())}
                                   className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                               />
                           </div>
                       ) : (
                           <>
                               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                   <span className="text-xs font-black text-slate-400 uppercase block mb-1">Objetivo Original</span>
                                   <p className="text-sm font-bold text-slate-700 uppercase">{editObjective}</p>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Resultado</label>
                                   <select value={reportOutcome} onChange={(e) => setReportOutcome(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                       <option value="SEGUIMIENTO">SEGUIMIENTO</option>
                                       <option value="COTIZACIÓN">COTIZACIÓN</option>
                                       <option value="INTERESADO">INTERESADO</option>
                                       <option value="PROGRAMAR PROCEDIMIENTO">PROGRAMAR PROCEDIMIENTO</option>
                                       <option value="AUSENTE">AUSENTE</option>
                                   </select>
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reporte / Notas</label>
                                   <textarea 
                                       rows={3}
                                       value={reportNote}
                                       onChange={(e) => setReportNote(e.target.value.toUpperCase())}
                                       className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none uppercase resize-none"
                                       placeholder="DETALLES DE LA VISITA..."
                                   />
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Siguiente Paso</label>
                                   <textarea 
                                       rows={2}
                                       value={reportFollowUp}
                                       onChange={(e) => setReportFollowUp(e.target.value.toUpperCase())}
                                       className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none uppercase resize-none"
                                       placeholder="COMPROMISOS..."
                                   />
                               </div>
                               
                               <div className="border-t border-slate-100 pt-4">
                                   <div className="flex items-center mb-2">
                                       <input 
                                            type="checkbox" 
                                            id="scheduleNext" 
                                            checked={!!nextVisitDate} 
                                            onChange={(e) => {
                                                if(e.target.checked) setNextVisitDate(new Date());
                                                else setNextVisitDate(null);
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                                       />
                                       <label htmlFor="scheduleNext" className="text-sm font-bold text-slate-700">Agendar Próxima Visita</label>
                                   </div>
                                   
                                   {nextVisitDate && (
                                       <div className="grid grid-cols-2 gap-4 mt-2 bg-blue-50 p-3 rounded-xl">
                                           <div>
                                               <label className="block text-[10px] font-black text-blue-400 uppercase mb-1">Fecha</label>
                                               <DatePicker 
                                                    selected={nextVisitDate} 
                                                    onChange={(date) => setNextVisitDate(date)} 
                                                    dateFormat="dd/MM/yyyy"
                                                    locale="es"
                                                    className="w-full text-xs font-bold p-2 rounded border border-blue-200"
                                               />
                                           </div>
                                           <div>
                                               <label className="block text-[10px] font-black text-blue-400 uppercase mb-1">Hora</label>
                                               <select 
                                                    value={nextVisitTime} 
                                                    onChange={(e) => setNextVisitTime(e.target.value)}
                                                    className="w-full text-xs font-bold p-2 rounded border border-blue-200"
                                               >
                                                   {visitTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                               </select>
                                           </div>
                                       </div>
                                   )}
                               </div>
                           </>
                       )}
                   </div>

                   <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                       <button onClick={() => setReportModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                       {isEditingPlan ? (
                           <button onClick={savePlanChanges} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">Guardar Cambios</button>
                       ) : (
                           <button onClick={saveReport} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">Finalizar Reporte</button>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* 3. Time Off Modal */}
       {isTimeOffModalOpen && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50">
                       <h3 className="text-lg font-black text-orange-800 flex items-center">
                           <Coffee className="w-5 h-5 mr-2" />
                           Registrar Ausencia
                       </h3>
                       <button onClick={() => setIsTimeOffModalOpen(false)}><X className="w-6 h-6 text-orange-400 hover:text-orange-600" /></button>
                   </div>
                   <div className="p-6 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
                               <input type="date" value={newTimeOff.startDate} onChange={(e) => setNewTimeOff({...newTimeOff, startDate: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2 text-sm font-bold" />
                           </div>
                           <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
                               <input type="date" value={newTimeOff.endDate} onChange={(e) => setNewTimeOff({...newTimeOff, endDate: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2 text-sm font-bold" />
                           </div>
                       </div>
                       
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duración</label>
                           <select value={newTimeOff.duration} onChange={(e) => setNewTimeOff({...newTimeOff, duration: e.target.value as any})} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none">
                               <option value="TODO EL DÍA">TODO EL DÍA</option>
                               <option value="2 A 4 HRS">2 A 4 HRS</option>
                               <option value="6 A 8 HRS">6 A 8 HRS</option>
                           </select>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo</label>
                           <select value={newTimeOff.reason} onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value as any})} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none">
                               <option value="JUNTA">JUNTA</option>
                               <option value="CAPACITACIÓN">CAPACITACIÓN</option>
                               <option value="PERMISO">PERMISO</option>
                               <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                           </select>
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notas</label>
                           <textarea rows={2} value={newTimeOff.notes} onChange={(e) => setNewTimeOff({...newTimeOff, notes: e.target.value.toUpperCase()})} className="w-full border border-slate-200 rounded-xl p-3 text-sm uppercase outline-none resize-none" />
                       </div>
                   </div>
                   <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                       <button onClick={() => setIsTimeOffModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                       <button onClick={handleSaveTimeOff} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">Guardar Ausencia</button>
                   </div>
               </div>
           </div>
       )}

       {/* 4. Time Off Detail/Delete Modal */}
       {selectedTimeOff && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black text-slate-800 uppercase">{selectedTimeOff.reason}</h3>
                        <button onClick={() => setSelectedTimeOff(null)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="space-y-2 mb-6 text-sm text-slate-600">
                        <p><span className="font-bold">Periodo:</span> {selectedTimeOff.startDate} - {selectedTimeOff.endDate}</p>
                        <p><span className="font-bold">Duración:</span> {selectedTimeOff.duration}</p>
                        {selectedTimeOff.notes && <p className="italic bg-slate-50 p-2 rounded border border-slate-100">"{selectedTimeOff.notes}"</p>}
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => handleDeleteTimeOff(selectedTimeOff.id)}
                            className="flex items-center text-red-500 hover:text-red-700 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar Evento
                        </button>
                    </div>
                </div>
            </div>
       )}

    </div>
  );
};

export default ExecutiveCalendar;