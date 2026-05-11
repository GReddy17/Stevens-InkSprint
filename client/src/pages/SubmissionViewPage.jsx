import { formatDate } from '../utils/contestHelpers'
import { gql, useQuery } from '@apollo/client'
import { useParams, Link } from 'react-router-dom'

const GET_SUBMISSION = gql`
	query GetSubmission($submissionId: ID!) {
		submission(id: $submissionId) {
			id
			title
			description
			content
			submittedAt
			author {
				id
				displayName
				email
			}
			voteCount
			totalScore
			placement
			certificateUrl
			certificateGeneratedAt
			contest {
				id
				title
			}
		}
	}
`

function SubmissionViewPage() {
	const { submissionId } = useParams()

	const { loading, error, data } = useQuery(GET_SUBMISSION, {
		variables: { submissionId },
		skip: !submissionId,
	})

	if (loading) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Submission</h1>
					<p className="text-gray-400">Loading submission...</p>
				</div>
			</div>
		)
	}

	if (error || !data?.submission) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Submission</h1>
					<p className="text-red-400">
						{error?.message || 'Submission not found.'}
					</p>
				</div>
			</div>
		)
	}

	const submission = data.submission

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">
					{submission.title || 'Untitled Submission'}
				</h1>

				<div className="flex justify-between items-center mb-6">
					<p className="text-gray-400">
						By{' '}
						{submission.author?.id ? (
							<Link
								to={`/profiles/${submission.author.id}`}
								className="text-gray-300 border-b border-transparent hover:text-white hover:border-white">
								{submission.author.displayName ||
									submission.author.email ||
									'Unknown'}
							</Link>
						) : (
							submission.author?.displayName ||
							submission.author?.email ||
							'Unknown'
						)}{' '}
						• Submitted {formatDate(submission.submittedAt)}
					</p>

					{submission.contest && (
						<Link
							to={`/contests/${submission.contest.id}`}
							className="text-sm bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-700">
							← Back to Contest
						</Link>
					)}
				</div>

				{submission.description && (
					<p className="text-gray-300 my-6">
						Description: {submission.description}
					</p>
				)}

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
						{submission.placement != null && (
							<span className="bg-gray-700 rounded-full px-3 py-1">
								Placement: {submission.placement}
							</span>
						)}

						<span className="bg-gray-700 rounded-full px-3 py-1">
							Total Score: {submission.totalScore}
						</span>

						<span className="bg-gray-700 rounded-full px-3 py-1">
							Votes: {submission.voteCount}
						</span>
					</div>

					<p className="text-gray-200 leading-7 whitespace-pre-line">
						{submission.content}
					</p>
				</div>

				{submission.certificateUrl && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
						<h2 className="text-xl font-semibold mb-2">Certificate</h2>
						<p className="text-gray-400 text-sm">
							Certificate available at: {submission.certificateUrl}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default SubmissionViewPage
