# Stella testing utilities

![Report Viewer Screenshot](./report-viewer/screenshot.png)

## About

Scripts for testing Stella implementation for the "Advanced Compilers Construction and Program Analysis" course.

## Usage

To test your implementation you need:

1. **Prepare test files**: (already generated and located at `./tests` directory for you) `.stella` and `.stella.out` files containing output from the correct Stella implementation
2. [**Generate report**: run your implementation across these test files and generate report in `.json` format](#generating-report)
3. [**Explore report**: see the results](#exploring-report)

### Generating report

When you have your typechecker you can test it across test files and generate the report file.

To run typechecker you need to specify which command to run and path to the directory with tests.

Usage:

```
Usage: node test-typechecker.js [options] <tests-path>

Test your Stella typechecker implementation against a set of .stella files and save the results to a JSON file.

Arguments:
  tests-path             path to directory with files to typecheck and .out files generated by correct Stella implementation

Options:
  --cmd <command>
  --args [arguments...]
  -o, --out <path>       path where to save typechecker results (default: "./typechecker-report.json")
  -h, --help             display help for command
```

Some examples, how you can test your implementation and generate report:

```sh
# Run JavaScript typechecker with NodeJS
node ./build/test-typechecker.js --cmd node --args /path/to/stella/typechecker.js -o report.json ./tests

# Run binary typechecker using NodeJS
node ./build/test-typechecker.js --cmd /path/to/typechecker -o report.json ./tests

# Run binary typechecker with arguments using Bun
bun run ./build/test-typechecker.js --cmd /path/to/typechecker --args some args -o report.json ./tests
```

### Exploring report

Running script above should produce a `report.json`. To see results, you have two options:

Option 1. Go to [evermake.github.io/stella-testing/](https://evermake.github.io/stella-testing/), upload the generated `report.json` file, explore!

Option 2. Or you can use terminal to print the summary:

```sh
# Using NodeJS
node ./build/print-report.js report.json

# Using Bun
bun run ./build/print-report.js report.json
```
