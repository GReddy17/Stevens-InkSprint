export function formatDate(value) {
  const date = getDateFromValue(value)

  if (!date) return 'TBD'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatWordRange(contest) {
	if (contest.wordMin && contest.wordMax) {
		return `${contest.wordMin}-${contest.wordMax} words`
	}

	if (contest.wordMin) {
		return `Minimum ${contest.wordMin} words`
	}

	if (contest.wordMax) {
		return `Maximum ${contest.wordMax} words`  
	}

	return 'No word limit'
}

export function getDateFromValue(value) {
	if (!value) return null

	const date =
		typeof value === 'string' && /^\d+$/.test(value)
			? new Date(Number(value))
			: new Date(value)

	return Number.isNaN(date.getTime()) ? null : date
}

export function getCountdownTarget(contest, dynamicStatus) {
	if (!contest) return null

	const status = dynamicStatus || contest.status

	if (status === 'UPCOMING') return contest.startTime ? +contest.startTime : null
	if (status === 'ACTIVE') return contest.endTime ? +contest.endTime : null

	if (status === 'VOTING') {
		if (contest.votingEndTime) {
			return +contest.votingEndTime
		}
		return null
	}

	return null
}

export function getSecondsRemaining(target, currentTime) {
	if (!target) return null

	const targetDate = getDateFromValue(target)

	if (!targetDate) return null

	const difference = targetDate.getTime() - currentTime

	return Math.max(0, Math.floor(difference / 1000))
}

export function formatCountdown(totalSeconds) {
	if (totalSeconds === null) return null

	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return `${days}d ${hours}h ${minutes}m ${seconds}s`
}
