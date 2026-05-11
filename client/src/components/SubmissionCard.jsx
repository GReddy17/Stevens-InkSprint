import { Link } from 'react-router-dom'

const getPreviewText = (submission) => {
	if (submission.description) return submission.description
	if (!submission.content) return ''

	const words = submission.content.split(/\s+/)

	return words.length > 10
		? words.slice(0, 10).join(' ') + '...'
		: submission.content
}

// Added two helper functions to make things a bit cleaner
const getPlacementSuffix = (placement) => {
	// Handle edge cases for 11th, 12th, 13th
	const lastTwoDigits = placement % 100
	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return 'th'
	}

	// Handle regular cases
	switch (placement % 10) {
		case 1:
			return 'st'
		case 2:
			return 'nd'
		case 3:
			return 'rd'
		default:
			return 'th'
	}
}

const getPlacementColor = (placement) => {
	switch (placement) {
		case 1:
			return 'bg-yellow-600'
		case 2:
			return 'bg-gray-400 text-gray-900'
		case 3:
			return 'bg-amber-700'
		default:
			return 'bg-gray-600'
	}
}

const SubmissionCard = ({ submission }) => {
	return (
		<div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition">
			<div className="flex items-start justify-between gap-3">
				<h3 className="text-lg font-semibold mb-1">
					<Link
						to={`/submissions/${submission.id}`}
						className="text-white border-b-2 border-transparent hover:border-white">
						{submission.title || 'Untitled Submission'}
					</Link>
				</h3>

				{submission.placement && (
					<span
						className={`text-xs px-2 py-1 rounded shrink-0 ${getPlacementColor(
							submission.placement
						)}`}>
						{submission.placement}
						{getPlacementSuffix(submission.placement)}
					</span>
				)}
			</div>

			<p className="text-sm text-gray-400 mb-3">
				by{' '}
				{submission.author?.id ? (
					<Link
						to={`/profiles/${submission.author.id}`}
						className="text-gray-300 border-b border-transparent hover:text-white hover:border-white">
						{submission.author.displayName || 'Unknown'}
					</Link>
				) : (
					submission.author?.displayName || 'Unknown'
				)}
			</p>

			<p className="text-gray-300 line-clamp-3">{getPreviewText(submission)}</p>

			<div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
				<span>Votes: {submission.voteCount}</span>
				<span>Total Score: {submission.averageTotalScore}</span>
				<span>Style Score: {submission.averageStyleScore}</span>
				<span>Creativity Score: {submission.averageCreativityScore}</span>
				<span>Storytelling Score: {submission.averageStorytellingScore}</span>
				{submission.certificateUrl && (
					<span className="text-green-400">📜 cert</span>
				)}
			</div>
		</div>
	)
}

export default SubmissionCard
