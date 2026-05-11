import { gql, useMutation, useQuery } from '@apollo/client'
import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getCountdownTarget, formatCountdown, getSecondsRemaining } from '../utils/contestHelpers'

const GET_CONTEST = gql`
	query GetContest($contestId: ID!) {
		contest(id: $contestId) {
			id
			title
			prompt
			rules
			startTime
			endTime
			votingStartTime
			votingEndTime
			wordMin
			wordMax
		}
	}
`

const CREATE_SUBMISSION = gql`
	mutation CreateSubmission($input: CreateSubmissionInput!) {
		createSubmission(input: $input) {
			id
			title
			description
			content
			submittedAt
		}
	}
`

function SubmissionFormPage() {
	const { contestId } = useParams()
	const [submissionTitle, setSubmissionTitle] = useState('')
	const [submissionDescription, setSubmissionDescription] = useState('')
	const [submissionContent, setSubmissionContent] = useState('')
	const [submitMessage, setSubmitMessage] = useState('')
	const [currentTime, setCurrentTime] = useState(Date.now())
	const navigate = useNavigate()

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(Date.now())
		}, 1000)
		return () => clearInterval(intervalId)
	}, [])

	const { loading, error, data } = useQuery(GET_CONTEST, {
		variables: { contestId },
		skip: !contestId,
	})

	const [createSubmission, { loading: isSubmitting }] =
		useMutation(CREATE_SUBMISSION)

	const contest = data?.contest

	// Check if submission period has ended
	const isSubmissionEnded = contest && currentTime > new Date(+contest.endTime).getTime()

	// Countdown timer
	const target = contest ? new Date(+contest.endTime).getTime() : null
	const secondsRemaining = getSecondsRemaining(target, currentTime)
	const countdown = formatCountdown(secondsRemaining)

	const wordCount = useMemo(() => {
		return submissionContent.trim() === ''
			? 0
			: submissionContent.trim().split(/\s+/).length
	}, [submissionContent])

	const isOverWordMax = contest?.wordMax != null && wordCount > contest.wordMax
	const isUnderWordMin = contest?.wordMin != null && wordCount < contest.wordMin

	async function handleSubmit(event) {
		event.preventDefault()
		setSubmitMessage('')

		if (!contest) {
			setSubmitMessage('Contest data is not available.')
			return
		}

		if (isSubmissionEnded) {
			setSubmitMessage('Submission period has ended. Better luck next time!')
			return
		}

		if (isOverWordMax) {
			setSubmitMessage('Your submission is over the word limit.')
			return
		}

		if (isUnderWordMin) {
			setSubmitMessage('Your submission is under the minimum word count.')
			return
		}

		try {
			const { data } = await createSubmission({
				variables: {
					input: {
						contestId: contest.id,
						title: submissionTitle,
						description: submissionDescription,
						content: submissionContent,
					},
				},
				refetchQueries: ['GetContest'],
				awaitRefetchQueries: true,
			})

			const newSubmissionId = data.createSubmission.id
			navigate(`/submissions/${newSubmissionId}`)
			setSubmitMessage('Submission created successfully.')
			setSubmissionTitle('')
			setSubmissionDescription('')
			setSubmissionContent('')
		} catch (error) {
			setSubmitMessage(error.message || 'Failed to create submission.')
		}
	}

	if (loading) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-gray-400">Loading contest...</p>
				</div>
			</div>
		)
	}

	if (error || !contest) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-red-400">
						{error?.message || 'Contest could not be loaded.'}
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Submit Your Story</h1>
				<p className="text-gray-400 mb-8">
					Create your submission for this contest.
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<h2 className="text-2xl font-semibold mb-2">{contest.title}</h2>
					<p className="text-gray-300 mb-4">{contest.prompt}</p>

					{isSubmissionEnded ? (
						<div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
							<p className="text-red-400 font-medium">
								Submission period has ended. Better luck next time!
							</p>
						</div>
					) : countdown && (
						<div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
							<p className="text-yellow-400 text-sm">
								Time remaining: <span className="font-medium">{countdown}</span>
							</p>
						</div>
					)}

					<div className="space-y-2 text-sm text-gray-400">
						<p>
							<span className="font-medium text-gray-300">Rules:</span>{' '}
							{contest.rules || 'No additional rules provided.'}
						</p>
						<p>
							<span className="font-medium text-gray-300">Ends:</span>{' '}
							{new Date(+contest.endTime).toLocaleString()}
						</p>
						{contest.wordMin != null && (
							<p>
								<span className="font-medium text-gray-300">Minimum Words:</span>{' '}
								{contest.wordMin}
							</p>
						)}
						{contest.wordMax != null && (
							<p>
								<span className="font-medium text-gray-300">Maximum Words:</span>{' '}
								{contest.wordMax}
							</p>
						)}
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
					<div>
						<label htmlFor="submissionTitle" className="block mb-2 font-medium">
							Submission Title
						</label>
						<input
							id="submissionTitle"
							type="text"
							value={submissionTitle}
							onChange={(event) => setSubmissionTitle(event.target.value)}
							className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Enter a title for your story"
							required
							disabled={isSubmissionEnded}
						/>
					</div>

					<div>
						<label htmlFor="submissionDescription" className="block mb-2 font-medium">
							Short Description
						</label>
						<input
							id="submissionDescription"
							type="text"
							value={submissionDescription}
							onChange={(event) => setSubmissionDescription(event.target.value)}
							className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Optional short description"
							disabled={isSubmissionEnded}
						/>
					</div>

					<div>
						<label htmlFor="submissionContent" className="block mb-2 font-medium">
							Story Content
						</label>
						<textarea
							id="submissionContent"
							value={submissionContent}
							onChange={(event) => setSubmissionContent(event.target.value)}
							className="w-full min-h-75 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Write your story here..."
							required
							disabled={isSubmissionEnded}
						/>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
						<div className="space-y-1">
							<p className={isOverWordMax || isUnderWordMin ? 'text-red-400' : 'text-gray-400'}>
								Word Count: {wordCount}
							</p>
							{contest.wordMin != null && (
								<p className="text-gray-500">Minimum: {contest.wordMin}</p>
							)}
							{contest.wordMax != null && (
								<p className="text-gray-500">Maximum: {contest.wordMax}</p>
							)}
						</div>

						<button
							type="submit"
							className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isOverWordMax || isUnderWordMin || isSubmitting || isSubmissionEnded}>
							{isSubmitting ? 'Submitting...' : isSubmissionEnded ? 'Submissions Closed' : 'Submit Story'}
						</button>
					</div>

					{submitMessage && (
						<p className={`text-sm ${submitMessage.toLowerCase().includes('success') ? 'text-green-400' : 'text-red-400'}`}>
							{submitMessage}
						</p>
					)}
				</form>
			</div>
		</div>
	)
}

export default SubmissionFormPage