# Final verification

Source e8420427f196bcdae7aa16d5fe01eef59bde7a9c. All commands exited zero on the frozen source.

| Check | Evidence |
|---|---|
| npm test —279/279 files | [unit.txt](unit.txt) |
| CI=1 LATTICE_TEST_PORT=4210 npm run test:browser -- --workers=2 —336 passed | [browser.txt](browser.txt) |
| npm run check:types —0 errors/0 warnings | [types.txt](types.txt) |
| npm run build —181 modules | [build.txt](build.txt) |
| npm run check:assets —544 imports | [assets.txt](assets.txt) |
| npm run smoke:install —zero API/errors/missing | [install.txt](install.txt) |
| git diff --check —pass, line-ending warnings only | [diff-warnings.txt](diff-warnings.txt) |
| Independent source review | [review.txt](review.txt) |

Logs are normalized to LF. Timing ran after regression suites ended. The source-review record reports the reviewer conclusions; it is not a benchmark.
