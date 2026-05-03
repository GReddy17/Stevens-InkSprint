// Get dynamic contest status based on startTime/endTime
export function getContestStatus(contest) {
  const now = new Date()
  const startTime = new Date(contest.startTime)
  const endTime = new Date(contest.endTime)
  const votingEndTime = new Date(
    endTime.getTime() + contest.votingDurationHours * 60 * 60 * 1000
  )

  if (now < startTime) return 'UPCOMING'
  if (now <= endTime) return 'ACTIVE'
  if (now <= votingEndTime) return 'VOTING'
  return 'COMPLETED'
}