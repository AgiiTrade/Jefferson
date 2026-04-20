const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const Joi = require('joi');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3210);
const db = new sqlite3.Database(path.join(__dirname, 'scrum-board.db'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve({ lastID: this.lastID, changes: this.changes });
  });
});
const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

const baseTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000).default(''),
  dueDate: Joi.string().allow('').max(20).default(''),
  priority: Joi.string().valid('high', 'medium', 'low').default('medium'),
  status: Joi.string().valid('todo', 'in-progress', 'done').default('todo'),
  category: Joi.string().min(1).max(100).required(),
  assignedUsers: Joi.array().items(Joi.string().max(100)).default([]),
  subtasks: Joi.array().items(Joi.object({
    id: Joi.string().max(100).required(),
    text: Joi.string().max(500).required(),
    done: Joi.boolean().default(false)
  })).default([]),
  notes: Joi.array().items(Joi.object({
    id: Joi.string().max(100).required(),
    text: Joi.string().max(2000).required(),
    createdAt: Joi.string().max(100).allow('').default('')
  })).default([]),
  tags: Joi.array().items(Joi.string().max(100)).default([]),
  createdAt: Joi.string().allow('').max(100).default('')
});

const eventSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000).default(''),
  date: Joi.string().min(1).max(20).required(),
  time: Joi.string().allow('').max(20).default(''),
  location: Joi.string().allow('').max(300).default(''),
  assignedUsers: Joi.array().items(Joi.string().max(100)).default([]),
  createdAt: Joi.string().allow('').max(100).default('')
});

const userSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  email: Joi.string().email().allow('').default(''),
  color: Joi.string().max(30).allow('').default('')
});

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  icon: Joi.string().max(20).allow('').default('🗂'),
  color: Joi.string().max(30).allow('').default('#1D4ED8'),
  bg: Joi.string().max(30).allow('').default('#DBEAFE')
});

function mapTask(row) {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description || '',
    dueDate: row.due_date || '',
    priority: row.priority,
    status: row.status,
    category: row.category,
    assignedUsers: parseJson(row.assigned_users, []),
    subtasks: parseJson(row.subtasks, []),
    notes: parseJson(row.notes, []),
    tags: parseJson(row.tags, []),
    createdAt: row.created_at || ''
  };
}

function mapEvent(row) {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description || '',
    date: row.event_date,
    time: row.event_time || '',
    location: row.location || '',
    assignedUsers: parseJson(row.assigned_users, []),
    createdAt: row.created_at || ''
  };
}

function mapUser(row) {
  return { id: String(row.id), name: row.name, email: row.email || '', color: row.color || '' };
}

function mapCategory(row) {
  return { id: String(row.id), name: row.name, icon: row.icon || '🗂', color: row.color || '#1D4ED8', bg: row.bg || '#DBEAFE' };
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    bg TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT,
    status TEXT,
    category TEXT,
    assigned_users TEXT,
    subtasks TEXT,
    notes TEXT,
    tags TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT,
    assigned_users TEXT,
    created_at TEXT
  )`);
});

app.get('/api/health', async (req, res) => {
  const row = await get('SELECT COUNT(*) as taskCount FROM tasks');
  res.json({ status: 'ok', taskCount: row?.taskCount || 0, timestamp: new Date().toISOString() });
});

app.get('/api/summary', async (req, res, next) => {
  try {
    const [taskStats, eventStats, userStats] = await Promise.all([
      all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status'),
      get('SELECT COUNT(*) as count FROM events'),
      get('SELECT COUNT(*) as count FROM users')
    ]);
    const summary = { todo: 0, inProgress: 0, done: 0 };
    for (const row of taskStats) {
      if (row.status === 'todo') summary.todo = row.count;
      if (row.status === 'in-progress') summary.inProgress = row.count;
      if (row.status === 'done') summary.done = row.count;
    }
    res.json({
      tasks: summary,
      events: eventStats?.count || 0,
      users: userStats?.count || 0
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/tasks', async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM tasks ORDER BY id DESC');
    res.json({ tasks: rows.map(mapTask) });
  } catch (err) {
    next(err);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const value = await baseTaskSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const result = await run(
      `INSERT INTO tasks (title, description, due_date, priority, status, category, assigned_users, subtasks, notes, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        value.title,
        value.description,
        value.dueDate,
        value.priority,
        value.status,
        value.category,
        JSON.stringify(value.assignedUsers),
        JSON.stringify(value.subtasks),
        JSON.stringify(value.notes),
        JSON.stringify(value.tags),
        value.createdAt || new Date().toISOString()
      ]
    );
    const created = await get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    res.status(201).json({ task: mapTask(created) });
  } catch (err) { next(err); }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const value = await baseTaskSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    await run(
      `UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, category = ?, assigned_users = ?, subtasks = ?, notes = ?, tags = ? WHERE id = ?`,
      [
        value.title,
        value.description,
        value.dueDate,
        value.priority,
        value.status,
        value.category,
        JSON.stringify(value.assignedUsers),
        JSON.stringify(value.subtasks),
        JSON.stringify(value.notes),
        JSON.stringify(value.tags),
        req.params.id
      ]
    );
    const updated = await get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: mapTask(updated) });
  } catch (err) { next(err); }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

app.get('/api/events', async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM events ORDER BY event_date ASC, event_time ASC');
    res.json({ events: rows.map(mapEvent) });
  } catch (err) { next(err); }
});

app.post('/api/events', async (req, res, next) => {
  try {
    const value = await eventSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const result = await run(
      `INSERT INTO events (title, description, event_date, event_time, location, assigned_users, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [value.title, value.description, value.date, value.time, value.location, JSON.stringify(value.assignedUsers), value.createdAt || new Date().toISOString()]
    );
    const created = await get('SELECT * FROM events WHERE id = ?', [result.lastID]);
    res.status(201).json({ event: mapEvent(created) });
  } catch (err) { next(err); }
});

app.put('/api/events/:id', async (req, res, next) => {
  try {
    const value = await eventSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    await run(
      `UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ?, location = ?, assigned_users = ? WHERE id = ?`,
      [value.title, value.description, value.date, value.time, value.location, JSON.stringify(value.assignedUsers), req.params.id]
    );
    const updated = await get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json({ event: mapEvent(updated) });
  } catch (err) { next(err); }
});

app.delete('/api/events/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

app.get('/api/users', async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM users ORDER BY name ASC');
    res.json({ users: rows.map(mapUser) });
  } catch (err) { next(err); }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const value = await userSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const result = await run('INSERT INTO users (name, email, color) VALUES (?, ?, ?)', [value.name, value.email, value.color]);
    const created = await get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json({ user: mapUser(created) });
  } catch (err) { next(err); }
});

app.put('/api/users/:id', async (req, res, next) => {
  try {
    const value = await userSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    await run('UPDATE users SET name = ?, email = ?, color = ? WHERE id = ?', [value.name, value.email, value.color, req.params.id]);
    const updated = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: mapUser(updated) });
  } catch (err) { next(err); }
});

app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

app.get('/api/categories', async (req, res, next) => {
  try {
    const rows = await all('SELECT * FROM categories ORDER BY name ASC');
    res.json({ categories: rows.map(mapCategory) });
  } catch (err) { next(err); }
});

app.post('/api/categories', async (req, res, next) => {
  try {
    const value = await categorySchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    const result = await run('INSERT INTO categories (name, icon, color, bg) VALUES (?, ?, ?, ?)', [value.name, value.icon, value.color, value.bg]);
    const created = await get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json({ category: mapCategory(created) });
  } catch (err) { next(err); }
});

app.put('/api/categories/:id', async (req, res, next) => {
  try {
    const value = await categorySchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    await run('UPDATE categories SET name = ?, icon = ?, color = ?, bg = ? WHERE id = ?', [value.name, value.icon, value.color, value.bg, req.params.id]);
    const updated = await get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: mapCategory(updated) });
  } catch (err) { next(err); }
});

app.delete('/api/categories/:id', async (req, res, next) => {
  try {
    const result = await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  if (err?.isJoi) {
    return res.status(400).json({ error: 'Validation failed', details: err.details.map(d => d.message) });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Scrum Board backend running on http://localhost:${PORT}`);
});
