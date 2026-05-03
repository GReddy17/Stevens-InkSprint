import { gql, useQuery } from '@apollo/client'

const GET_USERS = gql`
	query Users {
		users {
			id
			displayName
			email
		}
	}
`

const JudgePicker = ({ currentJudges, onChange }) => {
	const { data, loading, error } = useQuery(GET_USERS)

	const users = data?.users || []

	const sortedUsers = [...users].sort((a, b) => {
		const nameA = a.displayName || ''
		const nameB = b.displayName || ''

		return nameA.localeCompare(nameB)
	})

	const availableUsers = sortedUsers.filter(
		(user) => !currentJudges.some((judge) => judge.id === user.id),
	)

	const handleAddJudge = (event) => {
		const selectedUserId = event.target.value
		if (!selectedUserId) return

		const selectedUser = users.find((user) => user.id === selectedUserId)
		if (!selectedUser) return

		onChange([...currentJudges, selectedUser])
	}

	const handleRemoveJudge = (judgeId) => {
		onChange(currentJudges.filter((judge) => judge.id !== judgeId))
	}

	if (loading) {
		return <p className="text-sm text-gray-400">Loading users...</p>
	}

	if (error) {
		return <p className="text-sm text-red-400">Could not load users.</p>
	}

	return (
		<div className="space-y-4">
			<div>
				<label className="block mb-2 font-medium">Judges</label>

				<select
					value=""
					onChange={handleAddJudge}
					className="w-full rounded-lg bg-gray-950 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500">
					<option value="">Select a judge</option>
					{availableUsers.map((user) => (
						<option key={user.id} value={user.id}>
							{user.displayName || user.email} ({user.email})
						</option>
					))}
				</select>
			</div>

			<div>
				<p className="text-sm text-gray-400 mb-2">Selected Judges</p>

				{currentJudges.length === 0 ? (
					<p className="text-sm text-gray-500">No judges selected yet.</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{currentJudges.map((judge) => (
							<span
								key={judge.id}
								className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white">
								<span>{judge.displayName || judge.email}</span>

								<button
									type="button"
									onClick={() => handleRemoveJudge(judge.id)}
									className="rounded-full text-gray-400 hover:text-white focus:outline-none"
									aria-label={`Remove ${judge.displayName || judge.email}`}>
									×
								</button>
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default JudgePicker
