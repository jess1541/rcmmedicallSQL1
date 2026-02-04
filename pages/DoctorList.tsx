import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor, ScheduleSlot, User } from '../types';
import { Search, Filter, MapPin, Stethoscope, User as UserIcon, Download, Plus, X, ArrowRight, Building2, Briefcase, Trash2 } from 'lucide-react';

interface DoctorListProps {
  doctors: Doctor[];
  onAddDoctor?: (doc: Doctor) => void;
  onDeleteDoctor?: (id: string) => void;
  user: User;
}

type TabType = 'MEDICO' | 'ADMINISTRATIVO' | 'HOSPITAL';

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onAddDoctor, onDeleteDoctor, user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState(user.role === 'executive' ? user.name : 'TODOS');
  const [activeTab, setActiveTab] = useState<TabType>('MEDICO');
  
  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Generic Form Data
  const [formData, setFormData] = useState<Partial<Doctor>>({
      name: '',
      executive: user.role === 'executive' ? user.name : 'SIN ASIGNAR',
      specialty: '',
      address: '',
      hospital: '',
      area: '',
      phone: '',
      email: '',
      importantNotes: ''
  });

  const executives = useMemo(() => {
    const execs = new Set(doctors.map(d => d.executive));
    return ['TODOS', ...Array.from(execs).sort()];
  }, [doctors]);

  const filteredItems = useMemo(() => {
    return doctors.filter(doc => {
      // Default category to MEDICO if not present for legacy data
      const category = doc.category || 'MEDICO';
      
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            doc.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExec = selectedExecutive === 'TODOS' || doc.executive === selectedExecutive;
      const matchesTab = category === activeTab;
      
      return matchesSearch && matchesExec && matchesTab;
    });
  }, [doctors, searchTerm, selectedExecutive, activeTab]);

  const handleExport = () => {
    const headers = [
        "Categoria", "Nombre", "Ejecutivo", "Especialidad/Area", "Hospital", 
        "Dirección", "Telefono", "Email", "Notas"
    ];

    const csvRows = [
        headers.join(','),
        ...filteredItems.map(doc => {
            return [
                `"${doc.category || 'MEDICO'}"`,
                `"${doc.name}"`,
                `"${doc.executive}"`,
                `"${doc.specialty || doc.area || ''}"`,
                `"${doc.hospital || ''}"`,
                `"${doc.address}"`,
                `"${doc.phone || ''}"`,
                `"${doc.email || ''}"`,
                `"${doc.importantNotes || ''}"`
            ].join(',');
        })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `base_datos_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      // Detener propagación es CRÍTICO aquí para evitar que se abra la ficha del médico
      e.preventDefault();
      e.stopPropagation();
      
      const confirmDelete = window.confirm('¿Está seguro de que desea eliminar este registro permanentemente? Esta acción no se puede deshacer.');
      
      if (confirmDelete && onDeleteDoctor) {
          onDeleteDoctor(id);
      }
  };

  const handleCardClick = (id: string) => {
      navigate(`/doctors/${id}`);
  };

  const resetForm = () => {
      setIsAddModalOpen(false);
      setFormSubmitted(false);
      setFormData({
          name: '',
          executive: user.role === 'executive' ? user.name : 'SIN ASIGNAR',
          specialty: '',
          address: '',
          hospital: '',
          area: '',
          phone: '',
          email: '',
          importantNotes: ''
      });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setFormSubmitted(true);

      if (!formData.name?.trim()) return;
      if (activeTab === 'MEDICO' && !formData.specialty) return;

      if (!onAddDoctor) return;

      const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'TODOS LOS DÍAS'];
      const initialSchedule: ScheduleSlot[] = days.map(day => ({ day, time: '', active: false }));

      const newDoctor: Doctor = {
          id: `${activeTab.substring(0,3).toLowerCase()}-${Date.now()}`,
          category: activeTab,
          name: formData.name.toUpperCase(),
          executive: formData.executive?.toUpperCase() || 'SIN ASIGNAR',
          specialty: formData.specialty?.toUpperCase() || (activeTab === 'HOSPITAL' ? 'HOSPITAL' : ''),
          address: formData.address?.toUpperCase() || '',
          hospital: formData.hospital?.toUpperCase() || '',
          area: formData.area?.toUpperCase() || '',
          phone: formData.phone || '',
          email: formData.email || '',
          importantNotes: formData.importantNotes?.toUpperCase() || '',
          visits: [],
          schedule: initialSchedule,
          isInsuranceDoctor: false
      };
      
      onAddDoctor(newDoctor);
      resetForm();
      // Feedback visual sutil en lugar de alert intrusivo
      console.log(`Nuevo ${activeTab.toLowerCase()} registrado exitosamente.`);
  };

  return (
    <div className="space-y-6 relative pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Directorio</h1>
            <p className="text-slate-500 font-medium">Gestiona tu base de datos de contactos.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-bold text-sm active:scale-95"
            >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Nuevo
            </button>
            <button 
                onClick={handleExport}
                className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-sm font-bold text-sm"
            >
                <Download className="h-4 w-4 mr-2" />
                Exportar
            </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {(['MEDICO', 'ADMINISTRATIVO', 'HOSPITAL'] as TabType[]).map(tab => (
              <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  {tab === 'MEDICO' ? 'MÉDICOS' : (tab === 'ADMINISTRATIVO' ? 'ADMINISTRATIVOS' : 'HOSPITALES')}
              </button>
          ))}
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            spellCheck={true}
            lang="es"
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-black placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
            placeholder={`BUSCAR ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Ejecutivo</label>
            <div className="relative">
                {user.role === 'admin' ? (
                    <select
                        className="block w-full pl-4 pr-10 py-3 text-sm font-bold border-slate-200 bg-slate-50 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                        value={selectedExecutive}
                        onChange={(e) => setSelectedExecutive(e.target.value)}
                    >
                    {executives.map(exec => (
                        <option key={exec} value={exec}>{exec}</option>
                    ))}
                    </select>
                ) : (
                    <div className="block w-full pl-4 pr-10 py-3 text-sm font-bold border border-slate-200 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed">
                        {user.name}
                    </div>
                )}
                
                {user.role === 'admin' && (
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-400" />
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item.id)}
            className={`group block bg-white rounded-3xl shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden cursor-pointer ${item.isInsuranceDoctor ? 'border-l-4 border-l-yellow-400 border-t border-r border-b border-slate-100' : 'border border-slate-100'}`}
          >
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                 <div className={`rounded-2xl p-3 text-white shadow-sm ${
                     activeTab === 'MEDICO' ? 'bg-blue-500' : 
                     activeTab === 'ADMINISTRATIVO' ? 'bg-purple-500' : 'bg-emerald-500'
                 }`}>
                    {activeTab === 'MEDICO' ? <Stethoscope className="h-6 w-6" /> : 
                     activeTab === 'ADMINISTRATIVO' ? <Briefcase className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                 </div>
                 <div className="flex flex-col items-end gap-2 relative z-20">
                    {item.isInsuranceDoctor && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wide shadow-sm">
                            Aseguradora
                        </span>
                    )}
                    {user.role === 'admin' && (
                        <button 
                            onClick={(e) => handleDelete(e, item.id)}
                            className="flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-400 hover:shadow-red-200 transform hover:scale-105"
                            title="Eliminar registro"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                 </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-800 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors uppercase" title={item.name}>{item.name}</h3>
              
              <div className="space-y-2 mt-4">
                {activeTab !== 'HOSPITAL' && (
                    <div className="flex items-start text-sm text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold mr-2 uppercase text-slate-400">
                        {activeTab === 'MEDICO' ? 'ESP' : 'AREA'}
                    </span>
                    <span className="line-clamp-1 uppercase">{item.specialty || item.area || 'N/A'}</span>
                    </div>
                )}
                {item.hospital && activeTab === 'ADMINISTRATIVO' && (
                    <div className="flex items-start text-sm text-slate-500">
                        <Building2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-1 uppercase">{item.hospital}</span>
                    </div>
                )}
                <div className="flex items-start text-sm text-slate-500">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="line-clamp-2 text-xs uppercase">{item.address || 'SIN DIRECCIÓN'}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center">
                    <span className="text-slate-400 font-bold mr-2">EJECUTIVO:</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase">{item.executive}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-lg font-medium">No se encontraron registros en {activeTab}.</p>
          </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn scale-100 transform transition-all max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="text-xl font-black text-slate-800">Registrar Nuevo {activeTab === 'MEDICO' ? 'Médico' : (activeTab === 'ADMINISTRATIVO' ? 'Administrativo' : 'Hospital')}</h3>
                      <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
                  </div>
                  
                  <form onSubmit={handleAddSubmit} className="p-8 space-y-5" noValidate>
                      {/* Name */}
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">
                              {activeTab === 'HOSPITAL' ? 'Nombre del Hospital' : 'Nombre Completo'} <span className="text-red-500">*</span>
                          </label>
                          <input 
                              type="text" required spellCheck={true} lang="es"
                              className={`w-full border bg-slate-50 rounded-xl p-3 text-sm text-black focus:ring-2 focus:ring-blue-500 uppercase ${formSubmitted && !formData.name ? 'border-red-500' : 'border-slate-200'}`}
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                          />
                      </div>

                      {/* Fields for MEDICO */}
                      {activeTab === 'MEDICO' && (
                          <div className="grid grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Especialidad <span className="text-red-500">*</span></label>
                                  <select required className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black outline-none"
                                      value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}>
                                      <option value="">SELECCIONAR</option>
                                      <option value="GINECOLOGÍA">GINECOLOGÍA</option>
                                      <option value="UROLOGÍA">UROLOGÍA</option>
                                      <option value="OTRA">OTRA</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Hospital</label>
                                  <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black uppercase"
                                      value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value.toUpperCase()})} />
                              </div>
                          </div>
                      )}

                      {/* Fields for ADMINISTRATIVO */}
                      {activeTab === 'ADMINISTRATIVO' && (
                          <div className="grid grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Área / Puesto</label>
                                  <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black uppercase"
                                      value={formData.area} onChange={e => setFormData({...formData, area: e.target.value.toUpperCase()})} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Hospital</label>
                                  <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black uppercase"
                                      value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value.toUpperCase()})} />
                              </div>
                          </div>
                      )}

                      {/* Common Fields */}
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Dirección</label>
                          <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black uppercase"
                              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value.toUpperCase()})} />
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Teléfono</label>
                              <input type="text" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black"
                                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          {activeTab !== 'HOSPITAL' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Correo</label>
                                  <input type="email" className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black"
                                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                              </div>
                          )}
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Notas</label>
                          <textarea className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black uppercase" rows={3}
                              value={formData.importantNotes} onChange={e => setFormData({...formData, importantNotes: e.target.value.toUpperCase()})} />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Ejecutivo Asignado</label>
                          {user.role === 'admin' ? (
                              <select className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm text-black"
                                  value={formData.executive} onChange={e => setFormData({...formData, executive: e.target.value})}>
                                  {executives.filter(e => e !== 'TODOS').map(e => <option key={e} value={e}>{e}</option>)}
                                  <option value="SIN ASIGNAR">SIN ASIGNAR</option>
                              </select>
                          ) : (
                              <input type="text" disabled className="w-full border border-slate-200 bg-slate-100 text-slate-500 rounded-xl p-3 text-sm font-bold" value={user.name} />
                          )}
                      </div>

                      <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
                          <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-95">Guardar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default DoctorList;