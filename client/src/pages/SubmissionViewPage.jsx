import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

const GET_SUBMISSION = gql`
  query GetSubmission($submissionId: ID!) {
    submission(id: $submissionId) {
      id
      title
      description
      content
      submittedAt
      authorId
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
				<h1 className="text-3xl font-bold mb-2">{submission.title}</h1>
				<p className="text-gray-400 mb-8">
					By {submission.author?.displayName || submission.author?.email || 'Unknown'} • Submitted{' '}
					{new Date(submission.submittedAt).toLocaleString()}
				</p>
				{submission.description && (
					<p className="text-gray-300 mb-6">{submission.description}</p>
				)}

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
						{submission.placement != null && (
							<span className="bg-gray-700 rounded-full px-3 py-1">
								Placement: {submission.placement}
							</span>
						)}

						{submission.totalScore != null && (
							<span className="bg-gray-700 rounded-full px-3 py-1">
								Total Score: {submission.totalScore}
							</span>
						)}

						{submission.voteCount != null && (
							<span className="bg-gray-700 rounded-full px-3 py-1">
								Votes: {submission.voteCount}
							</span>
						)}
					</div>

					<p className="text-gray-200 leading-7 whitespace-pre-line">
						{submission.content}
					</p>
				</div>
			</div>
		</div>
	)
}

export default SubmissionViewPage
