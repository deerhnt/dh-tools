# DH Tools

DH Tools is a collection of browser-based tools for comparing, transforming, and cleaning text.

## Tools

| Tool | Overview | Online tool | Documentation |
| --- | --- | --- | --- |
| DH Diff | Compare text with side-by-side, line-by-line, and inline views, then copy or download a unified patch. | [Open DH Diff](https://deerhnt.github.io/dh-diff/) | [README](dh-diff/README.md) |
| DH Text Converter | Join or split lines, convert delimiters, remove duplicates, sort and clean text, and replace or extract text with regular expressions. | [Open DH Text Converter](https://deerhnt.github.io/dh-text-converter/) | [README](dh-text-converter/README.md) |

## Getting Started

1. Open the tool for your task.
2. Paste your text and choose the comparison or conversion options.
3. Review the result, then copy or download it.

See each tool's README for its full feature list and usage details.

## Browser-Based Processing

Text comparison and built-in conversions run in the browser without server-side text processing or storage. No account is required.

DH Text Converter loads React and fonts from external CDNs, which require internet access. Its optional custom JavaScript functions are not fully sandboxed; only run code you trust.

## License

Both tools use the MIT License. See the licenses for [DH Diff](dh-diff/LICENSE) and [DH Text Converter](dh-text-converter/LICENSE).
