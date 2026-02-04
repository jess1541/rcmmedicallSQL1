const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// --- Configuración de Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST", "DELETE", "PUT"]
    }
});

io.on('connection', (socket) => {
    console.log('⚡ Nuevo cliente conectado:', socket.id);
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// --- SQL Database Connection (SQLite) ---
// Usamos SQLite por defecto. Para producción real en Cloud Run con persistencia, 
// --- SQL Database Connection (PostgreSQL / Cloud SQL) ---
const sequelize = new Sequelize(
  process.env.DB_NAME,      // crm_production
  process.env.DB_USER,      // postgres
  process.env.DB_PASSWORD,  // Medicall2026!
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',    // <--- AHORA SÍ: Usamos el motor correcto
    logging: false,
    dialectOptions: process.env.DB_HOST && process.env.DB_HOST.startsWith('/cloudsql') 
      ? { socketPath: process.env.DB_HOST } // Magia para conectar con Google Cloud
      : {} 
  }
);

// --- Definición de Modelos SQL ---

// 1. Modelo Doctor
const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.STRING, primaryKey: true },
    category: { type: DataTypes.STRING, defaultValue: 'MEDICO' },
    executive: DataTypes.STRING,
    name: DataTypes.STRING,
    specialty: DataTypes.STRING,
    subSpecialty: DataTypes.STRING,
    address: DataTypes.STRING,
    hospital: DataTypes.STRING,
    area: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    floor: DataTypes.STRING,
    officeNumber: DataTypes.STRING,
    birthDate: DataTypes.STRING,
    cedula: DataTypes.STRING,
    profile: DataTypes.STRING,
    classification: DataTypes.STRING,
    socialStyle: DataTypes.STRING,
    attitudinalSegment: DataTypes.STRING,
    importantNotes: DataTypes.TEXT,
    isInsuranceDoctor: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// 2. Modelo Visit (Relacionado con Doctor)
const Visit = sequelize.define('Visit', {
    id: { type: DataTypes.STRING, primaryKey: true },
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    note: DataTypes.TEXT,
    objective: DataTypes.STRING,
    followUp: DataTypes.STRING,
    outcome: DataTypes.STRING,
    status: DataTypes.STRING
});

// 3. Modelo Schedule (Relacionado con Doctor)
const Schedule = sequelize.define('Schedule', {
    day: DataTypes.STRING,
    time: DataTypes.STRING,
    active: DataTypes.BOOLEAN
});

// 4. Modelo Procedure
const Procedure = sequelize.define('Procedure', {
    id: { type: DataTypes.STRING, primaryKey: true },
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    hospital: DataTypes.STRING,
    doctorId: DataTypes.STRING,
    doctorName: DataTypes.STRING,
    procedureType: DataTypes.STRING,
    paymentType: DataTypes.STRING,
    cost: DataTypes.FLOAT,
    commission: DataTypes.FLOAT,
    technician: DataTypes.STRING,
    notes: DataTypes.TEXT,
    status: DataTypes.STRING
});

// --- Relaciones ---
// Un Doctor tiene muchas Visitas
Doctor.hasMany(Visit, { as: 'visits', foreignKey: 'doctorRefId', onDelete: 'CASCADE' });
Visit.belongsTo(Doctor, { foreignKey: 'doctorRefId' });

// Un Doctor tiene muchos Horarios
Doctor.hasMany(Schedule, { as: 'schedule', foreignKey: 'doctorRefId', onDelete: 'CASCADE' });
Schedule.belongsTo(Doctor, { foreignKey: 'doctorRefId' });

// Sincronización de Base de Datos
sequelize.sync({ alter: true })
    .then(() => console.log("✅ Base de datos SQL Sincronizada"))
    .catch(err => console.error("❌ Error sincronizando SQL:", err));

// --- API Routes ---

app.get('/api/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [
                { model: Visit, as: 'visits' },
                { model: Schedule, as: 'schedule' }
            ]
        });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/doctors', async (req, res) => {
    const data = req.body;
    const t = await sequelize.transaction();

    try {
        // 1. Upsert Doctor (Crear o Actualizar)
        const [doctor, created] = await Doctor.findOrCreate({
            where: { id: data.id },
            defaults: data,
            transaction: t
        });

        if (!created) {
            await doctor.update(data, { transaction: t });
        }

        // 2. Manejo de Visits (Estrategia: Eliminar existentes y recrear para mantener consistencia con frontend)
        if (data.visits) {
            await Visit.destroy({ where: { doctorRefId: data.id }, transaction: t });
            if (data.visits.length > 0) {
                const visitsWithRef = data.visits.map(v => ({ ...v, doctorRefId: data.id }));
                await Visit.bulkCreate(visitsWithRef, { transaction: t });
            }
        }

        // 3. Manejo de Schedule
        if (data.schedule) {
            await Schedule.destroy({ where: { doctorRefId: data.id }, transaction: t });
            if (data.schedule.length > 0) {
                const scheduleWithRef = data.schedule.map(s => ({ ...s, doctorRefId: data.id }));
                await Schedule.bulkCreate(scheduleWithRef, { transaction: t });
            }
        }

        await t.commit();

        // Obtener el objeto completo actualizado para enviarlo por Socket
        const updatedDoctor = await Doctor.findOne({
            where: { id: data.id },
            include: ['visits', 'schedule']
        });

        io.emit('server:doctor_updated', updatedDoctor);
        res.json(updatedDoctor);

    } catch (error) {
        await t.rollback();
        console.error("Error saving doctor:", error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/doctors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Doctor.destroy({ where: { id: id } });
        if (result > 0) {
            io.emit('server:doctor_deleted', id);
            res.status(200).json({ success: true, message: "Registro eliminado." });
        } else {
            res.status(404).json({ success: false, message: "No encontrado." });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/doctors/:doctorId/visits/:visitId', async (req, res) => {
    const { doctorId, visitId } = req.params;
    try {
        await Visit.destroy({ where: { id: visitId, doctorRefId: doctorId } });
        
        const updatedDoc = await Doctor.findOne({
            where: { id: doctorId },
            include: ['visits', 'schedule']
        });
        
        io.emit('server:doctor_updated', updatedDoc);
        res.json({ success: true, result: updatedDoc });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Procedures API ---

app.get('/api/procedures', async (req, res) => {
    try {
        const procedures = await Procedure.findAll();
        res.json(procedures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/procedures', async (req, res) => {
    const data = req.body;
    try {
        const [procedure, created] = await Procedure.findOrCreate({
            where: { id: data.id },
            defaults: data
        });

        if (!created) {
            await procedure.update(data);
        }

        io.emit('server:procedure_updated', procedure);
        res.json(procedure);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/procedures/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Procedure.destroy({ where: { id: id } });
        io.emit('server:procedure_deleted', id);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SERVING STATIC FILES (PRODUCCIÓN) ---
// Sirve la carpeta 'dist' creada por Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Maneja cualquier otra ruta devolviendo index.html (para React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Port configuration
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Servidor CRM (SQL) corriendo en puerto ${PORT}`);
});
