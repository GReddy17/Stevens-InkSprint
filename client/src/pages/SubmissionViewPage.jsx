import { getMockSubmissionById } from '../services/submissionService'

function SubmissionViewPage() {
	const submission = getMockSubmissionById('submission-1')

	if (!submission) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Submission</h1>
					<p className="text-red-400">Submission not found.</p>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">{submission.title}</h1>
				<p className="text-gray-400 mb-8">
					By {submission.authorName} • Submitted{' '}
					{new Date(submission.submittedAt).toLocaleString()}
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<p className="text-gray-200 leading-7 whitespace-pre-line">
						{submission.content}
					</p>
				</div>

				{submission.feedback && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
						<h2 className="text-xl font-semibold mb-3">Judge Feedback</h2>
						<p className="text-gray-300">{submission.feedback}</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default SubmissionViewPage
