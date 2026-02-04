
export interface Visit {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  time?: string; // HH:MM
  note: string; // "Resultado de la visita"
  objective?: string; // "Objetivo de la visita"
  followUp?: string; // "Seguimiento"
  outcome: 'SEGUIMIENTO' | 'COTIZACIÓN' | 'INTERESADO' | 'PROGRAMAR PROCEDIMIENTO' | 'PLANEADA' | 'CITA' | 'AUSENTE';
  status: 'planned' | 'completed';
}

export interface ScheduleSlot {
  day: string;
  time: string;
  active: boolean;
}

export interface TimeOffEvent {
  id: string;
  executive: string;
  startDate: string;
  endDate: string;
  duration: '2 A 4 HRS' | '6 A 8 HRS' | 'TODO EL DÍA';
  reason: 'JUNTA' | 'CAPACITACIÓN' | 'PERMISO' | 'ADMINISTRATIVO';
  notes: string;
}

export interface Doctor {
  id: string;
  category: 'MEDICO' | 'ADMINISTRATIVO' | 'HOSPITAL'; // New Category Field
  executive: string;
  name: string;
  specialty?: string; // Optional for Hospitals
  address: string;
  
  // New Contact Fields
  phone?: string;
  email?: string;
  floor?: string;
  officeNumber?: string;
  
  // Admin Specific
  area?: string;

  // Editable Fields
  hospital?: string;
  subSpecialty?: string;
  birthDate?: string;

  // Ficha Medica Fields
  cedula?: string; // NEW FIELD: Cédula Profesional
  profile?: string; 
  classification?: 'A' | 'B' | 'C';
  
  // New Profile Fields
  socialStyle?: 'ANALÍTICO' | 'EMPRENDEDOR' | 'AFABLE' | 'EXPRESIVO' | '';
  attitudinalSegment?: 'RELACIÓN' | 'PACIENTE' | 'INNOVACIÓN' | 'EXPERIENCIA' | '';

  // New Schedule Structure (Array of fixed slots)
  schedule: ScheduleSlot[];
  
  importantNotes?: string;
  isInsuranceDoctor?: boolean; 
  visits: Visit[];
}

export interface Procedure {
  id: string;
  date: string;
  time?: string; // New Time Field
  hospital?: string; // New Hospital Field
  doctorId: string;
  doctorName: string;
  procedureType: string;
  paymentType: 'DIRECTO' | 'ASEGURADORA'; // Payment Type Added
  cost?: number; 
  commission?: number; // New Commission Field
  technician?: string; // New Technician Field
  notes: string;
  status: 'scheduled' | 'performed'; // Scheduled (Red), Performed (Green)
}

export interface Stats {
  totalDoctors: number;
  totalVisits: number;
  byExecutive: Record<string, number>;
  insuranceDoctors: number;
  classifications: { A: number; B: number; C: number; None: number };
}

export interface User {
  name: string;
  role: 'admin' | 'executive';
  password?: string;
}
