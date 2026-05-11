import { useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Link, useParams } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { formatDate } from '../utils/contestHelpers'

const GET_PROFILE = gql`
	query GetProfile($userId: ID!) {
		me {
			id
			displayName
		}
		user(id: $userId) {
			id
			displayName
			createdAt
		}
		submissionsByUser(authorId: $userId) {
			id
			title
			submittedAt
			contest {
				id
				title
			}
		}
	}
`
const UPDATE_USER = gql`
	mutation UpdateUser($input: UpdateUserInput!) {
		updateUser(input: $input) {
			id
			displayName
		}
	}
`

function ProfileViewPage() {
	const { userId } = useParams()

	const { loading, error, data } = useQuery(GET_PROFILE, {
		variables: { userId },
		skip: !userId,
	})
	const [updateUser, { loading: isSaving }] = useMutation(UPDATE_USER)
	const [isEditing, setIsEditing] = useState(false)
	const [displayNameDraft, setDisplayNameDraft] = useState('')
	const [profileMessage, setProfileMessage] = useState('')

	if (loading) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-gray-400">Loading profile...</p>
				</div>
			</div>
		)
	}

	if (error || !data?.user) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Profile</h1>
					<p className="text-red-400">{error?.message || 'User not found.'}</p>
				</div>
			</div>
		)
	}

	const user = data.user
	const submissions = data.submissionsByUser ?? []
	const isOwnProfile = data.me?.id === user.id

	async function handleStartEditing() {
		setDisplayNameDraft(user.displayName || '')
		setProfileMessage('')
		setIsEditing(true)
	}

	async function handleCancelEditing() {
		setDisplayNameDraft('')
		setProfileMessage('')
		setIsEditing(false)
	}

	async function handleSaveDisplayName(event) {
		event.preventDefault()
		setProfileMessage('')

		const trimmedName = displayNameDraft.trim()

		if (!trimmedName) {
			setProfileMessage('Display name is required.')
			return
		}

		try {
			if (auth.currentUser) {
				await updateProfile(auth.currentUser, {
					displayName: trimmedName,
				})
				await auth.currentUser.getIdToken(true)
			}

			await updateUser({
				variables: {
					input: {
						displayName: trimmedName,
					},
				},
				refetchQueries: [
					{
						query: GET_PROFILE,
						variables: { userId },
					},
				],
				awaitRefetchQueries: true,
			})

			setIsEditing(false)
			setProfileMessage('Display name updated.')
		} catch (error) {
			setProfileMessage(error.message || 'Failed to update display name.')
		}
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<div className="flex items-start gap-4">
						{/* NOTE: There is technically a default pfp circle for now. Profile pics might be added depending on backend.  */}
						<div className="w-16 h-16 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-2xl font-semibold text-gray-200 shrink-0">
							{(user.displayName || '?').charAt(0).toUpperCase()}
						</div>
						<div className="flex-1">
							{isEditing ? (
								<form onSubmit={handleSaveDisplayName} className="space-y-3">
									<label htmlFor="displayName" className="sr-only">
										Display Name
									</label>
									<input
										id="displayName"
										type="text"
										value={displayNameDraft}
										onChange={(event) =>
											setDisplayNameDraft(event.target.value)
										}
										className="w-full max-w-md rounded-lg bg-gray-900 border border-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
										required
									/>
									<div className="flex gap-2">
										<button
											type="submit"
											disabled={isSaving}
											className="bg-white text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50">
											{isSaving ? 'Saving...' : 'Save'}
										</button>
										<button
											type="button"
											onClick={handleCancelEditing}
											className="bg-gray-700 text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-600">
											Cancel
										</button>
									</div>
								</form>
							) : (
								<div className="flex flex-wrap items-center gap-3">
									<h1 className="text-3xl font-bold">
										{user.displayName || 'Unnamed User'}
									</h1>
									{isOwnProfile && (
										<button
											type="button"
											onClick={handleStartEditing}
											className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg">
											Edit
										</button>
									)}
								</div>
							)}
							{profileMessage && (
								<p
									className={`text-sm mt-2 ${
										profileMessage.toLowerCase().includes('updated')
											? 'text-green-400'
											: 'text-red-400'
									}`}>
									{profileMessage}
								</p>
							)}

							{user.createdAt && (
								<p className="text-gray-500 text-sm mt-2">
									Member since {formatDate(user.createdAt)}
								</p>
							)}
						</div>
					</div>

					{/* NOTE: IF and WHEN socialProfiles lands on the backend, render them here as a list of links (platform + url). */}
				</div>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
					<h2 className="text-xl font-semibold mb-4">
						Submissions ({submissions.length})
					</h2>

					{submissions.length === 0 ? (
						<p className="text-gray-400">
							This user hasn't submitted to any contests yet.
						</p>
					) : (
						<ul className="space-y-3">
							{submissions.map((submission) => (
								<li
									key={submission.id}
									className="border border-gray-700 rounded-lg p-4 hover:bg-gray-900 transition-colors">
									<Link to={`/submissions/${submission.id}`} className="block">
										<p className="font-medium text-white">
											{submission.title || 'Untitled Submission'}
										</p>
										<p className="text-sm text-gray-400 mt-1">
											{submission.contest?.title
												? `For: ${submission.contest.title}`
												: 'For: (contest unavailable)'}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											Submitted {formatDate(submission.submittedAt)}
										</p>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	)
}

export default ProfileViewPage
