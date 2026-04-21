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
const PORT = Number(process.env.PORT || 3100);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const DEFAULT_JWT_SECRET = 'agii-modernizer-secret-change-me';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(v => v.trim())
  .filter(Boolean);
const ANALYZE_RATE_LIMIT_MAX = Number(process.env.ANALYZE_RATE_LIMIT_MAX || 25);
const CONTACT_RATE_LIMIT_MAX = Number(process.env.CONTACT_RATE_LIMIT_MAX || 10);
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || 12);
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitBuckets = new Map();
let server;

if (IS_PROD && JWT_SECRET === DEFAULT_JWT_SECRET) {
  console.error('Refusing to start in production with the default JWT secret. Set JWT_SECRET.');
  process.exit(1);
}

app.set('trust proxy', 1);

function getClientKey(req) {
  return (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
}

function makeRateLimiter(bucketName, maxRequests) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${bucketName}:${getClientKey(req)}`;
    const bucket = rateLimitBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }
    if (bucket.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Rate limit exceeded. Please retry later.' });
    }
    bucket.count += 1;
    return next();
  };
}

function cleanupRateLimitBuckets() {
  const now = Date.now();
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}
setInterval(cleanupRateLimitBuckets, 5 * 60 * 1000).unref();

// ── Middleware ──────────────────────────────────────────────
app.use((req, res, next) => {
  req.requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  res.set('X-Request-Id', req.requestId);
  next();
});
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || !ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Database Setup ─────────────────────────────────────────
const db = new sqlite3.Database(DB_PATH);

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

function analyzeEnterpriseLegacy(code, language) {
  const lines = code.split('\n');
  const upper = code.toUpperCase();
  const extractors = {
    java: /(?:public|private|protected)?\s*(?:static\s+)?[A-Za-z0-9_<>,\[\]]+\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    csharp: /(?:public|private|protected|internal)?\s*(?:static\s+)?[A-Za-z0-9_<>,\[\]?]+\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    vb: /(?:Public|Private|Protected|Friend)?\s*(?:Shared\s+)?(?:Function|Sub)\s+(\w+)\s*\(([^)]*)\)/gi,
    sql: /\b(PROCEDURE|FUNCTION|TRIGGER|PACKAGE)\s+([A-Z0-9_]+)/gi,
    plsql: /\b(PROCEDURE|FUNCTION|TRIGGER|PACKAGE)\s+([A-Z0-9_]+)/gi,
    rpg: /^\s*([A-Z0-9_]+)\s+BEGSR\b/gim,
    natural: /^\s*DEFINE\s+SUBROUTINE\s+([A-Z0-9-]+)/gim,
    adabas: /^\s*DEFINE\s+DATA\s+/gim,
    powerbuilder: /(?:public|private|protected)?\s*(?:function|subroutine)\s+(\w+)\s*\(([^)]*)\)/gi,
    siebel: /function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)|\bBusComp_([A-Za-z0-9_]+)\b|\bApplet_([A-Za-z0-9_]+)\b/gi,
    curam: /(?:class|interface)\s+([A-Za-z0-9_]+)|\bCER_[A-Za-z0-9_]+\b|\bcuram\.[A-Za-z0-9_.]+/gi,
    delphi: /(?:procedure|function)\s+(\w+)\s*\(([^)]*)\)/gi,
    classicasp: /(?:sub|function)\s+(\w+)\s*\(([^)]*)\)/gi,
    perl: /^\s*sub\s+(\w+)/gm,
    jcl: /^\s*\/\/([A-Z0-9#$@]+)\s+(JOB|EXEC|DD)\b/gim,
    copybook: /^\s*\d{2}\s+([A-Z0-9-]+)\s+PIC\s+/gim,
  };
  const regex = extractors[language] || extractors.java;
  const functions = [...code.matchAll(regex)].map(m => ({
    name: m[1] && ['PROCEDURE', 'FUNCTION', 'TRIGGER', 'PACKAGE'].includes(String(m[1]).toUpperCase()) ? m[2] : (m[1] || m[2] || '(anonymous)'),
    params: m[2] && !['PROCEDURE', 'FUNCTION', 'TRIGGER', 'PACKAGE'].includes(String(m[1]).toUpperCase()) ? m[2].split(',').filter(Boolean).length : 0,
    lines: 0,
    complexity: 'medium',
    startLine: code.substring(0, m.index).split('\n').length
  }));

  const issues = [];
  const suggestions = [];
  const refactoringSteps = [];

  if (language === 'java' && upper.includes('SYSTEM.OUT.PRINT')) suggestions.push('Replace System.out printing with structured logging and observability.');
  if (language === 'java' && upper.includes('VECTOR<')) suggestions.push('Replace legacy collection types with modern typed collections where safe.');
  if (language === 'csharp' && upper.includes('DATASET')) suggestions.push('Untangle DataSet-heavy flows into typed domain models and repository/services.');
  if (language === 'csharp' && upper.includes('CATCH (EXCEPTION')) issues.push({ type: 'error-handling', message: 'Broad exception handling detected, review swallowed or over-generalized failures', line: findLineNum(upper, 'CATCH (EXCEPTION') });
  if (language === 'vb' && upper.includes('ON ERROR RESUME NEXT')) {
    issues.push({ type: 'error-handling', message: 'On Error Resume Next detected, which hides failures in legacy VB code', line: findLineNum(upper, 'ON ERROR RESUME NEXT') });
    suggestions.push('Replace On Error Resume Next with explicit Try/Catch and typed error paths.');
  }
  if ((language === 'sql' || language === 'plsql') && upper.includes('CURSOR ')) suggestions.push('Review cursor-heavy flows for set-based rewrites or service extraction opportunities.');
  if ((language === 'sql' || language === 'plsql') && upper.includes('EXCEPTION') === false) suggestions.push('Add explicit exception handling and logging around critical stored logic.');
  if (language === 'rpg' && upper.includes('GOTO')) {
    issues.push({ type: 'control-flow', message: 'GOTO detected in RPG logic, which increases modernization risk', line: findLineNum(upper, 'GOTO') });
    suggestions.push('Replace GOTO-driven flows with structured subroutines or procedures before deeper translation.');
  }
  if (language === 'natural') {
    suggestions.push('Map Natural programs and subroutines into service boundaries before rewriting logic.');
    if (upper.includes('ESCAPE ROUTINE') || upper.includes('ESCAPE TOP')) issues.push({ type: 'control-flow', message: 'Natural ESCAPE flow detected, review branch-heavy logic carefully', line: findLineNum(upper, 'ESCAPE ') });
  }
  if (language === 'adabas') suggestions.push('Document Adabas file access patterns and data relationships before migration.');
  if (language === 'powerbuilder') suggestions.push('Separate PowerBuilder UI/event logic from business rules before service extraction.');
  if (language === 'siebel') {
    suggestions.push('Map Siebel business components, applets, and workflows into target CRM or service boundaries before rewriting.');
    suggestions.push('Evaluate whether the best target is Salesforce, Java/Spring, or .NET instead of doing a literal line-by-line translation.');
    refactoringSteps.push('Extract Siebel script rules, workflow logic, and integration objects into an explicit target architecture.');
  }
  if (language === 'curam') {
    suggestions.push('Separate IBM Cúram rules, evidence flows, and case-management logic before choosing a target platform.');
    suggestions.push('Assess whether Java/Spring, Salesforce, or .NET is the right landing zone based on case management and integration needs.');
    refactoringSteps.push('Inventory CER rules, case workflows, and eligibility logic before modular migration starts.');
  }
  if (language === 'delphi') suggestions.push('Identify form-bound logic and extract domain rules from Delphi units first.');
  if (language === 'classicasp') suggestions.push('Untangle Classic ASP page logic into services and isolate database access.');
  if (language === 'perl') suggestions.push('Add explicit tests around Perl scripts and isolate shell/file side effects before modernization.');
  if (language === 'jcl') suggestions.push('Map job dependencies, datasets, and scheduler assumptions before replacing JCL flows.');
  if (language === 'copybook') suggestions.push('Turn copybook fields into explicit schemas or DTO contracts before migrating business logic.');

  if (upper.includes('SELECT *')) suggestions.push('Replace SELECT * with explicit field projections before moving logic into services.');
  if (upper.includes('TODO') || upper.includes('FIXME')) issues.push({ type: 'maintainability', message: 'Outstanding TODO/FIXME markers found in legacy code', line: findLineNum(upper, 'TODO') || findLineNum(upper, 'FIXME') });
  if (!issues.length && !suggestions.length) suggestions.push('Preserve behavior first with characterization tests, then decompose legacy modules into smaller services.');

  refactoringSteps.push('Identify and isolate business rules from infrastructure concerns.');
  refactoringSteps.push('Create regression tests around current behavior before refactoring.');
  refactoringSteps.push('Map high-risk modules into phased modernization work packages.');

  const complexity = lines.length > 250 || functions.length > 15 ? 'high' : lines.length > 90 || functions.length > 5 ? 'medium' : 'low';
  const baseScores = { java: 76, csharp: 78, vb: 70, sql: 72, plsql: 72, rpg: 68, natural: 66, adabas: 64, powerbuilder: 70, siebel: 65, curam: 64, delphi: 71, classicasp: 67, perl: 69, jcl: 62, copybook: 63 };
  const modernizationScore = Math.max(25, (baseScores[language] || 72) - (issues.length * 10) - (complexity === 'high' ? 10 : complexity === 'medium' ? 4 : 0));

  return {
    language,
    lines: lines.length,
    characters: code.length,
    functions,
    complexity,
    issues,
    suggestions,
    techDebt: complexity === 'high' ? '2-5 weeks' : complexity === 'medium' ? '4-10 days' : '2-5 days',
    refactoringSteps,
    testCoverage: {
      estimated: Math.min(75, Math.max(20, functions.length * 10)),
      suggestions: [
        `Create characterization tests around ${language.toUpperCase()} business rules before migration.`,
        'Cover edge cases, failure paths, and external I/O dependencies.',
        'Add golden-data tests for reports, file outputs, or SQL result sets where relevant.'
      ]
    },
    modernizationScore
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
    suggestions: ['Language-specific analysis available for JavaScript, Python, COBOL, Java, C#, VB, SQL, PL/SQL, RPG, Siebel, IBM Cúram, and more, select the language above or upload a file with the correct extension.'],
    techDebt: 'Unknown — manual review recommended',
    refactoringSteps: ['1. Identify language and framework', '2. Run linter for style issues', '3. Extract business logic into services'],
    testCoverage: { estimated: 0, suggestions: ['Add language-appropriate test framework'] },
    modernizationScore: 50
  };
}

// ── API Routes ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    requestId: req.requestId
  });
});

// Analyze code (public — no auth needed for demo)
app.post('/api/analyze', makeRateLimiter('analyze', ANALYZE_RATE_LIMIT_MAX), (req, res) => {
  const schema = Joi.object({
    code: Joi.string().min(1).max(100000).required(),
    language: Joi.string().valid('javascript', 'python', 'cobol', 'java', 'csharp', 'vb', 'sql', 'plsql', 'rpg', 'natural', 'adabas', 'powerbuilder', 'siebel', 'curam', 'delphi', 'classicasp', 'perl', 'jcl', 'copybook', 'auto').default('auto'),
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
    } else if (upper.includes('EXEC SQL') || upper.includes('CREATE OR REPLACE PROCEDURE') || upper.includes('CREATE OR REPLACE FUNCTION')) {
      detectedLang = 'plsql';
    } else if (upper.includes('SELECT ') || upper.includes('INSERT INTO ') || upper.includes('UPDATE ') || upper.includes('DELETE FROM ')) {
      detectedLang = 'sql';
    } else if (/\bSUB\b|\bFUNCTION\b|ON ERROR RESUME NEXT/i.test(code) || upper.includes('END SUB') || upper.includes('END FUNCTION')) {
      detectedLang = 'vb';
    } else if (upper.includes('USING SYSTEM;') || upper.includes('NAMESPACE ') || upper.includes('CONSOLE.WRITELINE')) {
      detectedLang = 'csharp';
    } else if (upper.includes('PUBLIC CLASS') || upper.includes('PRIVATE STATIC') || upper.includes('SYSTEM.OUT.PRINT')) {
      detectedLang = 'java';
    } else if (/^\s*[A-Z0-9_]+\s+BEGSR\b/gim.test(code) || upper.includes('DCL-S ')) {
      detectedLang = 'rpg';
    } else if (upper.includes('DEFINE SUBROUTINE') || upper.includes('END-SUBROUTINE')) {
      detectedLang = 'natural';
    } else if (upper.includes('FIND ') && upper.includes('IN VIEW OF') || upper.includes('READ LOGICAL')) {
      detectedLang = 'adabas';
    } else if (upper.includes('FORWARD') && upper.includes('TYPE ') || upper.includes('EVENT ') && upper.includes('TRIGGER')) {
      detectedLang = 'powerbuilder';
    } else if (upper.includes('BUSCOMP_') || upper.includes('BUSCOMPPRE') || upper.includes('APPLET_') || upper.includes('THEAPPLICATION().GETBUSOBJECT') || upper.includes('THESERVICE')) {
      detectedLang = 'siebel';
    } else if (upper.includes('CURAM.') || upper.includes('CER_') || upper.includes('BDM') && upper.includes('CASE') || upper.includes('EVIDENCE') && upper.includes('ELIGIBILITY')) {
      detectedLang = 'curam';
    } else if (upper.includes('UNIT ') && upper.includes('INTERFACE') && upper.includes('IMPLEMENTATION')) {
      detectedLang = 'delphi';
    } else if (upper.includes('<%') || upper.includes('RESPONSE.WRITE') || upper.includes('SERVER.CREATEOBJECT')) {
      detectedLang = 'classicasp';
    } else if (/^\s*SUB\s+\w+/gim.test(code) || upper.includes('USE STRICT;') || upper.includes('MY $')) {
      detectedLang = 'perl';
    } else if (/^\s*\/\/[^\n]+\s+(JOB|EXEC|DD)\b/gim.test(code)) {
      detectedLang = 'jcl';
    } else if (/^\s*\d{2}\s+[A-Z0-9-]+\s+PIC\s+/gim.test(code)) {
      detectedLang = 'copybook';
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
    case 'java':
    case 'csharp':
    case 'vb':
    case 'sql':
    case 'plsql':
    case 'rpg':
    case 'natural':
    case 'adabas':
    case 'powerbuilder':
    case 'siebel':
    case 'curam':
    case 'delphi':
    case 'classicasp':
    case 'perl':
    case 'jcl':
    case 'copybook':
      results = analyzeEnterpriseLegacy(code, detectedLang); break;
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
app.post('/api/contact', makeRateLimiter('contact', CONTACT_RATE_LIMIT_MAX), (req, res) => {
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
app.post('/api/register', makeRateLimiter('auth', AUTH_RATE_LIMIT_MAX), async (req, res) => {
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
app.post('/api/login', makeRateLimiter('auth', AUTH_RATE_LIMIT_MAX), (req, res) => {
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
          languagesSupported: ['JavaScript', 'Python', 'COBOL', 'Java', 'C#', 'VB', 'SQL', 'PL/SQL', 'RPG', 'Natural', 'Adabas', 'PowerBuilder', 'Delphi', 'Classic ASP', 'Perl', 'JCL', 'Copybook'],
          uptime: Math.round(process.uptime())
        });
      });
    });
  });
});

app.get('/api/analytics', (req, res) => {
  db.all('SELECT language, COUNT(*) as count FROM analyses GROUP BY language ORDER BY count DESC', (err, languages) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.all('SELECT complexity, COUNT(*) as count FROM analyses GROUP BY complexity ORDER BY count DESC', (err2, complexities) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      db.all(`SELECT substr(created_at, 1, 10) as day, COUNT(*) as count
              FROM analyses
              WHERE created_at >= datetime('now', '-6 days')
              GROUP BY substr(created_at, 1, 10)
              ORDER BY day ASC`, (err3, trend) => {
        if (err3) return res.status(500).json({ error: 'Database error' });
        db.get(`SELECT language, filename, modernization_score, created_at
                FROM analyses
                WHERE modernization_score IS NOT NULL
                ORDER BY modernization_score DESC, created_at DESC
                LIMIT 1`, (err4, topRun) => {
          if (err4) return res.status(500).json({ error: 'Database error' });
          res.json({
            languages: languages || [],
            complexities: complexities || [],
            trend: trend || [],
            topRun: topRun || null
          });
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

app.use((err, req, res, next) => {
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed', requestId: req.requestId });
  }
  console.error(`[${req.requestId || 'no-request-id'}]`, err);
  return res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
});

// ── Start Server ───────────────────────────────────────────
function startServer(port = PORT) {
  server = app.listen(port, () => {
    console.log(`\n🚀 Agii Intelligence Backend running on http://localhost:${port}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🗄️ Database: ${DB_PATH}`);
    console.log(`📊 API endpoints:`);
    console.log(`   POST /api/analyze   — Analyze code`);
    console.log(`   POST /api/contact   — Submit contact form`);
    console.log(`   POST /api/register  — Create account`);
    console.log(`   POST /api/login     — Authenticate`);
    console.log(`   GET  /api/history   — Analysis history (auth)`);
    console.log(`   GET  /api/stats     — Platform statistics`);
    console.log(`   GET  /api/health    — Health check\n`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, db, startServer, DB_PATH };
