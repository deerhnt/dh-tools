# DH Text Converter

DH Text Converter is a browser-based tool for transforming, cleaning, and extracting text data.

Text conversion runs locally in your browser. No account or server-side conversion service is required.

## Features

- Join multiple lines using a delimiter, or split delimited text into lines.
- Convert between comma, tab, pipe, and space delimiters.
- Remove duplicate lines, with options to normalize spaces and ignore case.
- Sort lines alphabetically, numerically, or naturally; reverse or shuffle their order.
- Clean text by changing case, converting full-width and half-width letters and numbers, trimming spaces, and adjusting line breaks.
- Find and replace text with up to five regular expression rules applied in order.
- Extract regular expression matches and capture groups with a choice of output delimiters.
- Use custom JavaScript functions for delimiter conversion, replacement, and extraction.
- Convert automatically while editing, or manually with the **Convert** button.
- Copy output, reuse it as input, or download it as a CSV file with optional formula escaping.

## Typical Workflow

1. Choose a conversion mode and configure its options.
2. Paste or type text into **Input**.
3. Review **Output** as it updates automatically, or turn off **Auto** and click **Convert**.
4. Copy or download the result, or select **Use as input** to apply another conversion.

## No Server-Side Data Storage or Processing

The built-in conversions do not upload or store input or output on a server. DH Text Converter is a static client-side application, and text processing runs in the browser. React and fonts load from external CDNs and require internet access.

Custom JavaScript functions execute in the browser and are not fully sandboxed. Only run code you trust.

## Local Use

Serve `index.html` and the `bundles/` and `assets/` directories through a web server, then open the page in your browser.

For a quick local preview, you can also double-click `index.html` (`file://`). Keep `bundles/` and `assets/` beside the HTML file. CDN dependencies still require internet access.

## Build and Test

From the `dh-text-converter` directory, install dependencies, run tests, and build the browser assets:

```powershell
npm install
npm test
npm run build
```

Commit the generated `bundles/app.js` and `bundles/style.css` when changing source files. Vite compiles JSX during the build.

## License

DH Text Converter is released under the [MIT License](LICENSE).
