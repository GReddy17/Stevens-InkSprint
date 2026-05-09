import { useState } from 'react'
import { formatDate } from '../utils/contestHelpers'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useParams, Link, useNavigate } from 'react-router-dom'

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
			styleScore
			creativityScore
			storytellingScore
			totalScore
			averageTotalScore
			averageStyleScore
			averageCreativityScore
			averageStorytellingScore
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
			styleScore
			creativityScore
			storytellingScore
			totalScore
			submission {
				id
				voteCount
				styleScore
				creativityScore
				storytellingScore
				totalScore
			}
		}
	}
`

function SubmissionViewPage() {
	const navigate = useNavigate()
	const { submissionId } = useParams()
	const [styleScore, setStyleScore] = useState(5)
	const [creativityScore, setCreativityScore] = useState(5)
	const [storytellingScore, setStorytellingScore] = useState(5)
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
						styleScore,
						creativityScore,
						storytellingScore,
					},
				},
				refetchQueries: [
					{
						query: GET_SUBMISSION,
						variables: { submissionId },
					},
				],
				awaitRefetchQueries: true,
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
							Total Score:{' '}
							{submission.voteCount > 0
								? `${submission.averageTotalScore.toFixed(2)} / 15`
								: 'No votes yet'}
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

						<div className="flex flex-col sm:flex-row gap-4">
							{[
								['Style', styleScore, setStyleScore],
								['Creativity', creativityScore, setCreativityScore],
								['Storytelling', storytellingScore, setStorytellingScore],
							].map(([label, value, setter]) => (
								<div key={label} className="sm:w-1/3">
									<label className="block mb-2 text-sm text-gray-300">
										{label}
									</label>
									<select
										value={value}
										onChange={(event) => setter(Number(event.target.value))}
										className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white">
										{[1, 2, 3, 4, 5].map((num) => (
											<option key={num} value={num}>
												{num}
											</option>
										))}
									</select>
								</div>
							))}
						</div>

						<button
							type="button"
							onClick={handleVote}
							disabled={voteLoading}
							className="ml-2 mt-5 bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
							{voteLoading ? 'Submitting...' : 'Submit Vote'}
						</button>
						{voteMessage && (
							<div>
								<p
									className={`text-sm mt-4 ${
										voteMessage.toLowerCase().includes('vote submitted')
											? 'text-green-400'
											: 'text-red-400'
									}`}>
									{voteMessage}
								</p>
								{voteMessage !== '' && (
									<p className="my-2">
										<Link
											to={`/contests/${data.submission.contest.id}`}
											className="underline underline-offset-3">
											&larr; Back to contest
										</Link>
									</p>
								)}
							</div>
						)}
					</div>
				)}

				{submission.certificateUrl && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
						<h2 className="text-xl font-semibold mb-2">Certificate</h2>
						<p className="text-gray-400 text-sm mb-4">
							{submission.placement === 1 && '🏆 Congratulations on your win!'}
							{submission.placement === 2 && '🥈 Great job on second place!'}
							{submission.placement === 3 && '🥉 Nice work on third place!'}
							{submission.placement > 3 &&
								`You placed ${submission.placement}th`}
						</p>
						<a
							href={`http://localhost:4000${submission.certificateUrl}`}
							download
							className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
							Download Certificate
						</a>
					</div>
				)}
			</div>
		</div>
	)
}

export default SubmissionViewPage
