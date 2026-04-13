// Carga las variables del archivo .env localmente para que los tests pasen
require('dotenv').config();

process.env.ADMIN_SECRET   = 'test-admin-secret';
process.env.NODE_ENV       = 'test';

const request = require('supertest');
const app     = require('../src/app');

beforeAll(() => new Promise((resolve) => setTimeout(resolve, 120)));

async function loginAs(email, password) {
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token;
}

describe('API demo tests (nivel introductorio)', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /auth/login funciona con usuario seed', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'maria@ngo.org',
      password: 'Reporter@1',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('GET /incidents sin token devuelve 401', async () => {
    const res = await request(app).get('/incidents');
    expect(res.status).toBe(401);
  });

  it('POST /incidents con reporter crea incidente', async () => {
    const token = await loginAs('maria@ngo.org', 'Reporter@1');

    const res = await request(app)
      .post('/incidents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Incidente demo',
        description: 'Caso de prueba para clase',
        location: 'Campus',
        severity: 'medium',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Incidente demo');
  });

  it('PUT /incidents/:id/status bloquea reporter (403)', async () => {
    const token = await loginAs('maria@ngo.org', 'Reporter@1');

    const res = await request(app)
      .put('/incidents/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
  });
});
