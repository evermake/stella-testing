export type Report = {
  testcases: Record<string, {
    passed: boolean | null,
    snippet: string,
    expected: string,
    actualStdout: string,
    actualStderr: string,
    exitCode: number
  }>
}
