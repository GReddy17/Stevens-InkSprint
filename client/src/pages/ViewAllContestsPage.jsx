import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import ContestCard from '../components/ContestCard'
import SearchInput from '../components/SearchInput'

const GET_CONTESTS = gql`
	query GetContests {
		contests {
			id
			title
			prompt
			status
			startTime
			endTime
			votingType
			votingStartTime
			votingEndTime
			wordMin
			wordMax
			submissionCount
		}
	}
`

// Calculate contest status client-side based on current time
function getContestStatus(contest, now) {
	const startTime = new Date(+contest.startTime).getTime()
	const endTime = new Date(+contest.endTime).getTime()

	// Use explicit votingStartTime/votingEndTime only - no fallback
	const votingStartTime = contest.votingStartTime ? new Date(+contest.votingStartTime).getTime() : null
	const votingEndTime = contest.votingEndTime ? new Date(+contest.votingEndTime).getTime() : null

	if (now < startTime) return 'UPCOMING'
	if (now <= endTime) return 'ACTIVE'
	if (votingStartTime && now < votingStartTime) return 'ACTIVE'
	if (votingStartTime && votingEndTime && now >= votingStartTime && now <= votingEndTime) return 'VOTING'
	if (!votingStartTime || !votingEndTime) return 'COMPLETED'
	return 'COMPLETED'
}

function ViewAllContestsPage() {
	const [contestSearchTerm, setContestSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('ALL')
	const [currentTime, setCurrentTime] = useState(Date.now())

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(Date.now())
		}, 1000)

		return () => clearInterval(intervalId)
	}, [])

	const { loading, error, data } = useQuery(GET_CONTESTS, {
		pollInterval: 30000,
	})

	const contests = data?.contests || []

	// Calculate dynamic status for each contest
	const getDynamicStatus = (contest) => getContestStatus(contest, currentTime)

	const filteredContests = contests.filter((contest) => {
		const normalizedSearchTerm = contestSearchTerm.toLowerCase()

		const matchesSearch =
			contest.title.toLowerCase().includes(normalizedSearchTerm) ||
			contest.prompt.toLowerCase().includes(normalizedSearchTerm)

		const dynamicStatus = getDynamicStatus(contest)
		const matchesStatus =
			statusFilter === 'ALL' || dynamicStatus === statusFilter

		return matchesSearch && matchesStatus
	}).sort((a, b) => a.title.localeCompare(b.title))

	return (
		<div className="space-y-10">
			<Link
				to="/contests/new"
				className="block text-center max-w-md bg-white text-gray-900 font-medium mx-auto my-6 py-2 rounded-lg hover:bg-gray-200 transition">
				Create a Contest
			</Link>
			<section>
				<div className="flex flex-wrap items-end justify-between gap-4 mb-6">
					<div>
						<h2 className="text-2xl font-semibold">Browse Contests</h2>
						<p className="text-gray-400 mt-1">
							Search current and upcoming writing challenges.
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<SearchInput
							searchTerm={contestSearchTerm}
							setSearchTerm={setContestSearchTerm}
							placeholderText="Search contests..."
						/>

						<select
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
							className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-600">
							<option value="ALL">All</option>
							<option value="UPCOMING">Upcoming</option>
							<option value="ACTIVE">Active</option>
							<option value="VOTING">Voting</option>
							<option value="COMPLETED">Completed</option>
						</select>
					</div>
				</div>

				{loading && <p className="text-gray-400">Loading contests...</p>}

				{error && (
					<p className="text-red-400">
						Error loading contests: {error.message}
					</p>
				)}

				{!loading && !error && filteredContests.length === 0 && (
					<div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
						<p className="text-gray-400">No contests found.</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
					{filteredContests.map((contest) => (
						<ContestCard
							key={contest.id}
							contest={contest}
							currentTime={currentTime}
							dynamicStatus={getDynamicStatus(contest)}
						/>
					))}
				</div>
			</section>
		</div>
	)
}

export default ViewAllContestsPage
