import { useState } from 'react'
// import { gql, useMutation } from '@apollo/client'

/* 
NOTE: there's no auth/login context in the client yet. I'm using
this stub so the form has something to work with while we build out the UI.
Once Firebase Auth is wired up (the User model already has firebaseUid),
this should be replaced with whatever hook/context we end up using to get
the currently logged-in user. If there's no logged-in user, this page
should redirect or show "please log in".
*/
function useCurrentUserStub() {
	return {
		id: '69dd79e6ddb8b4224c65fa1e',
		displayName: 'Jordan Lee',
		// NOTE: profilePictureUrl is NOT on the User model in the
		// backend yet. Please add a `profilePictureUrl` field (String, optional)
		// to the User schema and expose it on the GraphQL User type.
		profilePictureUrl: '',
		// NOTE: socialProfiles is NOT on the User model in the
		// backend yet. Please add a `socialProfiles` field (array of
		// { platform: String, url: String }) to the User schema and expose
		// it on the GraphQL User type.
		socialProfiles: [],
	}
}

// NOTE: leaving this commented-out for now -- the GraphQL schema only
// has a `createUser` mutation, not an `updateUser` one. Once teammates add
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

const SOCIAL_PLATFORMS = [
	'Twitter',
	'Instagram',
	'YouTube',
	'TikTok',
	'Website',
	'Other',
]

function ProfileFormPage() {
	const currentUser = useCurrentUserStub()

	// NOTE: only the logged-in user should be able to edit their own
	// profile. Once auth is wired up, gate this whole page behind a check that
	// route :userId === currentUser.id, otherwise redirect / show forbidden.
	if (!currentUser) {
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

	const [displayName, setDisplayName] = useState(
		currentUser.displayName ?? ''
	)
	const [profilePictureUrl, setProfilePictureUrl] = useState(
		currentUser.profilePictureUrl ?? ''
	)
	const [socialProfiles, setSocialProfiles] = useState(
		currentUser.socialProfiles ?? []
	)

	const [submitting, setSubmitting] = useState(false)
	const [submitMessage, setSubmitMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	function addSocialProfile() {
		setSocialProfiles([
			...socialProfiles,
			{ platform: SOCIAL_PLATFORMS[0], url: '' },
		])
	}

	function updateSocialProfile(index, field, value) {
		setSocialProfiles(
			socialProfiles.map((profile, i) =>
				i === index ? { ...profile, [field]: value } : profile
			)
		)
	}

	function removeSocialProfile(index) {
		setSocialProfiles(socialProfiles.filter((_, i) => i !== index))
	}

	function validate() {
		if (!displayName.trim()) {
			return 'Display name is required.'
		}
		// Light URL sanity check on each social profile entry
		for (const profile of socialProfiles) {
			if (profile.url && !/^https?:\/\//i.test(profile.url)) {
				return 'Social profile URLs must start with http:// or https://'
			}
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
			id: currentUser.id,
			displayName: displayName.trim(),
			// NOTE : still sending these even though backend doesn't have them yet, so the wiring is ready when the fields are added.
			profilePictureUrl: profilePictureUrl.trim(),
			socialProfiles: socialProfiles
				.filter((profile) => profile.url.trim() !== '')
				.map((profile) => ({
					platform: profile.platform,
					url: profile.url.trim(),
				})),
		}

		setSubmitting(true)
		try {
			// TODO: replace with useMutation(UPDATE_PROFILE) once the
			// updateUser mutation exists on the backend.
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

					{/* NOTE: profile picture support is also something I wanted to do
					    For now this is a URL input. If the backend ever gets
					    a `profilePictureUrl` field (and probably a file upload
					    endpoint) we can swap this for a real uploader. */}
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

					{/* NOTE: Wanted to add social profiles. Forms are nonfunctional
					    The user can add multiple platform/url pairs here. */}
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
