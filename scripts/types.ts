export type Report = {
  testcases: Record<string, {
    snippet: string,
    expected: string,
    actualStdout: string,
    actualStderr: string,
    exitCode: number
  }>
}
