require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const sqlite3 = require('sqlite3').verbose();
const acorn = require('acorn');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3100;
const JWT_SECRET = process.env.JWT_SECRET || 'agii-modernizer-secret-change-me';

// ── Middleware ──────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Database Setup ─────────────────────────────────────────
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    language TEXT,
    lines INTEGER,
    complexity TEXT,
    functions INTEGER,
    suggestions TEXT,
    raw_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ── Auth Middleware ─────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Code Analysis Engine ───────────────────────────────────
function analyzeJavaScript(code) {
  const results = {
    language: 'javascript',
    lines: code.split('\n').length,
    characters: code.length,
    functions: [],
    complexity: 'low',
    issues: [],
    suggestions: [],
    techDebt: '0.1 weeks',
    refactoringSteps: [],
    testCoverage: { estimated: 0, suggestions: [] }
  };

  // Parse AST with Acorn
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });
    
    // Walk AST to find functions
    function walk(node, depth = 0) {
      if (!node || typeof node !== 'object') return;
      
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        const name = node.id?.name || '(anonymous)';
        const params = node.params?.length || 0;
        const bodyLines = node.body?.loc ? (node.body.loc.end.line - node.body.loc.start.line + 1) : 0;
        
        results.functions.push({
          name,
          params,
          lines: bodyLines,
          complexity: bodyLines > 50 ? 'high' : bodyLines > 20 ? 'medium' : 'low',
          startLine: node.loc?.start?.line || 0
        });
      }

      // Detect issues
      if (node.type === 'CallExpression' && node.callee?.name === 'eval') {
        results.issues.push({ type: 'security', message: 'Use of eval() detected — potential security risk', line: node.loc?.start?.line });
      }
      if (node.type === 'CatchClause' && !node.body.body?.length) {
        results.issues.push({ type: 'error-handling', message: 'Empty catch block — errors may be silently swallowed', line: node.loc?.start?.line });
      }

      for (const key in node) {
        if (key === 'loc' || key === 'start' || key === 'end') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(c => walk(c, depth + 1));
        else if (child && typeof child === 'object' && child.type) walk(child, depth + 1);
      }
    }
    walk(ast);
  } catch (e) {
    results.issues.push({ type: 'syntax', message: `Parse error: ${e.message}` });
  }

  // Complexity assessment
  const totalLines = results.lines;
  const funcCount = results.functions.length;
  if (totalLines > 500 || funcCount > 20) results.complexity = 'high';
  else if (totalLines > 100 || funcCount > 8) results.complexity = 'medium';

  // Tech debt estimate
  if (results.complexity === 'high') results.techDebt = '2-4 weeks';
  else if (results.complexity === 'medium') results.techDebt = '0.5-1 week';

  // Suggestions
  if (results.functions.some(f => f.complexity === 'high')) {
    results.suggestions.push('Break down large functions into smaller, testable units');
    results.refactoringSteps.push('1. Extract complex logic into service modules');
  }
  if (results.functions.some(f => f.params > 4)) {
    results.suggestions.push('Functions with 4+ parameters — consider using an options object');
    results.refactoringSteps.push('2. Consolidate parameters into configuration objects');
  }
  if (code.includes('var ')) {
    results.suggestions.push('Replace var with const/let for block scoping');
    results.refactoringSteps.push('3. Migrate var declarations to const/let');
  }
  if (!code.includes('try') && !code.includes('catch') && results.functions.length > 0) {
    results.suggestions.push('Add error handling with try/catch blocks');
  }
  if (!code.includes('test') && !code.includes('describe') && !code.includes('it(')) {
    results.suggestions.push('Add unit tests — aim for 80%+ coverage');
    results.testCoverage.suggestions.push('Write tests for each exported function');
    results.testCoverage.estimated = 0;
  }

  // Generate test stubs
  results.testCoverage.suggestions = results.functions.map(f => 
    `describe('${f.name}', () => { it('should handle valid input', () => { /* test */ }); });`
  );
  results.testCoverage.estimated = Math.min(80, Math.round((results.functions.length * 15) / Math.max(1, results.lines) * 100));

  // Modernization score (0-100)
  let score = 80;
  if (code.includes('var ')) score -= 15;
  if (results.issues.length) score -= results.issues.length * 10;
  if (results.complexity === 'high') score -= 10;
  if (results.functions.some(f => f.complexity === 'high')) score -= 10;
  results.modernizationScore = Math.max(0, score);

  return results;
}

function analyzePython(code) {
  const results = {
    language: 'python',
    lines: code.split('\n').length,
    characters: code.length,
    functions: [],
    complexity: 'low',
    issues: [],
    suggestions: [],
    techDebt: '0.1 weeks',
    refactoringSteps: [],
    testCoverage: { estimated: 0, suggestions: [] }
  };

  const funcRegex = /^(\s*)def\s+(\w+)\s*\(([^)]*)\):/gm;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const name = match[2];
    const params = match[3].split(',').filter(p => p.trim()).length;
    results.functions.push({ name, params, complexity: 'low', startLine: code.substring(0, match.index).split('\n').length });
  }

  if (code.includes('print(') && !code.includes('logging')) {
    results.suggestions.push('Replace print statements with proper logging (Python logging module)');
  }
  if (!code.includes('try:') && results.functions.length > 0) {
    results.suggestions.push('Add try/except blocks for error handling');
  }

  results.testCoverage.suggestions = results.functions.map(f => 
    `def test_${f.name}(): assert ${f.name}(/* valid input */) is not None`
  );

  let score = 85;
  if (!code.includes('typing') && !code.includes(': str') && !code.includes(': int')) score -= 10;
  if (code.includes('print(')) score -= 5;
  results.modernizationScore = Math.max(0, score);

  return results;
}

function analyzeGeneric(code) {
  return {
    language: 'unknown',
    lines: code.split('\n').length,
    characters: code.length,
    complexity: code.split('\n').length > 200 ? 'high' : 'medium',
    issues: [],
    suggestions: ['Language-specific analysis available for JavaScript and Python'],
    techDebt: 'Unknown — manual review recommended',
    refactoringSteps: ['1. Identify language and framework', '2. Run linter for style issues', '3. Extract business logic into services'],
    testCoverage: { estimated: 0, suggestions: ['Add language-appropriate test framework'] },
    modernizationScore: 50
  };
}

// ── API Routes ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Analyze code (public — no auth needed for demo)
app.post('/api/analyze', (req, res) => {
  const schema = Joi.object({
    code: Joi.string().min(1).max(100000).required(),
    language: Joi.string().valid('javascript', 'python', 'auto').default('auto')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { code, language } = value;

  // Detect language
  let detectedLang = language;
  if (language === 'auto') {
    if (code.includes('function ') || code.includes('=>') || code.includes('const ') || code.includes('let ') || code.includes('var ')) {
      detectedLang = 'javascript';
    } else if (code.includes('def ') || code.includes('import ') && code.includes(':')) {
      detectedLang = 'python';
    }
  }

  let results;
  switch (detectedLang) {
    case 'javascript': results = analyzeJavaScript(code); break;
    case 'python': results = analyzePython(code); break;
    default: results = analyzeGeneric(code);
  }

  results.timestamp = new Date().toISOString();
  results.requestId = Date.now().toString(36);

  // Save to DB (anon)
  db.run('INSERT INTO analyses (language, lines, complexity, functions, suggestions, raw_code) VALUES (?, ?, ?, ?, ?, ?)',
    [results.language, results.lines, results.complexity, results.functions.length, JSON.stringify(results.suggestions), code.substring(0, 5000)]
  );

  res.json(results);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    message: Joi.string().max(5000).allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  db.run('INSERT INTO contacts (email, message) VALUES (?, ?)', [value.email, value.message || ''], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true, id: this.lastID });
  });
});

// Register
app.post('/api/register', async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    company: Joi.string().max(200).allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const hash = await bcrypt.hash(value.password, 12);
    db.run('INSERT INTO users (email, password, company) VALUES (?, ?, ?)',
      [value.email, hash, value.company || ''],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
          return res.status(500).json({ error: 'Database error' });
        }
        const token = jwt.sign({ id: this.lastID, email: value.email }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token });
      }
    );
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  db.get('SELECT * FROM users WHERE email = ?', [value.email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(value.password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, company: user.company } });
  });
});

// Get user's analysis history (auth required)
app.get('/api/history', authMiddleware, (req, res) => {
  db.all('SELECT id, language, lines, complexity, functions, suggestions, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ analyses: rows });
    }
  );
});

// Stats (public)
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as totalAnalyses FROM analyses', (err, row) => {
    db.get('SELECT COUNT(*) as totalUsers FROM users', (err2, row2) => {
      res.json({
        totalAnalyses: row?.totalAnalyses || 0,
        totalUsers: row2?.totalUsers || 0,
        languagesSupported: ['JavaScript', 'Python'],
        uptime: Math.round(process.uptime())
      });
    });
  });
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Agii Intelligence Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   POST /api/analyze   — Analyze code`);
  console.log(`   POST /api/contact   — Submit contact form`);
  console.log(`   POST /api/register  — Create account`);
  console.log(`   POST /api/login     — Authenticate`);
  console.log(`   GET  /api/history   — Analysis history (auth)`);
  console.log(`   GET  /api/stats     — Platform statistics`);
  console.log(`   GET  /api/health    — Health check\n`);
});
