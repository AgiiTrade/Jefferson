// Agii.ca™ © 2022. All rights reserved.
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
app.use(express.json({ limit: '2mb' }));
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
    filename TEXT,
    modernization_score INTEGER,
    issues_count INTEGER,
    request_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const safeAlter = (sql) => db.run(sql, () => {});
  safeAlter('ALTER TABLE analyses ADD COLUMN filename TEXT');
  safeAlter('ALTER TABLE analyses ADD COLUMN modernization_score INTEGER');
  safeAlter('ALTER TABLE analyses ADD COLUMN issues_count INTEGER');
  safeAlter('ALTER TABLE analyses ADD COLUMN request_id TEXT');
  safeAlter('ALTER TABLE contacts ADD COLUMN name TEXT');
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
  const lines = code.split('\n');
  const results = {
    language: 'python',
    lines: lines.length,
    characters: code.length,
    functions: [],
    classes: [],
    complexity: 'low',
    issues: [],
    suggestions: [],
    techDebt: '0.1 weeks',
    refactoringSteps: [],
    testCoverage: { estimated: 0, suggestions: [] }
  };

  // Parse functions with body size estimation
  const funcRegex = /^(\s*)def\s+(\w+)\s*\(([^)]*)\).*:/gm;
  let match;
  const funcPositions = [];
  while ((match = funcRegex.exec(code)) !== null) {
    const indent = match[1].length;
    const name = match[2];
    const params = match[3].split(',').filter(p => p.trim() && p.trim() !== 'self' && p.trim() !== 'cls').length;
    const startLine = code.substring(0, match.index).split('\n').length;
    funcPositions.push({ name, params, indent, startLine, index: match.index });
  }

  // Estimate function body sizes by finding where indentation returns to function level
  funcPositions.forEach((func, idx) => {
    const startIdx = func.startLine; // 1-based
    let bodyLines = 0;
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) { bodyLines++; continue; }
      const lineIndent = line.length - line.trimStart().length;
      if (i > startIdx && lineIndent <= func.indent && line.trim() !== '') break;
      bodyLines++;
    }
    const complexity = bodyLines > 40 ? 'high' : bodyLines > 15 ? 'medium' : 'low';
    results.functions.push({
      name: func.name,
      params: func.params,
      lines: bodyLines,
      complexity,
      startLine: func.startLine
    });
  });

  // Parse classes
  const classRegex = /^(\s*)class\s+(\w+)/gm;
  while ((match = classRegex.exec(code)) !== null) {
    results.classes.push({
      name: match[2],
      startLine: code.substring(0, match.index).split('\n').length
    });
  }

  // Issue detection
  if (code.includes('eval(')) {
    results.issues.push({ type: 'security', message: 'Use of eval() detected — potential code injection risk', line: findLineNum(code, 'eval(') });
  }
  if (code.includes('exec(')) {
    results.issues.push({ type: 'security', message: 'Use of exec() detected — dynamic code execution risk', line: findLineNum(code, 'exec(') });
  }
  if (/import\s+\*/.test(code)) {
    results.issues.push({ type: 'maintainability', message: 'Wildcard import (import *) makes dependencies unclear', line: findLineNum(code, 'import *') });
  }
  if (/except\s*:/m.test(code)) {
    results.issues.push({ type: 'error-handling', message: 'Bare except clause catches all exceptions including SystemExit and KeyboardInterrupt', line: findLineNum(code, 'except:') });
  }
  if (/except\s+Exception\s*:/m.test(code)) {
    const exceptLines = code.split('\n');
    for (let i = 0; i < exceptLines.length; i++) {
      if (/except\s+Exception\s*:/.test(exceptLines[i])) {
        const nextLine = exceptLines[i + 1]?.trim();
        if (nextLine === 'pass' || nextLine === '') {
          results.issues.push({ type: 'error-handling', message: 'Exception caught but silently ignored', line: i + 1 });
        }
      }
    }
  }
  if (/\bglobal\s+\w/.test(code)) {
    results.issues.push({ type: 'maintainability', message: 'Global variable mutation detected — harder to test and reason about', line: findLineNum(code, 'global ') });
  }

  // Complexity assessment
  const funcCount = results.functions.length;
  if (results.lines > 500 || funcCount > 20) results.complexity = 'high';
  else if (results.lines > 100 || funcCount > 8) results.complexity = 'medium';

  // Tech debt estimate
  if (results.complexity === 'high') results.techDebt = '2-4 weeks';
  else if (results.complexity === 'medium') results.techDebt = '0.5-1 week';

  // Suggestions
  if (code.includes('print(') && !code.includes('logging')) {
    results.suggestions.push('Replace print statements with the logging module for production readiness');
    results.refactoringSteps.push('1. Replace print() calls with logging.info/debug/error');
  }
  if (!code.includes('try:') && results.functions.length > 0) {
    results.suggestions.push('Add try/except blocks for error handling');
    results.refactoringSteps.push('2. Wrap I/O and external calls in try/except');
  }
  if (!code.includes('typing') && !code.includes(': str') && !code.includes(': int') && !code.includes('-> ')) {
    results.suggestions.push('Add type hints for better IDE support and maintainability');
    results.refactoringSteps.push('3. Add type annotations to function signatures');
  }
  if (results.functions.some(f => f.complexity === 'high')) {
    results.suggestions.push('Break down large functions into smaller, testable units');
    results.refactoringSteps.push('4. Extract complex logic into focused helper functions');
  }
  if (results.functions.some(f => f.params > 4)) {
    results.suggestions.push('Functions with 4+ parameters — consider a dataclass or TypedDict');
    results.refactoringSteps.push('5. Group related parameters into dataclass objects');
  }
  if (!code.includes('"""') && !code.includes("'''") && results.functions.length > 2) {
    results.suggestions.push('Add docstrings to public functions for documentation');
  }
  if (/import\s+\*/.test(code)) {
    results.suggestions.push('Replace wildcard imports with explicit imports');
  }

  // Test stubs
  results.testCoverage.suggestions = results.functions.map(f =>
    `def test_${f.name}():\n    result = ${f.name}(...)\n    assert result is not None`
  );
  results.testCoverage.estimated = Math.min(80, Math.round((results.functions.length * 15) / Math.max(1, results.lines) * 100));

  // Modernization score
  let score = 85;
  if (!code.includes('typing') && !code.includes(': str') && !code.includes(': int') && !code.includes('-> ')) score -= 10;
  if (code.includes('print(') && !code.includes('logging')) score -= 5;
  if (results.issues.length) score -= results.issues.length * 8;
  if (results.complexity === 'high') score -= 10;
  if (results.functions.some(f => f.complexity === 'high')) score -= 10;
  if (/import\s+\*/.test(code)) score -= 5;
  results.modernizationScore = Math.max(0, Math.min(100, score));

  return results;
}

function findLineNum(code, needle) {
  const idx = code.indexOf(needle);
  if (idx === -1) return null;
  return code.substring(0, idx).split('\n').length;
}

function analyzeCobol(code) {
  const lines = code.split('\n');
  const upper = code.toUpperCase();
  const paragraphMatches = [...upper.matchAll(/^\s*(\d{4}-[A-Z0-9-]+|[A-Z0-9-]+)\.\s*$/gm)];
  const paragraphs = paragraphMatches.map(m => ({
    name: m[1],
    params: 0,
    lines: 0,
    complexity: 'medium',
    startLine: upper.substring(0, m.index).split('\n').length
  }));

  const issues = [];
  const suggestions = [];
  const refactoringSteps = [];

  if (upper.includes('GO TO ')) {
    issues.push({ type: 'control-flow', message: 'GO TO detected, which makes flow harder to modernize and test', line: findLineNum(upper, 'GO TO ') });
    suggestions.push('Replace GO TO driven branching with structured PERFORM blocks or extracted procedures.');
    refactoringSteps.push('Identify GO TO paths and convert them into structured control flow.');
  }
  if (upper.includes('ALTER ')) {
    issues.push({ type: 'control-flow', message: 'ALTER detected, which is risky in legacy COBOL systems', line: findLineNum(upper, 'ALTER ') });
    suggestions.push('Remove ALTER statements and make control flow explicit.');
  }
  if (upper.includes('FILE SECTION') && upper.includes('WRITE ') && !upper.includes('INVALID KEY')) {
    suggestions.push('Add stronger file I/O validation and explicit error handling around READ/WRITE operations.');
  }
  if (upper.includes('EVALUATE ') === false && upper.includes('IF ')) {
    suggestions.push('Consider consolidating repeated IF chains with EVALUATE blocks where business rules allow.');
  }
  if (upper.includes('WORKING-STORAGE SECTION') && upper.includes('PIC X(')) {
    suggestions.push('Document copybook-style record layouts and map fields into typed service/domain models during modernization.');
  }
  if (upper.includes('PROCEDURE DIVISION')) {
    refactoringSteps.push('Separate file handling, validation, payroll calculation, and reporting into discrete services or modules.');
    refactoringSteps.push('Create characterization tests around payroll rules before refactoring legacy logic.');
    refactoringSteps.push('Map PIC-based records into typed DTOs or schemas for the target platform.');
  }

  const complexity = lines.length > 220 || paragraphs.length > 12 ? 'high' : lines.length > 90 || paragraphs.length > 5 ? 'medium' : 'low';
  const scorePenalty = (upper.includes('GO TO ') ? 15 : 0) + (issues.length * 8) + (complexity === 'high' ? 10 : complexity === 'medium' ? 4 : 0);

  return {
    language: 'cobol',
    lines: lines.length,
    characters: code.length,
    functions: paragraphs,
    complexity,
    issues,
    suggestions: suggestions.length ? suggestions : ['Start by preserving business rules with characterization tests before translating COBOL logic.'],
    techDebt: complexity === 'high' ? '3-6 weeks' : complexity === 'medium' ? '1-3 weeks' : '3-5 days',
    refactoringSteps,
    testCoverage: {
      estimated: Math.min(70, Math.max(20, paragraphs.length * 8)),
      suggestions: [
        'Build regression tests for payroll calculations, overtime rules, bonuses, and tax-code handling.',
        'Create golden-file tests for input records, output records, and error-file generation.',
        'Verify leave-status, max-hours, and invalid master-data scenarios before refactoring.'
      ]
    },
    modernizationScore: Math.max(25, 78 - scorePenalty)
  };
}

function analyzeGeneric(code) {
  return {
    language: 'unknown',
    lines: code.split('\n').length,
    characters: code.length,
    functions: [],
    complexity: code.split('\n').length > 200 ? 'high' : 'medium',
    issues: [],
    suggestions: ['Language-specific analysis available for JavaScript, Python, and COBOL'],
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
    language: Joi.string().valid('javascript', 'python', 'cobol', 'auto').default('auto'),
    filename: Joi.string().max(255).allow('').default('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { code, language, filename } = value;

  // Detect language
  let detectedLang = language;
  if (language === 'auto') {
    const upper = code.toUpperCase();
    if (upper.includes('IDENTIFICATION DIVISION') || upper.includes('PROCEDURE DIVISION') || upper.includes('WORKING-STORAGE SECTION') || upper.includes('ENVIRONMENT DIVISION')) {
      detectedLang = 'cobol';
    } else if (code.includes('function ') || code.includes('=>') || code.includes('const ') || code.includes('let ') || code.includes('var ')) {
      detectedLang = 'javascript';
    } else if (code.includes('def ') || (code.includes('import ') && code.includes(':'))) {
      detectedLang = 'python';
    }
  }

  let results;
  switch (detectedLang) {
    case 'javascript': results = analyzeJavaScript(code); break;
    case 'python': results = analyzePython(code); break;
    case 'cobol': results = analyzeCobol(code); break;
    default: results = analyzeGeneric(code);
  }

  results.timestamp = new Date().toISOString();
  results.requestId = Date.now().toString(36);

  // Save to DB (anon)
  db.run('INSERT INTO analyses (language, lines, complexity, functions, suggestions, raw_code, filename, modernization_score, issues_count, request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      results.language,
      results.lines,
      results.complexity,
      results.functions.length,
      JSON.stringify(results.suggestions),
      code.substring(0, 5000),
      filename || '',
      results.modernizationScore || null,
      Array.isArray(results.issues) ? results.issues.length : 0,
      results.requestId
    ]
  );

  res.json(results);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
  const schema = Joi.object({
    name: Joi.string().max(200).allow('').default(''),
    email: Joi.string().email().required(),
    message: Joi.string().max(5000).allow('')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  db.run('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [value.name || '', value.email, value.message || ''], function (err) {
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
  db.get('SELECT COUNT(*) as totalAnalyses, AVG(modernization_score) as avgScore FROM analyses', (err, row) => {
    db.get('SELECT COUNT(*) as totalUsers FROM users', (err2, row2) => {
      db.get('SELECT COUNT(*) as totalContacts FROM contacts', (err3, row3) => {
        res.json({
          totalAnalyses: row?.totalAnalyses || 0,
          totalUsers: row2?.totalUsers || 0,
          totalContacts: row3?.totalContacts || 0,
          avgModernizationScore: row?.avgScore ? Math.round(row.avgScore) : null,
          languagesSupported: ['JavaScript', 'Python', 'COBOL'],
          uptime: Math.round(process.uptime())
        });
      });
    });
  });
});

app.get('/api/recent-analyses', (req, res) => {
  db.all('SELECT id, language, filename, lines, complexity, modernization_score, issues_count, created_at FROM analyses ORDER BY created_at DESC LIMIT 8', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ analyses: rows || [] });
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
