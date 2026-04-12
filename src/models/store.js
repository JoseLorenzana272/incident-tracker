const bcrypt = require('bcryptjs');

// In-memory store — no DB needed for demo
const store = {
  users: [],
  incidents: [],
  auditLog: [],
  nextId: { user: 1, incident: 1 },
};

// Seed: two users (admin + reporter)
async function seedData() {
  const adminHash    = await bcrypt.hash('Admin@12345', 10);
  const reporterHash = await bcrypt.hash('Reporter@1', 10);

  store.users.push(
    { id: 1, username: 'admin',    email: 'admin@ngo.org',    password: adminHash,    role: 'admin',    createdAt: new Date() },
    { id: 2, username: 'reporter', email: 'maria@ngo.org',    password: reporterHash, role: 'reporter', createdAt: new Date() },
  );

  store.incidents.push(
    {
      id: 1,
      title: 'Vigilancia en frontera norte',
      description: 'Activistas reportan presencia de agentes en zona de tránsito',
      location: 'Frontera norte, km 42',
      severity: 'high',
      status: 'open',
      reportedBy: 2,
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
    },
    {
      id: 2,
      title: 'Acceso a internet bloqueado',
      description: 'Se detectó bloqueo de señal de red en zona rural',
      location: 'Municipio X, área rural',
      severity: 'medium',
      status: 'under_review',
      reportedBy: 2,
      createdAt: new Date('2025-06-03'),
      updatedAt: new Date('2025-06-04'),
    },
  );

  store.nextId.user = 3;
  store.nextId.incident = 3;
}

seedData().catch(console.error);

module.exports = store;
