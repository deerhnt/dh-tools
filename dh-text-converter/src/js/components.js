import { onTab } from './browser-utils.js';

// ---- UI pieces ----
const Row = ({ label, children, wide }) => (
  <div className="flex items-center gap-3 mb-3">
    <label className={`text-sm text-zinc-500 flex-shrink-0 ${wide ? 'w-44' : 'w-32'}`}>{label}</label>
    {children}
  </div>
);

export const Select = ({ value, onChange, options, className = 'w-56' }) => (
  <select className={`ctl ${className}`} value={value} onChange={e => onChange(e.target.value)}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

const Check = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer mb-2">
    <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={!!checked} onChange={e => onChange(e.target.checked)} />
    {label}
  </label>
);

const DELIM_OPTS = [['comma', 'Comma ( , )'], ['tab', 'Tab'], ['pipe', 'Pipe ( | )'], ['space', 'Space']];
const AUTO_OPTS = [['auto', 'Auto-detect'], ...DELIM_OPTS];
const DELIM_CUSTOM = [...DELIM_OPTS, ['custom', 'Custom…']];
const AUTO_CUSTOM = [['auto', 'Auto-detect'], ...DELIM_CUSTOM];
const QUOTE_OPTS = [['none', 'Keep original'], ['remove', 'Remove quotes'], ['double', 'Unify to double quotes ( " )'], ['single', 'Unify to single quotes ( \' )']];

const CodeBox = ({ head, value, onChange, tail, placeholder }) => (
  <div className="mb-3">
    <div className="mono text-xs text-zinc-400 mb-1">{head}</div>
    <textarea className="ctl mono w-full h-24 text-sm" value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)} onKeyDown={e => onTab(e, onChange)} spellCheck={false} />
    <div className="mono text-xs text-zinc-400 mt-1">{tail}</div>
    <div className="text-xs text-amber-600 mt-1">Runs in your browser. Use trusted code only.</div>
  </div>
);

const RuleEditor = ({ kind, rules, onChange }) => {
  const isReplace = kind === 'replace';
  const update = (i, patch) => onChange(rules.map((r, j) => j === i ? { ...r, ...patch } : r));
  const add = () => onChange([...rules, {
    pattern: '', flags: { i: false, m: false, s: false, u: false }, method: 'string',
    replacement: '', extraction: '', programCode: '', useEscape: false
  }]);
  return (
    <div>
      {rules.map((rule, i) => (
        <div key={i} className="border border-zinc-200 rounded-lg p-4 mb-3 bg-white">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rule {i + 1}</span>
            {rules.length > 1 && <button className="text-xs text-zinc-400 hover:text-red-600" onClick={() => onChange(rules.filter((_, j) => j !== i))}>Remove</button>}
          </div>
          <Row label="Regex pattern">
            <input className="ctl mono flex-1" value={rule.pattern} placeholder="Regular expression"
              onChange={e => update(i, { pattern: e.target.value })} spellCheck={false} />
          </Row>
          <Row label="Regex flags">
            <div className="flex flex-wrap gap-x-4">
              {[['i', 'ignore case'], ['m', 'multiline'], ['s', 'dotAll'], ['u', 'Unicode']].map(([f, d]) => (
                <Check key={f} label={`${f} (${d})`} checked={rule.flags[f]} onChange={v => update(i, { flags: { ...rule.flags, [f]: v } })} />
              ))}
            </div>
          </Row>
          <Row label="Method">
            <div className="flex gap-4 text-sm text-zinc-700">
              {[['string', isReplace ? 'Replacement text' : 'Extraction text'], ['program', 'Custom function']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" className="accent-zinc-900" checked={rule.method === v} onChange={() => update(i, { method: v })} />{l}
                </label>
              ))}
            </div>
          </Row>
          {rule.method === 'program' ? (
            <CodeBox head={'function fn(match, groups) {\n  let replacement = match;'.replace('\n', ' ')} tail="  return replacement; }"
              value={rule.programCode} onChange={v => update(i, { programCode: v })}
              placeholder="// replacement = match.toUpperCase();   (groups = [$1, $2, ...])" />
          ) : isReplace ? (
            <>
              <Row label="Replace with">
                <input className="ctl mono flex-1" value={rule.replacement} placeholder="$1,$2"
                  onChange={e => update(i, { replacement: e.target.value })} spellCheck={false} />
              </Row>
              <div className="ml-[8.75rem]"><Check label="Interpret escape sequences (\n \t \xHH \uHHHH)" checked={rule.useEscape} onChange={v => update(i, { useEscape: v })} /></div>
            </>
          ) : (
            <Row label="Extract">
              <input className="ctl mono flex-1" value={rule.extraction} placeholder="$0, $1, $2"
                onChange={e => update(i, { extraction: e.target.value })} spellCheck={false} />
            </Row>
          )}
        </div>
      ))}
      {rules.length < 5 && <button className="btn" onClick={add}>+ Add rule</button>}
    </div>
  );
};

const DelimRow = ({ opts, o, set }) => (
  <Row label="Delimiter">
    <Select value={o.delimiter} onChange={v => set({ delimiter: v })} options={opts} className="w-56" />
    {o.delimiter === 'custom' && (
      <input className="ctl mono w-40" value={o.customDelimiter} placeholder="e.g.  ;  or \t"
        onChange={e => set({ customDelimiter: e.target.value })} spellCheck={false} autoFocus />
    )}
  </Row>
);

export const Options = ({ mode, o, set }) => {
  const sel = (key, label, opts, cls, wide) => <Row label={label} wide={wide}><Select value={o[key]} onChange={v => set({ [key]: v })} options={opts} className={cls} /></Row>;
  switch (mode) {
    case 'compress': return <><DelimRow opts={DELIM_CUSTOM} o={o} set={set} />{sel('quote', 'Quotes', QUOTE_OPTS, 'w-72')}</>;
    case 'expand': return <><DelimRow opts={AUTO_CUSTOM} o={o} set={set} />{sel('quote', 'Quotes', QUOTE_OPTS, 'w-72')}</>;
    case 'delimiter': return (
      <>
        {sel('inputDelimiter', 'Input delimiter', AUTO_OPTS)}
        {sel('outputDelimiter', 'Output delimiter', DELIM_OPTS)}
        {sel('quote', 'Quotes', QUOTE_OPTS, 'w-72')}
        <Check label="Run custom function on every cell" checked={o.programEnabled} onChange={v => set({ programEnabled: v })} />
        {o.programEnabled && (
          <CodeBox head="function fn(value, col_index, row_index) {" tail="  return value; }" value={o.programCode}
            onChange={v => set({ programCode: v })} placeholder={'// value = value + "1";'} />
        )}
      </>);
    case 'dedupe': return (
      <>
        <Check label="Normalize spaces, tabs and full-width spaces" checked={o.normalizeSpaces} onChange={v => set({ normalizeSpaces: v })} />
        <Check label="Trim both ends of each line" checked={o.dedupeTrimSpaces} onChange={v => set({ dedupeTrimSpaces: v })} />
        <Check label="Remove spaces around commas" checked={o.compressCommas} onChange={v => set({ compressCommas: v })} />
        <Check label="Ignore case when comparing" checked={o.ignoreCase} onChange={v => set({ ignoreCase: v })} />
      </>);
    case 'sort': {
      const ordered = o.sortOrder === 'asc' || o.sortOrder === 'desc';
      return (
        <>
          {sel('sortOrder', 'Order', [['asc', 'Ascending (A → Z, 1 → 9)'], ['desc', 'Descending (Z → A, 9 → 1)'], ['reverse', 'Reverse current order'], ['shuffle', 'Shuffle randomly']], 'w-72')}
          {ordered && sel('sortType', 'Compare as', [['text', 'Text'], ['natural', 'Natural (file2 before file10)'], ['number', 'Number']], 'w-72')}
          {ordered && o.sortType !== 'number' && <Check label="Ignore case" checked={o.sortIgnoreCase} onChange={v => set({ sortIgnoreCase: v })} />}
          <Check label="Remove empty lines" checked={o.sortSkipEmpty} onChange={v => set({ sortSkipEmpty: v })} />
        </>);
    }
    case 'cleaning': return (
      <>
        {sel('caseConversion', 'Letter case', [['none', 'No change'], ['lower', 'Lowercase'], ['upper', 'Uppercase']], 'w-56', true)}
        {sel('numberConversion', 'Full/half-width', [['none', 'No change'], ['fullToHalf', 'Full-width digits → half-width'], ['fullAlphaNumToHalf', 'Full-width alphanumerics → half-width'], ['halfToFull', 'Half-width digits → full-width'], ['halfAlphaNumToFull', 'Half-width alphanumerics → full-width']], 'w-80', true)}
        {sel('trimSpaces', 'Trim whitespace', [['none', 'No change'], ['both', 'Trim both ends'], ['left', 'Trim left end'], ['right', 'Trim right end'], ['all', 'Remove all whitespace']], 'w-64', true)}
        {sel('spaceConversion', 'Space conversion', [['none', 'No change'], ['fullToHalf', 'Full-width → half-width space'], ['halfToFull', 'Half-width → full-width space']], 'w-72', true)}
        {sel('lineBreakConversion', 'Line breaks', [['none', 'No change'], ['remove', 'Remove line breaks'], ['toSpace', 'Replace with space'], ['removeConsecutive', 'Collapse consecutive breaks']], 'w-72', true)}
      </>);
    case 'replace': return <RuleEditor kind="replace" rules={o.replaceRules} onChange={v => set({ replaceRules: v })} />;
    case 'extract': return (
      <>
        {sel('extractDelimiter', 'Output delimiter', [['newline', 'Newline'], ['space', 'Space'], ['tab', 'Tab'], ['comma', 'Comma ( , )'], ['hyphen', 'Hyphen ( - )'], ['semicolon', 'Semicolon ( ; )'], ['none', 'None']])}
        <RuleEditor kind="extract" rules={o.extractRules} onChange={v => set({ extractRules: v })} />
      </>);
    default: return null;
  }
};
