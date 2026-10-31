// Neutralize spreadsheet formula injection: prefix cells starting with = + - @ with an apostrophe
export const csvSafe = (t) => t.replace(/(^|[,\t|;])(["']?)([=+\-@])/gm, (m, a, q, c) => a + q + "'" + c);


// Show an accessible notification without generating inline styles.
export const notify = (message, type = 'ok') => {
  const toast = document.createElement('div');
  toast.className = `fixed right-4 top-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${type === 'error' ? 'bg-red-600' : 'bg-zinc-900'}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};

export const countLines = (text) => text.split('\n').filter(line => line.trim()).length;

// Copy output with a fallback for browsers that do not expose the Clipboard API.
export const copyOutput = async (output) => {
  try {
    await navigator.clipboard.writeText(output);
    notify('Copied to clipboard');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = output;
    textarea.className = 'fixed -left-full top-0';
    const previousFocus = document.activeElement;
    try {
      document.body.appendChild(textarea);
      textarea.select();
      if (!document.execCommand('copy')) throw new Error('Copy failed');
      notify('Copied to clipboard');
    } catch { notify('Copy failed', 'error'); }
    finally { textarea.remove(); previousFocus?.focus(); }
  }
};

// Start a CSV download and release the temporary URL after the browser handles it.
export const downloadOutput = (output, safeCsv) => {
  let url;
  const anchor = document.createElement('a');
  try {
    const date = new Date();
    const pad = (number) => String(number).padStart(2, '0');
    anchor.download = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}_output.csv`;
    url = URL.createObjectURL(new Blob([safeCsv ? csvSafe(output) : output], { type: 'text/csv;charset=utf-8;' }));
    anchor.href = url;
    anchor.className = 'hidden';
    document.body.appendChild(anchor);
    anchor.click();
    notify('File downloaded');
  } catch { notify('Download failed', 'error'); }
  finally {
    anchor.remove();
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

// Insert a literal tab and restore the caret after React updates the input.
export const onTab = (e, apply) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: en, value } = e.target;
  const el = e.target;
  apply(value.slice(0, s) + '\t' + value.slice(en));
  setTimeout(() => { el.selectionStart = el.selectionEnd = s + 1; }, 0);
};
