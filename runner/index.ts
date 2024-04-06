import fs from "node:fs"
import url from "node:url"
import path from "node:path"
import type { Browser } from "playwright"

const dir = path.resolve(url.fileURLToPath(import.meta.url), "..")

export class StellaRunner {
  constructor(private browser: Browser) { }

  async run(snippet: string, input: string): Promise<string> {
    await createStellaHtmlFile(snippet, input)

    const page = await this.browser.newPage();
    await page.goto(getStellaHtmlFileUrl());

    let result = null
    let tries = 100
    while (tries--) {
      const preEl = await page.$("#__app__ pre")
      result = await preEl!.innerText()
      if (result !== "loading...") {
        break
      }
      await sleep(100)
    }
    if (result === null) {
      throw new Error("Failed to run the snippet.");
    }

    await page.close()
    await deleteStellaHtmlFile()

    return result
  }

  async typecheck(snippet: string): Promise<TypecheckResult> {
    // Run Stella snippet with "panic!" exression as input.
    //
    // 1) In case of well-typed snippet, interpreter will print panic message
    // or return the successful output.
    //
    // 2) In case of ill-typed snippet, interpreter will fail with error
    // and print typechecking error message that starts with:
    // "An error occurred during typechecking!".
    const output = (await this.run(snippet, "panic!")).trim()

    if (output.toLowerCase().startsWith("an error occurred during typechecking")) {
      return { ok: false, output }
    } else {
      return { ok: true }
    }
  }
}

export type TypecheckResult =
  | { ok: true }
  | { ok: false, output: string }

async function deleteStellaHtmlFile() {
  fs.promises.rm(getStellaHtmlFilePath())
}

async function createStellaHtmlFile(snippet: string, input: string) {
  await fs.promises.writeFile(getStellaHtmlFilePath(), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stella</title>
</head>
<body>
  <div id="__app__"></div>
  <script>
    var myCodeMirror = {
      getValue: () => \`${escapeJs(snippet)}\`
    }
    var myCodeMirrorInput = {
      getValue: () => \`${escapeJs(input)}\`
    }
  </script>
  <script src="./_stella_src.js"></script>
</body>
</html>`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

function escapeJs(js: string): string {
  return js
    .replace(/\$\{/g, "\\${")
    .replace(/`/g, "\\`")
}

function getStellaHtmlFileUrl() {
  return `file://${getStellaHtmlFilePath()}`
}

function getStellaHtmlFilePath() {
  return path.resolve(dir, "tmp.html")
}
