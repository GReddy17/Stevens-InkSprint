import { Link } from 'react-router-dom'

const getPreviewText = (submission) => {
	if (submission.description) return submission.description
	if (!submission.content) return ''

	const words = submission.content.split(/\s+/)

	return words.length > 10
		? words.slice(0, 10).join(' ') + '...'
		: submission.content
}

const SubmissionCard = ({ submission }) => {
	return (
		<Link
			to={`/submissions/${submission.id}`}
			className="block bg-gray-800 border border-gray-700 rounded-xl p-4 hover:bg-gray-750 hover:border-gray-500 transition">
			<div className="flex items-start justify-between gap-3">
				<h3 className="text-lg font-semibold mb-1">
					{submission.title || 'Untitled Submission'}
				</h3>
				{submission.placement && (
					<span
						className={`text-xs px-2 py-1 rounded shrink-0 ${
							submission.placement === 1
								? 'bg-yellow-600'
								: submission.placement === 2
									? 'bg-gray-400 text-gray-900'
									: submission.placement === 3
										? 'bg-amber-700'
										: 'bg-gray-600'
						}`}>
						{submission.placement}
						{submission.placement === 1
							? 'st'
							: submission.placement === 2
								? 'nd'
								: submission.placement === 3
									? 'rd'
									: 'th'}
					</span>
				)}
			</div>

			<p className="text-sm text-gray-400 mb-3">
				by {submission.author?.displayName || 'Unknown'}
			</p>

			<p className="text-gray-300 line-clamp-3">{getPreviewText(submission)}</p>

			<div className="mt-4 flex gap-4 text-sm text-gray-400">
				<span>Votes: {submission.voteCount}</span>
				<span>Total Score: {submission.averageTotalScore}</span>
				<span>Style Score: {submission.averageStyleScore}</span>
				<span>Creativity Score: {submission.averageCreativityScore}</span>
				<span>Storytelling Score: {submission.averageStorytellingScore}</span>
				{submission.certificateUrl && (
					<span className="text-green-400">📜 cert</span>
				)}
			</div>
		</Link>
	)
}

export default SubmissionCard
