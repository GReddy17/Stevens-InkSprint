import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import ContestCard from '../components/ContestCard'

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
			votingDurationHours
			wordMin
			wordMax
			submissionCount
		}
	}
`

function HomePage() {
	const [currentTime, setCurrentTime] = useState(Date.now())

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(Date.now())
		}, 1000)

		return () => clearInterval(intervalId)
	}, [])

	const { loading, error, data } = useQuery(GET_CONTESTS)

	const contests = data?.contests || []

	const upcomingContests = contests.filter((contest) => {
		const matchesStatus = contest.status === 'UPCOMING'

		return matchesStatus
	})
	const activeContests = contests.filter((contest) => {
		const matchesStatus = contest.status === 'ACTIVE'

		return matchesStatus
	})

	return (
		<div className="space-y-10">
			<section className="py-6">
				<div className="max-w-3xl">
					<p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-3">
						Creative writing competitions
					</p>

					<h1 className="text-4xl sm:text-5xl font-bold mb-4">Ink Sprint</h1>

					<p className="text-gray-400 text-lg leading-8">
						Browse writing contests, submit original stories, and compete with
						other writers through structured creative challenges.
					</p>
				</div>

				<div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-5 text-gray-400 leading-7">
					The Ink Sprint is a web application designed for hosting creative
					writing competitions where participants submit entries within a
					defined time window, after which submissions are reviewed and winners
					are selected.
				</div>
				<Link
					to="/contests/new"
					className="block text-center max-w-md bg-white text-gray-900 font-medium mx-auto my-6 py-2 rounded-lg hover:bg-gray-200 transition">
					Create a Contest
				</Link>
			</section>

			<section>
				<div className="mb-6 flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-semibold">Active Contests</h2>
					</div>
					<Link
						to={`/contests/`}
						className="block text-center w-42 bg-white text-gray-900 font-medium my-2 py-2 rounded-lg hover:bg-gray-200 transition">
						Browse All Contests
					</Link>
				</div>

				{loading && <p className="text-gray-400">Loading contests...</p>}

				{error && (
					<p className="text-red-400">
						Error loading contests: {error.message}
					</p>
				)}

				{!loading && !error && activeContests.length === 0 && (
					<div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
						<p className="text-gray-400">No contests found.</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
					{activeContests.map((contest) => (
						<ContestCard
							key={contest.id}
							contest={contest}
							currentTime={currentTime}
						/>
					))}
				</div>
			</section>
			<section>
				<div className="mb-6 flex justify-between items-center">
					<h2 className="text-2xl font-semibold">Upcoming Contests</h2>
					<Link
						to={`/contests/`}
						className="block text-center w-42 bg-white text-gray-900 font-medium my-2 py-2 rounded-lg hover:bg-gray-200 transition">
						Browse All Contests
					</Link>
				</div>

				{loading && <p className="text-gray-400">Loading contests...</p>}

				{error && (
					<p className="text-red-400">
						Error loading contests: {error.message}
					</p>
				)}

				{!loading && !error && upcomingContests.length === 0 && (
					<div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
						<p className="text-gray-400">No contests found.</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
					{upcomingContests.map((contest) => (
						<ContestCard
							key={contest.id}
							contest={contest}
							currentTime={currentTime}
						/>
					))}
				</div>
			</section>
		</div>
	)
}

export default HomePage
