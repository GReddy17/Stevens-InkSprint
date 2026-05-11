import { gql, useQuery } from '@apollo/client'
import { formatDate, getCountdownTarget, formatCountdown, getSecondsRemaining } from '../utils/contestHelpers'
import { useParams, Link } from 'react-router-dom'
import SubmissionCard from '../components/SubmissionCard'
import { useState, useEffect } from 'react'

const GET_CONTEST = gql`
	query GetContest($contestId: ID!) {
		contest(id: $contestId) {
			id
			title
			prompt
			rules
			startTime
			endTime
			status
			votingType
			votingStartTime
			votingEndTime
			wordMin
			wordMax
			submissionCount

			submissions {
				id
				title
				description
				content
				voteCount
				averageTotalScore
				averageStyleScore
				averageCreativityScore
				averageStorytellingScore
				submittedAt
				placement
				certificateUrl
				author {
					id
					displayName
				}
			}
		}
	}
`

function ContestViewPage() {
	const { contestId } = useParams()
	const [sortBy, setSortBy] = useState('totalScore')
	const [currentTime, setCurrentTime] = useState(Date.now())

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(Date.now())
		}, 1000)
		return () => clearInterval(intervalId)
	}, [])

	const { loading, error, data } = useQuery(GET_CONTEST, {
		variables: { contestId },
		skip: !contestId,
	})

	const contest = data?.contest

	// Calculate dynamic status client-side
	const getDynamicStatus = (c, now) => {
		if (!c) return 'UPCOMING'
		const startTime = new Date(+c.startTime).getTime()
		const endTime = new Date(+c.endTime).getTime()

		// Use explicit votingStartTime/votingEndTime only - no fallback
		const votingStartTime = c.votingStartTime ? new Date(+c.votingStartTime).getTime() : null
		const votingEndTime = c.votingEndTime ? new Date(+c.votingEndTime).getTime() : null

		if (now < startTime) return 'UPCOMING'
		if (now <= endTime) return 'ACTIVE'
		if (votingStartTime && now < votingStartTime) return 'ACTIVE'
		if (votingStartTime && votingEndTime && now >= votingStartTime && now <= votingEndTime) return 'VOTING'
		if (!votingStartTime || !votingEndTime) return 'COMPLETED'
		return 'COMPLETED'
	}

	const dynamicStatus = getDynamicStatus(contest, currentTime)

	const sortedSubmissions = [...(contest?.submissions || [])].sort((a, b) => {
		if (sortBy === 'submittedAt') {
			return new Date(b.submittedAt) - new Date(a.submittedAt)
		}

		return (b[sortBy] ?? 0) - (a[sortBy] ?? 0)
	})

	if (loading) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-gray-400">Loading contest...</p>
				</div>
			</div>
		)
	}

	if (error || !contest) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Contest</h1>
					<p className="text-red-400">
						{error?.message || 'Contest not found.'}
					</p>
				</div>
			</div>
		)
	}

	// Calculate countdown
	const target = getCountdownTarget(contest, dynamicStatus)
	const seconds = getSecondsRemaining(target, currentTime)
	const countdown = formatCountdown(seconds)

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<Link
					to={`/contests/`}
					className="block bg-white border border-gray-700 text-center text-gray-900 font-medium max-w-48 px-5 py-2.5 mb-6 rounded-lg hover:bg-gray-200">
					&larr; Back to Contests
				</Link>
				<div className="flex flex-wrap items-start justify-between gap-3 mb-2">
					<h1 className="text-3xl font-bold">{contest.title}</h1>
					<span className="text-xs uppercase tracking-wide bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-gray-300">
						{dynamicStatus}
					</span>
				</div>
				{countdown && (
					<span className="text-sm bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-yellow-400 mb-4 inline-block">
						{dynamicStatus === 'UPCOMING' && `Starts in ${countdown}`}
						{dynamicStatus === 'ACTIVE' && `Ends in ${countdown}`}
						{dynamicStatus === 'VOTING' && `Voting ends in ${countdown}`}
					</span>
				)}
				<p className="text-gray-400 mb-8">
					{formatDate(contest.startTime)} - {formatDate(contest.endTime)}
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<h2 className="text-xl font-semibold mb-2">Prompt</h2>
					<p className="text-gray-200 leading-7 whitespace-pre-line">
						{contest.prompt}
					</p>
				</div>

				{contest.rules && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
						<h2 className="text-xl font-semibold mb-2">Rules</h2>
						<p className="text-gray-300 whitespace-pre-line">{contest.rules}</p>
					</div>
				)}

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<h2 className="text-xl font-semibold mb-3">Details</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<dt className="text-gray-400">Voting Type</dt>
							<dd className="text-gray-200">
								{contest.votingType || 'EVERYONE'}
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Voting End</dt>
							<dd className="text-gray-200">
								{contest.votingEndTime
									? new Date(+contest.votingEndTime).toLocaleString()
									: 'Not set'}
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Min Words</dt>
							<dd className="text-gray-200">
								{contest.wordMin ?? 'No minimum'}
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Max Words</dt>
							<dd className="text-gray-200">
								{contest.wordMax ?? 'No maximum'}
							</dd>
						</div>
					</dl>
				</div>

				<div className="flex flex-col gap-4">
					{dynamicStatus === 'ACTIVE' && (
						<Link
							to={`/contests/${contest.id}/submit`}
							className="bg-white border border-gray-700 text-center text-gray-900 font-medium max-w-48 self-center px-5 py-2.5 mb-6 rounded-lg hover:bg-gray-200">
							Submit an Entry
						</Link>
					)}

					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold">Submissions</h2>
							<div>
								<span className="mr-4">Sort By:</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-600">
									<option value="submittedAt">Submission Date</option>
									<option value="averageTotalScore">Total Score</option>
									<option value="averageStyleScore">Style</option>
									<option value="averageCreativityScore">Creativity</option>
									<option value="averageStorytellingScore">Storytelling</option>
								</select>
							</div>
					</div>

					{contest.submissionCount === 0 ? (
						<p className="text-gray-400">No submissions yet.</p>
					) : (
						<div className="grid gap-4">
							{sortedSubmissions.map((submission) => (
								<SubmissionCard key={submission.id} submission={submission} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ContestViewPage