import { gql, useQuery } from '@apollo/client'
import { Link, useParams } from 'react-router-dom'

const GET_PROFILE = gql`
  query GetProfile($userId: ID!) {
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

function ProfileViewPage() {
	const { userId } = useParams()

	const { loading, error, data } = useQuery(GET_PROFILE, {
		variables: { userId },
		skip: !userId,
	})

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
					<p className="text-red-400">
						{error?.message || 'User not found.'}
					</p>
				</div>
			</div>
		)
	}

	const user = data.user
	const submissions = data.submissionsByUser ?? []

	// NOTE: profilePictureUrl and socialProfiles aren't on the User model yet. Once they're added, this view should render them too.

	const formatDate = (value) => {
		if (!value) return ''

		let parsed = new Date(value)

		if (Number.isNaN(parsed.getTime())) {
			const asNumber = Number(value)
			if (!Number.isNaN(asNumber)) {
				parsed = new Date(asNumber)
			}
		}

		if (Number.isNaN(parsed.getTime())) {
			return String(value)
		}

		return parsed.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
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
							<h1 className="text-3xl font-bold">
								{user.displayName || 'Unnamed User'}
							</h1>
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
									<Link
										to={`/submissions/${submission.id}`}
										className="block">
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
