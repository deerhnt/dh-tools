# DH Diff

DH Diff is a browser-based, text comparison tool for quickly inspecting changes between an original and a modified version of a file or text snippet.

It runs locally in the browser, so compared text stays in the current session instead of being sent to a comparison service.

## Online tool

Use the [DH Diff online tool](https://deerhnt.github.io/dh-diff/) to compare text directly in your browser. No account or server-side comparison service is required.

## Features

- Live comparison of two text inputs.
- Side-by-side, line-by-line, and inline views.
- Line, word, character, and sentence comparison modes.
- Ignore options for empty lines, whitespace, and case.
- Unified patch creation with copy and download actions.
- File drag-and-drop, change statistics, zoom, context controls, and keyboard shortcuts.

## Typical Workflow

1. Paste or drop the original text into **Text 1**.
2. Paste or drop the modified text into **Text 2**.
3. Choose a comparison view and mode, then inspect the changes.
4. Create, copy, or download a unified patch when needed.

## No Server-Side Data Storage or Processing

DH Diff does not upload or store comparison data on a server. There is no application server or server-side processing for the text being compared; all comparisons run in the browser. The online tool is a static client-side application.

## License

DH Diff is released under the [MIT License](LICENSE).
