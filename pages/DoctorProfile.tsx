import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Doctor, Visit, ScheduleSlot, User } from '../types';
import { Save, ArrowLeft, Clock, FileText, Calendar, UserCheck, ClipboardList, CheckCircle, MapPin, Trash2, Award, Brain, StickyNote, Mail, Phone, Building, Edit3, X, CreditCard, UserPlus } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

registerLocale('es', es);

interface DoctorProfileProps {
  doctors: Doctor[];
  onUpdate: (doctor: Doctor) => void;
  onDeleteVisit: (doctorId: string, visitId: string) => void;
  user: User;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctors, onUpdate, onDeleteVisit, user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const actionParam = searchParams.get('action');
  const fromParam = searchParams.get('from');

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({});
  
  const defaultDays = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'TODOS LOS DÍAS'];
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>([]);

  const [visitType, setVisitType] = useState<'plan' | 'report'>('report');
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    note: '',
    objective: '',
    followUp: '',
    outcome: 'SEGUIMIENTO'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'visits'>('profile');

  const executives = ['LUIS', 'ORALIA', 'ANGEL', 'TALINA', 'SIN ASIGNAR'];

  const timeSlots = [];
  for (let i = 9; i <= 20; i++) {
      timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
      if (i !== 20) timeSlots.push(`${i.toString().padStart(2, '0')}:30`);
  }

  useEffect(() => {
    const found = doctors.find(d => d.id === id);
    if (found) {
      if (user.role === 'executive' && found.executive !== user.name) {
          alert("No tienes permiso para ver este perfil.");
          navigate('/doctors');
          return;
      }
      setDoctor(found);
      if (!isEditing) setFormData(found);
      
      let initialSchedule: ScheduleSlot[] = [];
      if (found.schedule && found.schedule.length > 0) {
          initialSchedule = defaultDays.map(day => {
              const existing = found.schedule.find(s => s.day === day);
              return existing || { day, time: '', active: false };
          });
      } else {
          initialSchedule = defaultDays.map(day => ({ day, time: '', active: false }));
      }
      setScheduleData(initialSchedule);
      
      if (actionParam === 'plan') {
          setActiveTab('visits');
          setVisitType('plan');
      }
    } else { navigate('/doctors'); }
  }, [id, doctors, navigate, actionParam, user, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = name === 'email' ? value : value.toUpperCase();
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (date: Date | null, field: string) => {
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setFormData(prev => ({ ...prev, [field]: dateStr }));
      }
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleSlot, value: any) => {
      const newSchedule = [...scheduleData];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      setScheduleData(newSchedule);
  };

  const saveProfile = () => {
    if (doctor && formData) {
      const updatedDoctor = { ...doctor, ...formData, schedule: scheduleData } as Doctor;
      onUpdate(updatedDoctor);
      setDoctor(updatedDoctor);
      setIsEditing(false);
      alert("Ficha actualizada correctamente.");
    }
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !newVisit.date) return;
    let visit: Visit;
    if (visitType === 'plan') {
        if (!newVisit.objective) { alert("Error: El campo 'Objetivo' es obligatorio."); return; }
        visit = { id: Date.now().toString(), date: newVisit.date, time: newVisit.time, note: 'VISITA PLANEADA', objective: newVisit.objective.toUpperCase(), outcome: 'PLANEADA', status: 'planned' };
    } else {
        if (!newVisit.note || !newVisit.objective || !newVisit.followUp) { alert("Error: Todos los campos son obligatorios."); return; }
        visit = { id: Date.now().toString(), date: newVisit.date, time: newVisit.time, note: newVisit.note.toUpperCase(), objective: newVisit.objective.toUpperCase(), followUp: newVisit.followUp.toUpperCase(), outcome: newVisit.outcome as any, status: 'completed' };
    }
    const currentVisits = doctor.visits || [];
    const updatedVisits = [visit, ...currentVisits];
    const updatedDoctor = { ...doctor, visits: updatedVisits };
    onUpdate(updatedDoctor);
    setDoctor(updatedDoctor);
    setNewVisit({ date: new Date().toISOString().split('T')[0], time: '09:00', note: '', objective: '', followUp: '', outcome: 'SEGUIMIENTO' });
    alert(visitType === 'plan' ? "Visita programada." : "Reporte guardado.");
  };

  const confirmDelete = (visitId: string) => {
      if (window.confirm("¿Está seguro de eliminar este registro?")) { onDeleteVisit(doctor?.id || '', visitId); }
  };

  const parseDateString = (dateStr: string) => {
      if (!dateStr) return null;
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

  if (!doctor) return null;
  const isMedico = !doctor.category || doctor.category === 'MEDICO';
  const isAdminCat = doctor.category === 'ADMINISTRATIVO';
  const isHospital = doctor.category === 'HOSPITAL';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <button type="button" onClick={() => fromParam === 'calendar' ? navigate('/calendar') : navigate('/doctors')} className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white/50 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200/60">
        <ArrowLeft className="h-4 w-4 mr-2" /> {fromParam === 'calendar' ? 'Volver al Calendario' : 'Volver al Directorio'}
      </button>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-blue-500/5 border border-white/60 overflow-hidden relative">
        <div className="h-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        <div className="p-8 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
             <div className="flex items-center flex-wrap gap-3">
                 <h2 className="text-3xl font-black leading-7 text-slate-800 sm:text-4xl sm:truncate uppercase tracking-tight">{doctor.name}</h2>
                {doctor.isInsuranceDoctor && isMedico && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide shadow-sm"><CheckCircle className="w-3 h-3 mr-1" />Médico Aseguradora</span>
                )}
                {isAdminCat && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">Administrativo</span>}
                {isHospital && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold uppercase">Hospital</span>}
             </div>
            <p className="mt-4 text-sm text-slate-500 flex items-center font-medium">
                {(isMedico || isAdminCat) && (<span className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-sm border border-blue-100 mr-3">{doctor.specialty || doctor.area || 'GENERAL'}</span>)}
                <span className="text-slate-600 flex items-center uppercase"><MapPin className="w-4 h-4 mr-1 text-slate-400" /> {doctor.address}</span>
            </p>
          </div>
          <div className="mt-6 md:mt-0 md:ml-6 flex flex-col items-end">
                 <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ejecutivo Asignado</span>
                 <span className="text-base font-black text-slate-800 bg-slate-100 px-4 py-2 rounded-xl mt-2 border border-slate-200 shadow-inner uppercase tracking-wide">{doctor.executive}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-8"><nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-4 font-bold text-sm transition-all duration-300 ${activeTab === 'profile' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'}`}><UserCheck className="inline-block w-4 h-4 mr-2" />Ficha</button>
            <button onClick={() => setActiveTab('visits')} className={`py-4 px-1 border-b-4 font-bold text-sm transition-all duration-300 ${activeTab === 'visits' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'}`}><ClipboardList className="inline-block w-4 h-4 mr-2" />Gestión de Visitas</button>
        </nav></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-white/60 p-8 min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-fadeIn">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 sticky top-0 bg-white/95 z-20 backdrop-blur-sm">
                     <h3 className="text-xl font-bold text-slate-800 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500"/>Información Completa</h3>
                     {!isEditing ? (
                         <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center"><Edit3 className="w-4 h-4 mr-2"/>Editar Ficha</button>
                     ) : (
                         <div className="flex space-x-3">
                            <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 px-5 rounded-xl transition-colors">Cancelar</button>
                            <button type="button" onClick={saveProfile} className="flex items-center text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"><Save className="w-4 h-4 mr-2" />Guardar Cambios</button>
                         </div>
                     )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Control de Cartera y Contacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className="lg:col-span-1">
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2 flex items-center">
                                    <UserPlus className="w-3 h-3 mr-1 text-blue-500" /> Ejecutivo Asignado
                                </label>
                                {isEditing && user.role === 'admin' ? (
                                    <select name="executive" value={formData.executive || ''} onChange={handleInputChange} className="block w-full border border-blue-200 rounded-xl p-3 text-sm text-blue-900 focus:ring-2 focus:ring-blue-500 bg-blue-50/50 font-bold uppercase">
                                        {executives.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-blue-900 font-black text-base uppercase bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
                                        {doctor.executive}
                                        {user.role === 'admin' && !isEditing && <span className="text-[8px] font-bold text-blue-400 bg-white px-2 py-0.5 rounded border border-blue-100">EDITABLE POR ADMIN</span>}
                                    </p>
                                )}
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Nombre</label>
                                {isEditing ? (<input spellCheck={true} lang="es" type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" />) : (<p className="text-slate-900 font-bold text-base uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.name}</p>)}
                            </div>
                            <div className="lg:col-span-3">
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Dirección</label>
                                {isEditing ? (<input spellCheck={true} lang="es" type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.address}</p>)}
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Fecha de Nacimiento</label>
                                {isEditing ? (<DatePicker selected={parseDateString(formData.birthDate || '')} onChange={(date) => handleDateChange(date, 'birthDate')} dateFormat="dd/MM/yyyy" locale="es" className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium" placeholderText="DD/MM/AAAA" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={100} />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent flex items-center"><Calendar className="w-3 h-3 mr-2 text-slate-400"/>{doctor.birthDate ? parseDateString(doctor.birthDate)?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'NO REGISTRADA'}</p>)}
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Cédula Profesional</label>
                                {isEditing ? (<input type="text" name="cedula" value={formData.cedula || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" placeholder="#######" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent flex items-center"><CreditCard className="w-3 h-3 mr-2 text-slate-400"/>{doctor.cedula || 'NO REGISTRADA'}</p>)}
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Teléfono</label>
                                {isEditing ? (<input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium" placeholder="### ### ####" />) : (<p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-xl border border-transparent flex items-center"><Phone className="w-3 h-3 mr-2 text-slate-400"/> {doctor.phone || 'NO REGISTRADO'}</p>)}
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Correo Electrónico</label>
                                {isEditing ? (<input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium" />) : (<p className="text-slate-900 font-medium bg-slate-50 p-3 rounded-xl border border-transparent flex items-center lowercase"><Mail className="w-3 h-3 mr-2 text-slate-400"/> {doctor.email || 'NO REGISTRADO'}</p>)}
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Hospital / Ubicación</label>
                                {isEditing ? (<input spellCheck={true} lang="es" type="text" name="hospital" value={formData.hospital || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.hospital || 'NO REGISTRADO'}</p>)}
                            </div>
                            {!isHospital && (<><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Piso</label>{isEditing ? (<input type="text" name="floor" value={formData.floor || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" placeholder="EJ: 3" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.floor || 'N/A'}</p>)}</div><div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Oficina</label>{isEditing ? (<input type="text" name="officeNumber" value={formData.officeNumber || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" placeholder="EJ: 305" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.officeNumber || 'N/A'}</p>)}</div></div></>)}
                            {isMedico && isEditing && (
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2"><span className="text-xs font-extrabold text-slate-500 uppercase">¿Es Médico de Aseguradora?</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={formData.isInsuranceDoctor || false} onChange={(e) => setFormData({...formData, isInsuranceDoctor: e.target.checked})} /><div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div>
                            )}
                        </div>
                    </div>
                    {isMedico && (
                        <div className="lg:col-span-3">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 mt-4">Perfil Profesional</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Especialidad</label>{isEditing ? (<input spellCheck={true} lang="es" type="text" name="specialty" value={formData.specialty || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.specialty || 'GENERAL'}</p>)}</div>
                                <div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Subespecialidad</label>{isEditing ? (<input spellCheck={true} lang="es" type="text" name="subSpecialty" value={formData.subSpecialty || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase" placeholder="EJ: ONCOLOGÍA" />) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.subSpecialty || 'N/A'}</p>)}</div>
                                <div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Categoría (Clasificación)</label>{isEditing ? (<select name="classification" value={formData.classification || 'C'} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium"><option value="A">VIP (A)</option><option value="B">REGULAR (B)</option><option value="C">BASICO (C)</option></select>) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.classification === 'A' ? 'VIP (A)' : (doctor.classification === 'B' ? 'REGULAR (B)' : 'BASICO (C)')}</p>)}</div>
                            </div>
                        </div>
                    )}
                    {isMedico && (
                        <div className="lg:col-span-3">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 mt-4">Perfilamiento Psigráfico</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Estilo Social</label>{isEditing ? (<select name="socialStyle" value={formData.socialStyle || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium"><option value="">SELECCIONAR</option><option value="ANALÍTICO">ANALÍTICO</option><option value="EMPRENDEDOR">EMPRENDEDOR</option><option value="AFABLE">AFABLE</option><option value="EXPRESIVO">EXPRESIVO</option></select>) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.socialStyle || 'NO DEFINIDO'}</p>)}</div>
                                <div><label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Segmento Actitudinal</label>{isEditing ? (<select name="attitudinalSegment" value={formData.attitudinalSegment || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium"><option value="">SELECCIONAR</option><option value="RELACIÓN">RELACIÓN</option><option value="PACIENTE">PACIENTE</option><option value="INNOVACIÓN">INNOVACIÓN</option><option value="EXPERIENCIA">EXPERIENCIA</option></select>) : (<p className="text-slate-900 font-medium uppercase bg-slate-50 p-3 rounded-xl border border-transparent">{doctor.attitudinalSegment || 'NO DEFINIDO'}</p>)}</div>
                            </div>
                        </div>
                    )}
                    <div className="lg:col-span-3">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 mt-4">Horarios de Atención</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {scheduleData.map((slot, idx) => (<div key={slot.day} className={`p-3 rounded-xl border transition-all ${slot.active ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-75'}`}><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-slate-600 uppercase">{slot.day}</span>{isEditing && (<input type="checkbox" checked={slot.active} onChange={(e) => handleScheduleChange(idx, 'active', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"/>)}</div>{isEditing ? (<input type="text" value={slot.time} disabled={!slot.active} onChange={(e) => handleScheduleChange(idx, 'time', e.target.value.toUpperCase())} className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white text-slate-900 uppercase focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100" placeholder="EJ: 9:00 - 14:00"/>) : (<p className="text-xs font-bold text-slate-800 uppercase">{slot.active ? (slot.time || 'DISPONIBLE') : 'NO DISPONIBLE'}</p>)}</div>))}
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-extrabold text-slate-500 uppercase mb-2">Notas Importantes</label>
                        {isEditing ? (<textarea spellCheck={true} lang="es" name="importantNotes" rows={4} value={formData.importantNotes || ''} onChange={handleInputChange} className="block w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white font-medium uppercase shadow-sm" placeholder="OBSERVACIONES..." />) : (<div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-800 text-sm font-medium leading-relaxed uppercase shadow-sm">{doctor.importantNotes || 'SIN NOTAS ADICIONALES.'}</div>)}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-8 animate-fadeIn">
               <div className="bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden">
                   <div className="flex border-b border-slate-200 bg-white p-2 gap-2"><button onClick={() => setVisitType('report')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${visitType === 'report' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50'}`}>Reportar Visita</button><button onClick={() => setVisitType('plan')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${visitType === 'plan' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-inner' : 'text-slate-500 hover:bg-slate-50'}`}>Planear Siguiente</button></div>
                   <div className="p-8"><form onSubmit={handleAddInteraction} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Fecha</label><DatePicker selected={parseDateString(newVisit.date || '')} onChange={(date) => setNewVisit({...newVisit, date: formatDateToString(date)})} dateFormat="dd/MM/yyyy" locale="es" showMonthDropdown showYearDropdown dropdownMode="select" className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium" required /></div>{visitType === 'plan' && (<div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Hora</label><select value={newVisit.time} onChange={(e) => setNewVisit({...newVisit, time: e.target.value})} className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"><option value="">SIN HORA</option>{timeSlots.map(time => <option key={time} value={time}>{time}</option>)}</select></div>)}{visitType === 'report' && (<div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Resultado</label><select value={newVisit.outcome || 'SEGUIMIENTO'} onChange={(e) => setNewVisit({...newVisit, outcome: e.target.value as any})} className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"><option value="SEGUIMIENTO">SEGUIMIENTO</option><option value="COTIZACIÓN">COTIZACIÓN</option><option value="INTERESADO">INTERESADO</option><option value="PROGRAMAR PROCEDIMIENTO">PROGRAMAR PROCEDIMIENTO</option></select></div>)}</div><div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Objetivo de la Visita</label><textarea spellCheck={true} lang="es" value={newVisit.objective || ''} onChange={(e) => setNewVisit({...newVisit, objective: e.target.value.toUpperCase()})} placeholder="DESCRIBA EL PROPÓSITO DE LA VISITA..." rows={2} className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none uppercase shadow-sm" /></div>{visitType === 'report' && (<><div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Reporte / Resultado</label><textarea spellCheck={true} lang="es" value={newVisit.note || ''} onChange={(e) => setNewVisit({...newVisit, note: e.target.value.toUpperCase()})} placeholder="DETALLES RELEVANTES DE LA INTERACCIÓN..." rows={3} className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none uppercase shadow-sm" /></div><div><label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Seguimiento / Próximo Paso</label><textarea spellCheck={true} lang="es" value={newVisit.followUp || ''} onChange={(e) => setNewVisit({...newVisit, followUp: e.target.value.toUpperCase()})} placeholder="COMPROMISOS O ACCIONES A SEGUIR..." rows={2} className="block w-full border border-slate-200 bg-white rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none uppercase shadow-sm" /></div></>)}<div className="flex justify-end pt-2"><button type="submit" className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${visitType === 'plan' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30'}`}>{visitType === 'plan' ? 'Agendar en Calendario' : 'Guardar Reporte'}</button></div></form></div>
               </div>

               <div className="mt-10">
                   <h4 className="text-xl font-black text-slate-800 mb-6 pl-3 border-l-4 border-blue-500">Historial de Visitas</h4>
                   {doctor.visits.filter(v => v.status === 'completed' || !v.status).length > 0 ? (
                       <ul className="space-y-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                           {doctor.visits.filter(v => v.status === 'completed' || !v.status).map((visit) => (
                               <li key={visit.id} className="relative pl-16 group"><div className="absolute left-4 top-5 w-8 h-8 rounded-full bg-white border-4 border-blue-500 shadow-md flex items-center justify-center z-10"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div></div>
                                   <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 relative pr-12"><button type="button" onClick={(e) => { e.stopPropagation(); confirmDelete(visit.id); }} className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all shadow-sm z-10 cursor-pointer" title="Eliminar este reporte"><Trash2 className="h-4 w-4" /></button>
                                       <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2"><div className="flex items-center"><div><span className="block text-lg font-bold text-slate-800">{visit.date}</span>{visit.time && <span className="text-sm text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg mr-2">{visit.time}</span>}<span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Visita Completada</span></div></div><span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide shadow-sm ${visit.outcome === 'INTERESADO' ? 'bg-green-100 text-green-700' : visit.outcome === 'COTIZACIÓN' ? 'bg-blue-100 text-blue-700' : visit.outcome === 'CITA' ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-700'}`}>{visit.outcome}</span></div>
                                       <div className="space-y-3">{visit.objective && (<div className="text-sm flex items-start"><span className="font-bold text-slate-700 mr-2 min-w-[80px]">Objetivo:</span><span className="text-slate-600 bg-slate-50 px-2 rounded uppercase">{visit.objective}</span></div>)}<div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed uppercase">"{visit.note}"</div>{visit.followUp && (<div className="text-sm pt-1 flex items-start"><span className="font-bold text-blue-600 mr-2 min-w-[80px]">Seguimiento:</span><span className="text-slate-600 font-medium uppercase">{visit.followUp}</span></div>)}</div>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (<div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"><FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" /><p className="text-slate-500 font-bold text-lg">No hay visitas reportadas aún.</p><p className="text-slate-400 text-sm">Registra tu primera interacción arriba.</p></div>)}
               </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default DoctorProfile;