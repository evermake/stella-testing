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

  Object
    .entries(report.testcases)
    .sort(([a], [b]) => a.localeCompare(b)) // Sort by file name
    .forEach(([name, tc]) => {
      console.log(chalk.italic(name) + ":" + (tc.passed ? chalk.green(" ✔") : chalk.red(" ✘")))
      total += 1
      passed += tc.passed ? 1 : 0
    })
  console.log('=================================')
  console.log(`Total: ${passed}/${total}`)
}

main()
