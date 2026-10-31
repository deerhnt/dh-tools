export const MODES = {
  compress: ['Join lines', 'Combine multiple lines into one line using a delimiter.'],
  expand: ['Split into lines', 'Split a single line into multiple lines.'],
  delimiter: ['Convert delimiter (CSV ⇔ TSV)', 'Convert between comma, tab, pipe and space separated data.'],
  dedupe: ['Remove duplicate lines', 'Remove repeated lines and keep the first occurrence.'],
  sort: ['Sort lines', 'Sort lines alphabetically or numerically, reverse their order, or shuffle them.'],
  cleaning: ['Text cleaning', 'Clean up and normalize text, including full-width and half-width characters.'],
  replace: ['Find & replace', 'Replace text with up to five regex rules, applied in order.'],
  extract: ['Extract text', 'Pull out every string matching your regex rules.'],
};

export const INITIAL = {
  delimiter: 'comma', quote: 'double', inputDelimiter: 'auto', outputDelimiter: 'tab',
  normalizeSpaces: false, dedupeTrimSpaces: false, trimSpaces: 'none', compressCommas: false, ignoreCase: false,
  sortOrder: 'asc', sortType: 'text', sortIgnoreCase: false, sortSkipEmpty: true, customDelimiter: '',
  caseConversion: 'none', numberConversion: 'none', spaceConversion: 'none', lineBreakConversion: 'none',
  programEnabled: false, programCode: '',
  replaceRules: [{ pattern: '', flags: { i: false, m: false, s: false, u: false }, method: 'string', replacement: '', extraction: '', programCode: '', useEscape: false }],
  extractDelimiter: 'newline',
  extractRules: [{ pattern: '', flags: { i: false, m: false, s: false, u: false }, method: 'string', replacement: '', extraction: '', programCode: '', useEscape: false }],
};
