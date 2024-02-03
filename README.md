# Stella testing utilities

## About

Scripts for testing Stella implementation for the "Advanced Compilers Construction and Program Analysis" course.

## Usage

To test your implementation you need:

1. Test `.stella` files with `.stella.out` files containing output from the correct Stella implementation (already generated and located at `./tests` directory)
2. [Run your implementation across these test files and generate report in `.json` format](#generating-reports)
3. [Explore report results](#printing-report)

### Generating reports

Your implementation should be a single file that follows requirements:

- It is an executable (for interpreted languages like Python or JavaScript you can add shebang in the beginning like `#!/usr/bin/env python` or `#!/usr/bin/env node`)
- Execution permission is granted (e.g. `chmod +x path/to/typechecker`)
- It accepts Stella source code in stdin
- It prints typechecking results to stdout or stderr
- On success it exits with zero-exit code
- On error it exits with non-zero exit code

When you have your implementation you can run it across tests:

```sh
# Using NodeJS
node ./build/test-typechecker.js -t path/to/typechecker -o report.json ./tests

# Using Bun
bun run ./build/test-typechecker.js -t .gitignore -o report.json ./tests
```

### Printing report

Running script above should produce a `report.json`. You can read results by running:

```sh
# Using NodeJS
node ./build/print-report.js report.json

# Using Bun
bun run ./build/print-report.js report.json
```
