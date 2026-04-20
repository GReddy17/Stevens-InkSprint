import { mockContest } from '../mock/mockContest'
import { mockSubmissions } from '../mock/mockSubmissions'

export function getMockContest() {
  return mockContest
}

export function getMockSubmissionById(submissionId) {
  return (
    mockSubmissions.find((submission) => submission.id === submissionId) || null
  )
}