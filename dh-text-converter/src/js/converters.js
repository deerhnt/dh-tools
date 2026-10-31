const DELIMS = { comma: ',', tab: '\t', pipe: '|', space: ' ' };
const EXTRACT_DELIMS = { newline: '\n', space: ' ', tab: '\t', comma: ',', hyphen: '-', semicolon: ';', none: '' };
const delim = (t) => DELIMS[t] || ',';
// Delimiter for Join/Split modes; "Custom" supports escapes such as \t and \n
const pick = (o) => o.delimiter === 'custom' ? unescapeSeq(o.customDelimiter) : delim(o.delimiter);

const detectDelimiter = (text) => {
  let best = ',', max = 0;
  Object.values(DELIMS).forEach(d => {
    const n = text.split(d).length - 1;
    if (n > max) { max = n; best = d; }
  });
  return best;
};

const applyQuote = (text, opt) => {
  const bare = text.replace(/^["']|["']$/g, '');
  if (opt === 'remove') return bare;
  if (opt === 'double') return '"' + bare + '"';
  if (opt === 'single') return "'" + bare + "'";
  return text;
};

// Decode each escape once so escaped backslashes remain literal.
export const unescapeSeq = (s) => s.replace(/\\(\\|n|t|r|0|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4})/g, (_, token) => {
  const escapes = { '\\': '\\', n: '\n', t: '\t', r: '\r', 0: '\0' };
  return token in escapes ? escapes[token] : String.fromCharCode(parseInt(token.slice(1), 16));
});

const flagsOf = (rule) => 'g' + Object.keys(rule.flags).filter(f => rule.flags[f]).join('');
// Replace capture references in one pass without interpreting captured text again.
export const fillTemplate = (template, matches) => template.replace(/\$(\d+)/g,
  (token, index) => matches[Number(index)] ?? token);
// User-written functions run in strict mode with common browser globals shadowed.
// This reduces accidents; it is not a full sandbox, so only run code you trust.
const BLOCKED = ['window', 'document', 'fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'navigator', 'location', 'parent', 'top', 'self', 'globalThis', 'opener', 'frames', 'postMessage', 'Worker', 'SharedWorker'];
const buildFn = (args, code) => {
  const f = new Function(...args, ...BLOCKED, '"use strict";\n' + code);
  return (...a) => f(...args.map((_, i) => a[i]), ...BLOCKED.map(() => undefined));
};

const MAX_CHARS = 2000000;
const EMPTY = { output: '', count: 0, errors: [] };
// ---- Pure converters; each returns { output, count, errors } ----
// Convert compress input and collect per-rule errors without interrupting other rules.
const convertCompress = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  output = lines.filter(l => l.trim()).map(l => applyQuote(l.trim(), o.quote)).join(pick(o));
  return { output, count, errors: [...errors] };
};

// Convert expand input and collect per-rule errors without interrupting other rules.
const convertExpand = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  const d = o.delimiter === 'auto' ? detectDelimiter(input) : pick(o);
  output = d === '' ? input : input.split(d).map(v => applyQuote(v.trim(), o.quote)).join('\n');
  return { output, count, errors: [...errors] };
};

// Convert delimiter input and collect per-rule errors without interrupting other rules.
const convertDelimiter = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  const inD = o.inputDelimiter === 'auto' ? detectDelimiter(input) : delim(o.inputDelimiter);
  const outD = delim(o.outputDelimiter);
  let fn = null;
  if (o.programEnabled && o.programCode.trim()) {
    try { fn = buildFn(['value', 'col_index', 'row_index'], o.programCode + '\nreturn value;'); }
    catch (e) { errors.add('Program error: ' + e.message); }
  }
  output = lines.map((line, r) => {
    if (!line.trim()) return line;
    return line.split(inD).map((v, c) => {
      let val = v.trim();
      if (fn) { try { val = fn(val, c, r); } catch (e) { errors.add('Program error: ' + e.message); val = v.trim(); } }
      return applyQuote(String(val), o.quote);
    }).join(outD);
  }).join('\n');
  return { output, count, errors: [...errors] };
};

// Convert dedupe input and collect per-rule errors without interrupting other rules.
const convertDedupe = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  let ls = lines;
  if (o.normalizeSpaces) ls = ls.map(l => l.replace(/[\s\t　]+/g, ' ').trim());
  if (o.dedupeTrimSpaces) ls = ls.map(l => l.trim());
  if (o.compressCommas) ls = ls.map(l => l.replace(/\s*,\s*/g, ','));
  const seen = new Set();
  output = ls.filter(l => {
    if (!l) return false;
    const k = o.ignoreCase ? l.toLowerCase() : l;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).join('\n');
  return { output, count, errors: [...errors] };
};

// Convert sort input and collect per-rule errors without interrupting other rules.
const convertSort = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  const ls = o.sortSkipEmpty ? lines.filter(l => l.trim()) : lines.slice();
  if (o.sortOrder === 'reverse') {
    ls.reverse();
  } else if (o.sortOrder === 'shuffle') {
    for (let i = ls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ls[i], ls[j]] = [ls[j], ls[i]];
    }
  } else {
    const key = (s) => o.sortIgnoreCase ? s.toLowerCase() : s;
    const num = (s) => {
      const n = parseFloat(s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[,，]/g, ''));
      return isNaN(n) ? Infinity : n;
    };
    const coll = new Intl.Collator(undefined, { numeric: true, sensitivity: o.sortIgnoreCase ? 'base' : 'variant' });
    const text = (a, b) => { const x = key(a), y = key(b); return x < y ? -1 : x > y ? 1 : 0; };
    const cmp = o.sortType === 'number' ? (a, b) => (num(a) - num(b)) || text(a, b)
      : o.sortType === 'natural' ? (a, b) => coll.compare(a, b)
      : text;
    ls.sort(cmp);
    if (o.sortOrder === 'desc') ls.reverse();
  }
  output = ls.join('\n');
  return { output, count, errors: [...errors] };
};

// Convert cleaning input and collect per-rule errors without interrupting other rules.
const convertCleaning = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  let r = input;
  if (o.caseConversion === 'upper') r = r.toUpperCase();
  if (o.caseConversion === 'lower') r = r.toLowerCase();
  const shift = (re, d) => { r = r.replace(re, c => String.fromCharCode(c.charCodeAt(0) + d)); };
  if (o.numberConversion === 'fullToHalf') shift(/[０-９]/g, -0xFEE0);
  if (o.numberConversion === 'halfToFull') shift(/[0-9]/g, 0xFEE0);
  if (o.numberConversion === 'fullAlphaNumToHalf') shift(/[Ａ-Ｚａ-ｚ０-９]/g, -0xFEE0);
  if (o.numberConversion === 'halfAlphaNumToFull') shift(/[A-Za-z0-9]/g, 0xFEE0);
  const trims = { both: /^[\s　]+|[\s　]+$/g, left: /^[\s　]+/g, right: /[\s　]+$/g, all: /[\s　]/g };
  if (trims[o.trimSpaces]) r = r.split('\n').map(l => l.replace(trims[o.trimSpaces], '')).join('\n');
  if (o.spaceConversion === 'fullToHalf') r = r.replace(/　/g, ' ');
  if (o.spaceConversion === 'halfToFull') r = r.replace(/ /g, '　');
  if (o.lineBreakConversion === 'remove') r = r.replace(/\n/g, '');
  if (o.lineBreakConversion === 'toSpace') r = r.replace(/\n/g, ' ');
  if (o.lineBreakConversion === 'removeConsecutive') r = r.replace(/\n{2,}/g, '\n');
  output = r;
  return { output, count, errors: [...errors] };
};

// Convert replace input and collect per-rule errors without interrupting other rules.
const convertReplace = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  output = input;
  o.replaceRules.forEach(rule => {
    if (!rule.pattern.trim()) return;
    try {
      const re = new RegExp(rule.pattern, flagsOf(rule));
      if (rule.method === 'program') {
        const fn = buildFn(['match', 'groups'], 'let replacement = match; const g = groups; ' + rule.programCode + '\nreturn replacement;');
        output = output.replace(re, (...a) => {
          const caps = a.slice(0, typeof a[a.length - 1] === 'object' ? -3 : -2);
          count++;
          try { return fn(caps[0], caps.slice(1)); } catch (e) { errors.add('Program error: ' + e.message); return caps[0]; }
        });
      } else {
        const tpl = rule.useEscape ? unescapeSeq(rule.replacement) : rule.replacement;
        output = output.replace(re, (...a) => {
          const caps = a.slice(0, typeof a[a.length - 1] === 'object' ? -3 : -2);
          count++;
          return fillTemplate(tpl, caps);
        });
      }
    } catch (e) { errors.add('Regex error: ' + e.message); }
  });
  return { output, count, errors: [...errors] };
};

// Convert extract input and collect per-rule errors without interrupting other rules.
const convertExtract = (input, o) => {
  const errors = new Set();
  const lines = input.split('\n');
  let count = 0, output = '';
  const found = [];
  o.extractRules.forEach(rule => {
    if (!rule.pattern.trim()) return;
    try {
      const re = new RegExp(rule.pattern, flagsOf(rule));
      const fn = rule.method === 'program'
        ? buildFn(['match', 'groups'], 'let replacement = match; const g = groups; ' + rule.programCode + '\nreturn replacement;') : null;
      for (const m of input.matchAll(re)) {
        count++;
        if (fn) {
          try { const v = fn(m[0], m.slice(1)); if (v) found.push(v); }
          catch (e) { errors.add('Program error: ' + e.message); }
        } else {
          const v = fillTemplate(rule.extraction || '$0', m);
          if (v) found.push(v);
        }
      }
    } catch (e) { errors.add('Regex error: ' + e.message); }
  });
  output = found.join(EXTRACT_DELIMS[o.extractDelimiter] ?? '\n');
  return { output, count, errors: [...errors] };
};

const CONVERTERS = {
  compress: convertCompress,
  expand: convertExpand,
  delimiter: convertDelimiter,
  dedupe: convertDedupe,
  sort: convertSort,
  cleaning: convertCleaning,
  replace: convertReplace,
  extract: convertExtract
};

const run = (mode, input, options) => {
  try { return CONVERTERS[mode](input, options); }
  catch (error) { return { ...EMPTY, errors: [error.message] }; }
};

export const safeRun = (mode, input, o) => !input.trim() ? EMPTY
  : input.length > MAX_CHARS ? { ...EMPTY, errors: ['Input is too large (limit: 2,000,000 characters).'] }
  : run(mode, input, o);
