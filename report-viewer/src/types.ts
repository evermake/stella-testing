import type { Report as ReportOriginal_ } from "../../scripts/types"

export type { TestcaseConclusion } from "../../scripts/types"

export type ReportOriginal = ReportOriginal_
export type Report = Omit<ReportOriginal, "testcases"> & {
  testcases: (ReportOriginal["testcases"][number] & {
    name: string
  })[]
}
export type ReportTestcase = Report["testcases"][number]
