import { useState } from 'react'

function ContestFormPage() {
	const [title, setTitle] = useState('')
	const [prompt, setPrompt] = useState('')
	const [rules, setRules] = useState('')

	// start and end time
	const [startTime, setStartTime] = useState('')
	const [endTime, setEndTime] = useState('')

	// voting type
	const [votingType, setVotingType] = useState('EVERYONE')
	const [votingDurationHours, setVotingDurationHours] = useState(48)

	// word count limits (OPTIONAL)
	const [wordMin, setWordMin] = useState('')
	const [wordMax, setWordMax] = useState('')

	const [submitting, setSubmitting] = useState(false)
	const [submitMessage, setSubmitMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	function validate() {
		if (!title.trim()) return 'Title is required.'
		if (!prompt.trim()) return 'Prompt is required.'
		if (!startTime) return 'Start time is required.'
		if (!endTime) return 'End time is required.'
		if (new Date(endTime) <= new Date(startTime)) {
			return 'End time must be after start time.'
		}

		const minNum = wordMin === '' ? null : Number(wordMin)
		const maxNum = wordMax === '' ? null : Number(wordMax)
		if (minNum !== null && (Number.isNaN(minNum) || minNum < 0)) {
			return 'Minimum words must be a non-negative number.'
		}
		if (maxNum !== null && (Number.isNaN(maxNum) || maxNum < 0)) {
			return 'Maximum words must be a non-negative number.'
		}
		if (minNum !== null && maxNum !== null && maxNum < minNum) {
			return 'Maximum words must be greater than or equal to minimum words.'
		}
		return ''
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setSubmitMessage('')
		setErrorMessage('')

		const validationError = validate()
		if (validationError) {
			setErrorMessage(validationError)
			return
		}

		const payload = {
			title: title.trim(),
			prompt: prompt.trim(),
			rules: rules.trim(),
			startTime: new Date(startTime).toISOString(),
			endTime: new Date(endTime).toISOString(),
			votingType,
			votingDurationHours: Number(votingDurationHours) || 48,
			wordMin: wordMin === '' ? null : Number(wordMin),
			wordMax: wordMax === '' ? null : Number(wordMax),
		}

		setSubmitting(true)
		try {
			// TODO: replace with backend call!!
			console.log('Mock contest payload:', payload)
			setSubmitMessage('Contest saved locally for now (mock flow).')
		} catch (err) {
			setErrorMessage(err.message || 'Failed to create contest.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Create a Contest</h1>
				<p className="text-gray-400 mb-8">
					Set up a new writing contest for the community.
				</p>

				<form
					onSubmit={handleSubmit}
					className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
					<div>
						<label htmlFor="title" className="block mb-2 font-medium">
							Title
						</label>
						<input
							id="title"
							type="text"
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="e.g. Horror Story Challenge"
							required
						/>
					</div>

					<div>
						<label htmlFor="prompt" className="block mb-2 font-medium">
							Prompt
						</label>
						<textarea
							id="prompt"
							value={prompt}
							onChange={(event) => setPrompt(event.target.value)}
							className="w-full min-h-32 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Describe the writing prompt..."
							required
						/>
					</div>

					<div>
						<label htmlFor="rules" className="block mb-2 font-medium">
							Rules <span className="text-gray-500 text-sm">(optional)</span>
						</label>
						<textarea
							id="rules"
							value={rules}
							onChange={(event) => setRules(event.target.value)}
							className="w-full min-h-24 rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="Original work only, etc."
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label htmlFor="startTime" className="block mb-2 font-medium">
								Start Time
							</label>
							<input
								id="startTime"
								type="datetime-local"
								value={startTime}
								onChange={(event) => setStartTime(event.target.value)}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
								required
							/>
						</div>
						<div>
							<label htmlFor="endTime" className="block mb-2 font-medium">
								End Time
							</label>
							<input
								id="endTime"
								type="datetime-local"
								value={endTime}
								onChange={(event) => setEndTime(event.target.value)}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label htmlFor="votingType" className="block mb-2 font-medium">
								Voting Type
							</label>
							<select
								id="votingType"
								value={votingType}
								onChange={(event) => setVotingType(event.target.value)}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500">
								<option value="EVERYONE">Everyone</option>
								<option value="JUDGES">Judges</option>
								<option value="CONTESTANTS">Contestants Only</option>
							</select>
						</div>
						<div>
							<label
								htmlFor="votingDurationHours"
								className="block mb-2 font-medium">
								Voting Duration (hours)
							</label>
							<input
								id="votingDurationHours"
								type="number"
								min="1"
								value={votingDurationHours}
								onChange={(event) =>
									setVotingDurationHours(event.target.value)
								}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label htmlFor="wordMin" className="block mb-2 font-medium">
								Min Words{' '}
								<span className="text-gray-500 text-sm">(optional)</span>
							</label>
							<input
								id="wordMin"
								type="number"
								min="0"
								value={wordMin}
								onChange={(event) => setWordMin(event.target.value)}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
								placeholder="No minimum"
							/>
						</div>
						<div>
							<label htmlFor="wordMax" className="block mb-2 font-medium">
								Max Words{' '}
								<span className="text-gray-500 text-sm">(optional)</span>
							</label>
							<input
								id="wordMax"
								type="number"
								min="0"
								value={wordMax}
								onChange={(event) => setWordMax(event.target.value)}
								className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
								placeholder="No maximum"
							/>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
							{submitting ? 'Creating...' : 'Create Contest'}
						</button>
					</div>

					{errorMessage && (
						<p className="text-sm text-red-400">{errorMessage}</p>
					)}
					{submitMessage && (
						<p className="text-sm text-green-400">{submitMessage}</p>
					)}
				</form>
			</div>
		</div>
	)
}

export default ContestFormPage
