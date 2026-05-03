const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

let request;

// If DB credentials are not provided, skip integration tests and instruct the user.
if (!process.env.DB_USER || process.env.DB_USER === '') {
  test('Skipping integration tests (no DB credentials)', () => {
    console.warn('Integration tests skipped: set DB_HOST, DB_USER, DB_PASSWORD in environment or .env to run them.');
  });
} else {

  beforeAll(async () => {
    process.env.DB_NAME = 'mini_crm_test';
    process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
    process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'change-me';

    // create test database from schema.sql (replace DB name)
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');
    sql = sql.replace(/mini_crm/g, 'mini_crm_test');

    const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true });
    await conn.query(sql);
    await conn.end();

    // require app after DB is created
    const app = require('../app');
    request = require('supertest')(app);
  });

  afterAll(async () => {
    const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true });
    await conn.query('DROP DATABASE IF EXISTS mini_crm_test');
    await conn.end();
  });

  test('Full CRUD flow: leads & notes', async () => {
    // login to get token
    const login = await request.post('/auth/login').send({ username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS });
    expect(login.statusCode).toBe(200);
    const token = login.body.token;

    // create lead
    const create = await request.post('/leads').set('Authorization', `Bearer ${token}`).send({ name: 'Test Lead', email: 'test@example.com', source: 'form' });
    expect(create.statusCode).toBe(201);
    const lead = create.body;
    expect(lead).toHaveProperty('id');

    // get leads
    const list = await request.get('/leads');
    expect(list.statusCode).toBe(200);
    expect(list.body.some(l => l.id === lead.id)).toBe(true);

    // update status
    const upd = await request.put(`/leads/${lead.id}`).set('Authorization', `Bearer ${token}`).send({ status: 'contacted' });
    expect(upd.statusCode).toBe(200);
    expect(upd.body.status).toBe('contacted');

    // add note
    const note = await request.post('/notes').set('Authorization', `Bearer ${token}`).send({ lead_id: lead.id, note: 'Follow up tomorrow' });
    expect(note.statusCode).toBe(201);

    // get notes
    const notes = await request.get(`/notes/${lead.id}`);
    expect(notes.statusCode).toBe(200);
    expect(notes.body.length).toBeGreaterThan(0);

    // delete lead
    const del = await request.delete(`/leads/${lead.id}`).set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);

    const list2 = await request.get('/leads');
    expect(list2.body.some(l => l.id === lead.id)).toBe(false);
  });

}
