import { INITIAL, MODES } from './config.js';
import { safeRun } from './converters.js';
import { Options, Select } from './components.js';
import { copyOutput, downloadOutput, notify, countLines, onTab } from './browser-utils.js';

const { useState, useEffect } = React;

export const App = () => {
  const [mode, setMode] = useState('compress');
  const [input, setInput] = useState('');
  const [o, setO] = useState(INITIAL);
  const [live, setLive] = useState(true);
  const [applied, setApplied] = useState({ output: '', count: 0, errors: [] });
  const [safeCsv, setSafeCsv] = useState(true);
  const [computed, setComputed] = useState({ output: '', count: 0, errors: [] });
  const set = (patch) => setO(prev => ({ ...prev, ...patch }));

  // Only auto mode schedules conversions, including custom functions with side effects.
  useEffect(() => {
    if (!live) return;
    const timer = setTimeout(() => setComputed(safeRun(mode, input, o)), 250);
    return () => clearTimeout(timer);
  }, [mode, input, o, live]);

  const res = live ? computed : applied;
  const showCount = (mode === 'replace' || mode === 'extract') && res.count > 0;

  const copy = () => copyOutput(res.output);
  const download = () => downloadOutput(res.output, safeCsv);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight"><span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 align-middle" />DH Text Converter</h1>
        <p className="text-sm text-zinc-500 mt-1">Transform, clean and extract text data right in your browser.</p>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
        <Select value={mode} onChange={setMode} options={Object.entries(MODES).map(([k, v]) => [k, v[0]])} className="w-72" />
        <span className="text-sm text-zinc-500">{MODES[mode][1]}</span>
      </div>

      <section className="card border border-zinc-200 rounded-xl p-5 mb-6">
        <Options mode={mode} o={o} set={set} />
      </section>

      <section className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Input</label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{countLines(input)} lines</span>
            <button className="btn" onClick={() => { setInput(''); notify('Input cleared'); }}>Clear</button>
          </div>
        </div>
        <textarea className="ctl mono w-full h-44 p-3 text-sm" value={input} spellCheck={false}
          placeholder="Paste or type your data here…" onChange={e => setInput(e.target.value)} onKeyDown={e => onTab(e, setInput)} />
      </section>

      <div className="flex items-center justify-center gap-4 mb-5">
        <button className="btn btn-primary px-6" disabled={live} onClick={() => setApplied(safeRun(mode, input, o))}>Convert</button>
        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-zinc-900" checked={live} onChange={e => setLive(e.target.checked)} />
          Auto
        </label>
      </div>

      <section>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Output</label>
            {res.output && <button className="btn" onClick={() => { setInput(res.output); notify('Output moved to input'); }}>↑ Use as input</button>}
            {showCount && <span className="text-xs text-zinc-500 border border-zinc-200 rounded px-2 py-1">{mode === 'replace' ? 'Replaced' : 'Extracted'}: {res.count}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 mr-2">{countLines(res.output)} lines</span>
            {res.output && <><label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer mr-1" title="Prefixes cells starting with = + - @ so spreadsheets don’t run them as formulas"><input type="checkbox" className="accent-zinc-900" checked={safeCsv} onChange={e => setSafeCsv(e.target.checked)} />Escape formulas</label><button className="btn btn-copy" onClick={copy}>Copy</button><button className="btn btn-primary" onClick={download}>Download .csv</button></>}
          </div>
        </div>
        <textarea className="ctl mono w-full h-44 p-3 text-sm bg-zinc-50" readOnly value={res.output} placeholder="Results will appear here…" />
        {res.errors.length > 0 && (
          <ul className="mt-2 text-sm text-red-600">{res.errors.map((m, i) => <li key={i}>{m}</li>)}</ul>
        )}
      </section>
    </div>
  );
};
