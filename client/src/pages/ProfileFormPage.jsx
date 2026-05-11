import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const ME_QUERY = gql`
	query Me {
		me {
			id
			displayName
		}
	}
`

// NOTE: leaving this commented-out for now -- the GraphQL schema still only
// has `createUser`, no `updateUser`. Once teammates add
// `updateUser(id: ID!, input: UpdateUserInput!): User!` to the schema, swap
// the console.log in handleSubmit for useMutation(UPDATE_PROFILE).
//
// const UPDATE_PROFILE = gql`
//   mutation UpdateProfile($id: ID!, $input: UpdateUserInput!) {
//     updateUser(id: $id, input: $input) {
//       id
//       displayName
//       profilePictureUrl    # pending backend
//       socialProfiles {     # pending backend
//         platform
//         url
//       }
//     }
//   }
// `

// Social profile feature is commented out for now -- the backend hasn't
// added a socialProfiles field on the User model yet. Re-enable everything
// marked "SOCIAL PROFILES (commented out)" once the schema lands.
// const SOCIAL_PLATFORMS = [
// 	'Twitter',
// 	'Instagram',
// 	'YouTube',
// 	'TikTok',
// 	'Website',
// 	'Other',
// ]

function ProfileFormPage() {
	// Firebase auth state -- mirrors what the Header does.
	const [firebaseUser, setFirebaseUser] = useState(null)
	const [authReady, setAuthReady] = useState(false)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setFirebaseUser(user)
			setAuthReady(true)
		})
		return () => unsubscribe()
	}, [])

	// Fetch the real Mongo user record (id + displayName) once Firebase says
	// we're signed in.
	const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
		skip: !firebaseUser,
	})
	const currentUser = meData?.me

	// Form fields.
	const [displayName, setDisplayName] = useState('')
	// const [profilePictureUrl, setProfilePictureUrl] = useState('')
	// const [socialProfiles, setSocialProfiles] = useState([])

	const [submitting, setSubmitting] = useState(false)
	const [submitMessage, setSubmitMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	// Prefill form fields once we have the current user's data.
	const [initialized, setInitialized] = useState(false)
	useEffect(() => {
		if (currentUser && !initialized) {
			setDisplayName(currentUser.displayName ?? '')
			setInitialized(true)
		}
	}, [currentUser, initialized])

	if (!authReady) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		)
	}

	// Not signed in.
	if (!firebaseUser) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold mb-4">Edit Profile</h1>
					<p className="text-red-400">
						You need to be logged in to edit your profile.
					</p>
				</div>
			</div>
		)
	}

	if (meLoading || !currentUser) {
		return (
			<div className="bg-gray-900 text-white px-6 py-10">
				<div className="max-w-3xl mx-auto">
					<p className="text-gray-400">Loading profile...</p>
				</div>
			</div>
		)
	}

	// function addSocialProfile() {
	// 	setSocialProfiles([
	// 		...socialProfiles,
	// 		{ platform: SOCIAL_PLATFORMS[0], url: '' },
	// 	])
	// }
	//
	// function updateSocialProfile(index, field, value) {
	// 	setSocialProfiles(
	// 		socialProfiles.map((profile, i) =>
	// 			i === index ? { ...profile, [field]: value } : profile
	// 		)
	// 	)
	// }
	//
	// function removeSocialProfile(index) {
	// 	setSocialProfiles(socialProfiles.filter((_, i) => i !== index))
	// }

	function validate() {
		if (!displayName.trim()) {
			return 'Display name is required.'
		}
		// for (const profile of socialProfiles) {
		// 	if (profile.url && !/^https?:\/\//i.test(profile.url)) {
		// 		return 'Social profile URLs must start with http:// or https://'
		// 	}
		// }
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
			id: currentUser.id,
			displayName: displayName.trim(),
			// profilePictureUrl: profilePictureUrl.trim(),
			// socialProfiles: socialProfiles
			// 	.filter((profile) => profile.url.trim() !== '')
			// 	.map((profile) => ({
			// 		platform: profile.platform,
			// 		url: profile.url.trim(),
			// 	})),
		}

		setSubmitting(true)
		try {
			// TODO: replace with useMutation(UPDATE_PROFILE) once the updateUser mutation exists on the backend.
			console.log('Mock profile update payload:', payload)
			setSubmitMessage('Profile saved locally for now (mock flow).')
		} catch (err) {
			setErrorMessage(err.message || 'Failed to update profile.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
				<p className="text-gray-400 mb-8">
					Update how you appear to other writers on Ink Sprint.
				</p>

				<form
					onSubmit={handleSubmit}
					className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
					<div>
						<label htmlFor="displayName" className="block mb-2 font-medium">
							Display Name
						</label>
						<input
							id="displayName"
							type="text"
							value={displayName}
							onChange={(event) => setDisplayName(event.target.value)}
							className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="How you'd like to be shown"
							required
						/>
					</div>

					{/* In case you want to add profile pictures. idk

					<div>
						<label
							htmlFor="profilePictureUrl"
							className="block mb-2 font-medium">
							Profile Picture URL{' '}
							<span className="text-gray-500 text-sm">
								(pending backend support)
							</span>
						</label>
						<input
							id="profilePictureUrl"
							type="url"
							value={profilePictureUrl}
							onChange={(event) =>
								setProfilePictureUrl(event.target.value)
							}
							className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
							placeholder="https://example.com/avatar.png"
						/>
					</div>

					*/}
					
					{/* In case we want to add social profiles. Idk if we have time. But I was implementing it before getting sick.
					- Owen

					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="font-medium">
								Social Profiles{' '}
								<span className="text-gray-500 text-sm">
									(pending backend support)
								</span>
							</label>
							<button
								type="button"
								onClick={addSocialProfile}
								className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg">
								+ Add
							</button>
						</div>

						{socialProfiles.length === 0 ? (
							<p className="text-sm text-gray-500">
								No social profiles added.
							</p>
						) : (
							<div className="space-y-3">
								{socialProfiles.map((profile, index) => (
									<div
										key={index}
										className="flex flex-wrap gap-2 items-start">
										<select
											value={profile.platform}
											onChange={(event) =>
												updateSocialProfile(
													index,
													'platform',
													event.target.value
												)
											}
											className="rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-500">
											{SOCIAL_PLATFORMS.map((platform) => (
												<option key={platform} value={platform}>
													{platform}
												</option>
											))}
										</select>
										<input
											type="url"
											value={profile.url}
											onChange={(event) =>
												updateSocialProfile(
													index,
													'url',
													event.target.value
												)
											}
											placeholder="https://..."
											className="flex-1 min-w-50 rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
										/>
										<button
											type="button"
											onClick={() => removeSocialProfile(index)}
											className="text-sm bg-gray-700 hover:bg-red-700 text-white px-3 py-2 rounded-lg">
											Remove
										</button>
									</div>
								))}
							</div>
						)}
					</div>
					*/}

					<div className="flex items-center justify-end gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50">
							{submitting ? 'Saving...' : 'Save Profile'}
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

export default ProfileFormPage
