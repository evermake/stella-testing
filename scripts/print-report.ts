import path from "node:path"
import fs from "node:fs"
import { program } from "commander"
import chalk from "chalk"
import type { Report } from "./types"

export type TestcaseResult = {
  passed: boolean | null
}

export type ExpectedResult = {
  ok: true
} | {
  ok: false
  errorTag: string
} | {
  ok: null
}

const ERROR_TAG_REGEX = /\[(ERROR_(\w+))\]/i

function parseExpectedResult(expected: string): ExpectedResult {
  if (expected.trim() === "") {
    return { ok: true }
  }

  const typeErrorMatch = expected.match(ERROR_TAG_REGEX)

  if (typeErrorMatch) {
    return {
      ok: false,
      errorTag: typeErrorMatch[1],
    }
  }

  return { ok: null }
}

function getTestcaseResult(testcase: Report["testcases"][string]): TestcaseResult {
  const expectedResult = parseExpectedResult(testcase.expected)
  if (expectedResult.ok) {
    return { passed: testcase.exitCode === 0 }
  } else if (expectedResult.ok === null) {
    return { passed: null }
  } else {
    if (testcase.exitCode === 0) {
      return { passed: false }
    }

    const resultStr = `${testcase.actualStdout}\n${testcase.actualStderr}`

    return {
      passed: resultStr.includes(expectedResult.errorTag)
    }
  }
}

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
    .forEach(([name, testcase]) => {
      const result = getTestcaseResult(testcase)
      console.log(chalk.italic(name) + ":" + (result.passed ? chalk.green(" ✔") : chalk.red(" ✘")))
      total += 1
      passed += result.passed ? 1 : 0
    })
  console.log('=================================')
  console.log(`Total: ${passed}/${total}`)
}

main()
