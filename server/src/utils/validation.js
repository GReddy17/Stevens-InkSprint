const VALID_STATUSES = ['UPCOMING', 'ACTIVE', 'CLOSED', 'VOTING', 'JUDGING', 'COMPLETED']
const VALID_VOTING_TYPES = ['EVERYONE', 'JUDGES', 'CREATOR', 'GROUP']

export function validateString(value, fieldName) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} must be a non-empty string`)
  }
  return value.trim()
}

export function validateEmail(email) {
  const trimmed = validateString(email, 'email')
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(trimmed)) throw new Error('Invalid email format')
  return trimmed.toLowerCase()
}

export function validateContestStatus(status) {
  const upper = status?.toUpperCase()
  if (!VALID_STATUSES.includes(upper)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  return upper
}

export function validateVotingType(type) {
  const upper = type?.toUpperCase()
  if (!VALID_VOTING_TYPES.includes(upper)) {
    throw new Error(`Invalid votingType. Must be one of: ${VALID_VOTING_TYPES.join(', ')}`)
  }
  return upper
}

export function validateDates(startTime, endTime) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (isNaN(start.getTime())) throw new Error('Invalid startTime')
  if (isNaN(end.getTime())) throw new Error('Invalid endTime')
  if (end <= start) throw new Error('endTime must be after startTime')
  return { start, end }
}

export function validatePoints(points) {
  if (!Number.isInteger(points) || points < 1 || points > 10) {
    throw new Error('Points must be an integer between 1 and 10')
  }
  return points
}

export function validateWordLimits(wordMin, wordMax) {
  if (wordMin !== null && wordMin !== undefined) {
    if (!Number.isInteger(wordMin) || wordMin < 0) {
      throw new Error('wordMin must be a non-negative integer')
    }
  }
  if (wordMax !== null && wordMax !== undefined) {
    if (!Number.isInteger(wordMax) || wordMax < 1) {
      throw new Error('wordMax must be a positive integer')
    }
    if (wordMin && wordMax <= wordMin) {
      throw new Error('wordMax must be greater than wordMin')
    }
    if (wordMax > 1000000) {
      throw new Error('wordMax cannot exceed 1,000,000')
    }
  }
}