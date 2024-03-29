import path from "node:path"
import fs from "node:fs"
import os from "node:os"
import type { spawn as nodeSpawn } from "node:child_process"
import spawn from "cross-spawn"
import { program } from "commander"
import { glob } from "glob"
import cliProgress from "cli-progress"
import type { Report, TestcaseConclusion } from "./types"

async function fileExists(path: string) {
  try {
    await fs.promises.access(path, fs.constants.F_OK)
    return true
  } catch (_) {
    return false
  }
}

function getCoresCount() {
  let count = os.cpus().length
  if ('availableParallelism' in os) {
    count = os.availableParallelism()
  }
  return count
}

export type ExpectedTypecheckResult =
  | { type: 'unknown' }
  | { type: 'ok' }
  | {
    type: 'type-error'
    primaryTags: string[]
    alternativeTags: string[]
  }

const ERROR_TAG_REGEX = /\[(ERROR_\w+)\]/g
const TYPE_ERROR_OUTPUT_WITH_PRIMARY_AND_ALTERNATIVE_ERRORS_REGEX = /^An error occurred during typechecking!\s+===================\s*Primary type error:\s*===================([\S\s]+)========================\s*Alternative type errors:\s*========================([\S\s]+)$/

function parseExpectedTypecheckResultFromOutput(out: string): ExpectedTypecheckResult {
  out = out.trim()

  // Original typechecker returned nothing, therefore no type errors.
  if (out === "") {
    return { type: 'ok' }
  }

  if (!out.startsWith("An error occurred during typechecking")) {
    return { type: 'unknown' }
  }

  const primaryAndAlternativeErrorTagsMatch = TYPE_ERROR_OUTPUT_WITH_PRIMARY_AND_ALTERNATIVE_ERRORS_REGEX.exec(out)
  if (primaryAndAlternativeErrorTagsMatch) {
    const primaryTags = Array.from(primaryAndAlternativeErrorTagsMatch[1].matchAll(ERROR_TAG_REGEX), m => m[1])
    const alternativeTags = Array.from(primaryAndAlternativeErrorTagsMatch[2].matchAll(ERROR_TAG_REGEX), m => m[1])

    if (primaryTags.length === 0 || alternativeTags.length === 0) {
      return { type: 'unknown' }
    }

    return {
      type: 'type-error',
      primaryTags,
      alternativeTags,
    }
  }

  const errorTags = Array.from(out.matchAll(ERROR_TAG_REGEX), m => m[1])

  if (errorTags.length !== 1) {
    return { type: 'unknown' }
  }

  return {
    type: 'type-error',
    primaryTags: errorTags,
    alternativeTags: [],
  }
}

function getTestcaseConclusion(tc: {
  expectedOutput: string,
  actualOutput: string,
  actualExitCode: number,
}): TestcaseConclusion {
  const result = parseExpectedTypecheckResultFromOutput(tc.expectedOutput)
  switch (result.type) {
    case "ok":
      return tc.actualExitCode === 0 ? 'correct' : 'incorrect'
    case "type-error":
      if (tc.actualExitCode === 0) {
        return 'incorrect'
      } if (result.primaryTags.some(tag => tc.actualOutput.includes(tag))) {
        return 'correct'
      } else if (result.alternativeTags.some(tag => tc.actualOutput.includes(tag))) {
        return 'partially-correct'
      } else {
        return 'incorrect'
      }
    case "unknown":
      return 'unknown'
  }
}

async function execCmd({
  command,
  args = [],
  stdin,
}: {
  command: string,
  args?: string[],
  stdin: string,
}): Promise<{ exitCode: number, stdout: string, stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = (spawn as typeof nodeSpawn)(command, args, { stdio: 'pipe' })

    if (!proc.stdin) {
      reject(new Error('proc.stdin is null'))
      return
    }

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    proc.stdout?.on('data', (chunk) => stdoutChunks.push(chunk))
    proc.stderr?.on('data', (chunk) => stderrChunks.push(chunk))

    proc.on('close', (exitCode) => {
      resolve({
        exitCode: exitCode ?? 0,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: Buffer.concat(stderrChunks).toString(),
      })
    })

    proc.stdin.write(stdin, (err) => {
      if (err) {
        reject(err)
      }
    })
    proc.stdin.end()
  })
}

async function runTasks<I, O>({
  tasks,
  runner,
  parallelism,
  onResult,
  onError,
}: {
  tasks: I[],
  runner: (input: I) => Promise<O>,
  parallelism: number,
  onResult: (result: O) => void,
  onError: (error: Error) => void
}): Promise<void> {
  return new Promise((resolve) => {
    let nextTaskIndex = 0
    let runningTasks = 0

    const runNextTask = () => {
      if (nextTaskIndex >= tasks.length) {
        if (runningTasks === 0) {
          resolve()
        }
        return
      }

      const task = tasks[nextTaskIndex++]
      runningTasks++
      runner(task)
        .then((result) => {
          onResult(result)
        })
        .catch((err) => {
          onError(err as Error)
        })
        .finally(() => {
          runningTasks--
          runNextTask()
        })
    }

    for (let i = 0; i < parallelism; i++) {
      runNextTask()
    }
  })
}

async function main() {
  program
    .name('test-typechecker')
    .description('Test your Stella typechecker implementation against a set of .stella files and save the results to a JSON file.')
    //
    .argument('<tests-path>', 'path to directory with files to typecheck and .out files generated by correct Stella implementation')
    //
    .requiredOption('--cmd <command>', 'command to execute')
    .option('--args [arguments...]', 'arguments for the command')
    .option('-o, --out <path>', "path where to save typechecker results", "./typechecker-report.json")
    //
    .parse()

  const [testsDir] = program.args
  const options = program.opts()
  const reportPath = path.resolve(options.out)
  const typecheckerCmd = options.cmd
  const typecheckerArgs = options.args ?? []

  const srcFilePaths = await glob(path.resolve(testsDir, "**/*.stella").replace(/\\/g,'/'))

  console.log(`Testing typechecker with ${srcFilePaths.length} Stella files...`)
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(srcFilePaths.length, 0)

  const runTest = async (srcFilePath: string): Promise<[string, Report['testcases'][string]]> => {
    const outFilePath = srcFilePath.replace(/\.stella$/, '.stella.out')

    if (!(await fileExists(outFilePath))) {
      throw new Error(`No .stella.out file found for test ${srcFilePath}.`)
    }

    const snippet = (await fs.promises.readFile(srcFilePath)).toString()
    const expectedOutput = (await fs.promises.readFile(outFilePath)).toString()
    const result = await execCmd({
      command: typecheckerCmd,
      args: typecheckerArgs,
      stdin: snippet,
    })
    const conclusion = getTestcaseConclusion({
      expectedOutput,
      actualOutput: `${result.stdout}\n${result.stderr}`,
      actualExitCode: result.exitCode,
    })

    return [
      path.relative(testsDir, srcFilePath),
      {
        conclusion,
        snippet,
        expected: expectedOutput,
        exitCode: result.exitCode,
        actualStdout: result.stdout,
        actualStderr: result.stderr,
      },
    ]
  }

  const testcases: [string, Report['testcases'][string]][] = []
  await runTasks({
    tasks: srcFilePaths,
    runner: runTest,
    parallelism: getCoresCount(),
    onResult: (tc) => {
      testcases.push(tc)
      bar.increment(1)
    },
    onError: (err) => {
      console.warn(err.message)
      bar.increment(1)
    }
  })
  bar.stop()

  const report: Report = {
    testcases: Object.fromEntries(testcases)
  }
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
}

main()
