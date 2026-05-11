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
		<div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition">
			<h3 className="text-lg font-semibold mb-1">
				<Link
					to={`/submissions/${submission.id}`}
					className="text-white border-b-2 border-transparent hover:border-white">
					{submission.title || 'Untitled Submission'}
				</Link>
			</h3>

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

			<div className="mt-4 flex gap-4 text-sm text-gray-400">
				<span>Votes: {submission.voteCount}</span>
				<span>Score: {submission.totalScore}</span>
			</div>
		</div>
	)
}

export default SubmissionCard
