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
    while (true) {
      const preEl = await page.$("#__app__ pre")
      result = await preEl!.innerText()
      if (result !== "loading...") {
        break
      }
      await sleep(500)
    }

    await page.close()
    await deleteStellaHtmlFile()

    return result
  }

  async typecheck(snippet: string): Promise<TypecheckResult> {
    const dummyVarName = randomStr("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 16)

    // Run Stella snippet with dummy variable as an input.
    // In case of well-typed snippet, interpreter will start typechecking the
    // input and will try to run it and fail with "undefined variable" error.
    const output = (await this.run(snippet, dummyVarName)).trim()

    if (output.includes("[ERROR_UNDEFINED_VARIABLE]") && output.includes(dummyVarName)) {
      return { ok: true }
    } else {
      return { ok: false, output }
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

function randomStr(alphabet: string, len: number) {
  let result = ""
  for (let i = 0; i < len; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return result
}
