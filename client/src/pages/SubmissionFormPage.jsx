import { useMemo, useState } from 'react'
import { getMockContest } from '../services/submissionService'

function SubmissionFormPage() {
	const contest = getMockContest()

	const [submissionTitle, setSubmissionTitle] = useState('')
	const [submissionContent, setSubmissionContent] = useState('')
	const [submitMessage, setSubmitMessage] = useState('')

	const wordCount =
		submissionContent.trim() === ''
			? 0
			: submissionContent.trim().split(/\s+/).length

	function handleSubmit(event) {
		event.preventDefault()

		if (isOverWordLimit) {
			setSubmitMessage('Your submission is over the word limit.')
			return
		}

		const mockPayload = {
			contestId: contest.id,
			title: submissionTitle,
			content: submissionContent,
			submittedAt: new Date().toISOString(),
		}

		console.log('Mock submission payload:', mockPayload)
		setSubmitMessage('Submission saved locally for now (mock flow).')
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

					<div className="space-y-2 text-sm text-gray-400">
						<p>
							<span className="font-medium text-gray-300">Rules:</span>{' '}
							{contest.rules}
						</p>
						<p>
							<span className="font-medium text-gray-300">Ends:</span>{' '}
							{contest.endTime}
						</p>
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
						/>
					</div>

					<div>
						<label
							htmlFor="submissionContent"
							className="block mb-2 font-medium">
							Story Content
						</label>
						<textarea
							id="submissionContent"
							value={submissionContent}
							onChange={(event) => setSubmissionContent(event.target.value)}
							className="w-full min-h-75 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Write your story here..."
							required
						/>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3 text-sm">
						<p className='text-gray-400'>
							Word Count: {wordCount}
						</p>

						<button
							type="submit"
							className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50"
							>
							Submit Story
						</button>
					</div>

					{submitMessage && (
						<p className="text-sm text-green-400">{submitMessage}</p>
					)}
				</form>
			</div>
		</div>
	)
}

export default SubmissionFormPage
