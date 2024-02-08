export type TestcaseConclusion =
  | 'incorrect'
  | 'correct'
  | 'partially-correct'
  | 'unknown'

export type Report = {
  testcases: Record<string, {
    conclusion: TestcaseConclusion,
    snippet: string,
    expected: string,
    actualStdout: string,
    actualStderr: string,
    exitCode: number
  }>
}
