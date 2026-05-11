import {
	formatDate,
	formatWordRange,
	getCountdownTarget,
	getSecondsRemaining,
	formatCountdown,
} from '../utils/contestHelpers'
import { Link } from 'react-router-dom'

function ContestCard({ contest, currentTime, dynamicStatus }) {
	const displayStatus = dynamicStatus || contest.status
	const countdownTarget = getCountdownTarget(contest, dynamicStatus)
	const secondsRemaining = getSecondsRemaining(countdownTarget, currentTime)
	const formattedCountdown = formatCountdown(secondsRemaining)

	return (
		<div
			key={contest.id}
			className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-500 transition">
			<div className="flex items-start justify-between gap-4 mb-4">
				<span
					className={`text-xs uppercase tracking-wide bg-gray-900 border border-gray-700 px-2 py-1 rounded-full
	            ${displayStatus === 'UPCOMING' && 'text-blue-300'}
	            ${displayStatus === 'ACTIVE' && 'text-green-300'}
	            ${displayStatus === 'VOTING' && 'text-orange-300'}
	            ${displayStatus === 'COMPLETED' && 'text-red-300'}
						`}>
					{displayStatus}
				</span>

				{formattedCountdown && (
					<span className="text-xs bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
						{displayStatus === 'UPCOMING' && `Starts in ${formattedCountdown}`}
						{displayStatus === 'ACTIVE' && `Ends in ${formattedCountdown}`}
						{displayStatus === 'VOTING' &&
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

			<div className="flex gap-3">
				<Link
					to={`/contests/${contest.id}`}
					className="flex-1 block text-center bg-white text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 transition">
					View Contest
				</Link>
			</div>
		</div>
	)
}

export default ContestCard