process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-please-change';
process.env.DB_PATH = require('path').join(__dirname, 'test-data.db');
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.ANALYZE_RATE_LIMIT_MAX = '100';
process.env.CONTACT_RATE_LIMIT_MAX = '100';
process.env.AUTH_RATE_LIMIT_MAX = '100';
process.env.HEALTHCHECK_TIMEOUT_MS = '1000';

const fs = require('fs');
const path = require('path');
const request = require('supertest');

const dbPath = process.env.DB_PATH;
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const { app, db } = require('../server');

afterAll((done) => {
  db.close(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    done();
  });
});

describe('AI Modernizer backend', () => {
  test('health endpoint works', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.environment).toBe('test');
    expect(res.body.database.status).toBe('ok');
    expect(res.body.database.path).toBeTruthy();
    expect(res.body.memory.heapUsed).toBeGreaterThan(0);
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  test('ready endpoint works', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database.status).toBe('ok');
  });

  test('ops endpoint works', async () => {
    const res = await request(app).get('/api/ops');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.traffic.accessLogEnabled).toBe(true);
    expect(res.body.totals).toBeTruthy();
  });

  test('analyze endpoint returns JS analysis', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ code: 'function add(a,b){ return a+b; }', language: 'javascript', filename: 'sample.js' });
    expect(res.statusCode).toBe(200);
    expect(res.body.language).toBe('javascript');
    expect(Array.isArray(res.body.functions)).toBe(true);
  });

  test('contact endpoint accepts valid payload', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Arfeen', email: 'arfeen@example.com', message: 'Need a modernization review' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('register and login flow works', async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = 'StrongPass123!';

    const register = await request(app)
      .post('/api/register')
      .send({ email, password, company: 'Agii' });
    expect(register.statusCode).toBe(200);
    expect(register.body.token).toBeTruthy();

    const login = await request(app)
      .post('/api/login')
      .send({ email, password });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
    expect(login.body.user.email).toBe(email);
  });

  test('history endpoint requires auth', async () => {
    const res = await request(app).get('/api/history');
    expect(res.statusCode).toBe(401);
  });

  test('stats endpoint responds', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.languagesSupported)).toBe(true);
  });

  test('analyze endpoint validates payload size and required code', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ code: '', language: 'javascript' });
    expect(res.statusCode).toBe(400);
  });
});
