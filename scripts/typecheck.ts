import path from "node:path"
import fs from "node:fs"
import { program } from "commander"
import { glob } from "glob"
import cliProgress from "cli-progress"
import { chromium } from "playwright"
import { StellaRunner } from "../runner"

async function main() {
  program
    .name('typecheck')
    .description('Runs fizruk\'s Stella implementation over .stella programs and writes output to .out files.')
    //
    .argument('<tests-path>', 'path to directory with files to typecheck')
    //
    .option('-c, --clean', "delete generated output files", false)
    //
    .parse()

  const [testsDir] = program.args
  const options = program.opts()
  if (options.clean) {
    const outPaths = await glob(path.resolve(testsDir, "**/*.out"))
    for (const outPath of outPaths) {
      await fs.promises.rm(outPath)
    }
    console.log(`${outPaths.length} files deleted.`)
    return
  }

  const testPaths = await glob(path.resolve(testsDir, "**/*.stella"))

  console.log(`Found ${testPaths.length} Stella files, typechecking...`)

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(testPaths.length, 0);

  const browser = await chromium.launch({ headless: true });
  const runner = new StellaRunner(browser)

  for (const path of testPaths) {
    const source = await Bun.file(path).text()
    const result = await runner.typecheck(source)
    const out = result.ok ? "" : result.detail
    await Bun.write(Bun.file(path.replace(/\.stella$/, ".stella.out")), out)
    bar.increment(1)
  }
  bar.stop()

  await browser.close()
}

main();
