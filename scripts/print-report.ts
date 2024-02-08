import path from "node:path"
import fs from "node:fs"
import { program } from "commander"
import chalk from "chalk"
import type { Report } from "./types"

async function main() {
  program
    .name('print-report')
    //
    .argument('<report-path>', 'path to report')
    //
    .parse()

  const [reportPath] = program.args
  const report: Report = JSON.parse((await fs.promises.readFile(path.resolve(reportPath))).toString())
  let total = 0
  let passed = 0
  let partiallyPassed = 0
  let failed = 0
  let unknown = 0

  Object
    .entries(report.testcases)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort by file name
    .forEach(([name, tc]) => {
      let sym
      switch (tc.conclusion) {
        case "incorrect":
          failed += 1
          sym = chalk.red("✘")
          break
        case "correct":
          passed += 1
          sym = chalk.green("✔")
          break
        case "partially-correct":
          partiallyPassed += 1
          sym = chalk.yellow("⚠")
          break
        case "unknown":
          unknown += 1
          sym = chalk.yellow("?")
          break
      }
      total += 1

      console.log(chalk.italic(name) + ": " + sym)
    })
  console.log('=================================')
  console.log(chalk.bold(`Total: ${total}`))
  console.log(chalk.green(`  Passed: ${passed}`))
  console.log(chalk.red(`  Failed: ${failed}`))
  console.log(chalk.yellow(`  Partially passed: ${partiallyPassed}`))
  console.log(chalk.yellow(`  Unknown: ${unknown}`))
}

main()
