import { useState } from 'react'
import { formatDate } from '../utils/contestHelpers'
import { gql, useQuery, useMutation } from '@apollo/client'
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
				status
				votingType
			}
		}
	}
`

const CAST_VOTE = gql`
	mutation CastVote($input: CastVoteInput!) {
		castVote(input: $input) {
			id
			points
			submission {
				id
				voteCount
				totalScore
			}
		}
	}
`

function SubmissionViewPage() {
	const { submissionId } = useParams()
	const [points, setPoints] = useState(10)
	const [voteMessage, setVoteMessage] = useState('')

	const { loading, error, data } = useQuery(GET_SUBMISSION, {
		variables: { submissionId },
		skip: !submissionId,
	})
	const [castVote, { loading: voteLoading }] = useMutation(CAST_VOTE)

	const handleVote = async () => {
		setVoteMessage('')

		if (!data?.submission) {
			setVoteMessage('Submission data is not available.')
			return
		}

		try {
			await castVote({
				variables: {
					input: {
						contestId: data.submission.contest.id,
						submissionId: data.submission.id,
						points,
					},
				},
				refetchQueries: [
					{
						query: GET_SUBMISSION,
						variables: { submissionId },
					},
				],
			})

			setVoteMessage('Vote submitted successfully.')
		} catch (error) {
			setVoteMessage(error.message || 'Failed to submit vote.')
		}
	}

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
						{submission.author?.displayName ||
							submission.author?.email ||
							'Unknown'}{' '}
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
				{submission.contest?.status === 'VOTING' && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
						<h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>

						<select
							value={points}
							onChange={(event) => setPoints(Number(event.target.value))}
							className="rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white">
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
								<option key={num} value={num}>
									{num}
								</option>
							))}
						</select>

						<button
							type="button"
							onClick={handleVote}
							disabled={voteLoading}
							className="ml-3 bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
							{voteLoading ? 'Submitting...' : 'Submit Vote'}
						</button>
						{voteMessage && (
							<p
								className={`text-sm mt-4 ${
									voteMessage.toLowerCase().includes('success')
										? 'text-green-400'
										: 'text-red-400'
								}`}>
								{voteMessage}
							</p>
						)}
					</div>
				)}

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
