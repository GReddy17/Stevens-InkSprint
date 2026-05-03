import {
	formatDate,
	formatWordRange,
	getCountdownTarget,
	getSecondsRemaining,
	formatCountdown,
} from '../utils/contestHelpers'
import { Link } from 'react-router-dom'

function ContestCard({ contest, currentTime }) {
	const countdownTarget = getCountdownTarget(contest)
	const secondsRemaining = getSecondsRemaining(countdownTarget, currentTime)
	const formattedCountdown = formatCountdown(secondsRemaining)

	return (
		<div
			key={contest.id}
			className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-500 transition">
			<div className="flex items-start justify-between gap-4 mb-4">
				<span
					className={`text-xs uppercase tracking-wide bg-gray-900 border border-gray-700 px-2 py-1 rounded-full 
            ${contest.status === 'UPCOMING' && 'text-blue-300'} 
            ${contest.status === 'ACTIVE' && 'text-green-300'}
            ${contest.status === 'VOTING' && 'text-orange-300'}
            ${contest.status === 'COMPLETED' && 'text-red-300'}
					`}>
					{contest.status}
				</span>

				{formattedCountdown && (
					<span className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
						{contest.status === 'UPCOMING' && `Starts in ${formattedCountdown}`}
						{contest.status === 'ACTIVE' && `Ends in ${formattedCountdown}`}
						{contest.status === 'VOTING' &&
							`Voting ends in ${formattedCountdown}`}
					</span>
				)}
			</div>

			<h3 className="text-xl font-semibold mb-2">{contest.title}</h3>

			<p className="text-gray-300 leading-6 mb-5">{contest.prompt}</p>

			<div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-5">
				<span className="bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
					{formatWordRange(contest)}
				</span>

				<span className="bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
					Ends {formatDate(contest.endTime)}
				</span>

				<span className="bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
					{contest.submissionCount} submissions
				</span>

				<span className="bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
					{contest.votingType} voting
				</span>
			</div>

			<Link
				to={`/contests/${contest.id}`}
				className="block text-center w-full bg-white text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition">
				View Contest
			</Link>
		</div>
	)
}

export default ContestCard
