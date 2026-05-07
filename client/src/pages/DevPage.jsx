import { gql, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import ContestForm from '../components/ContestForm'

const GET_CONTESTS_WITH_SUBMISSIONS = gql`
	query GetContestsWithSubmissions {
		contests {
			id
			title
		}
	}
`

const GET_SUBMISSIONS_BY_CONTEST = gql`
	query GetSubmissionsByContest($contestId: ID!) {
		submissionsByContest(contestId: $contestId) {
			id
			title
			placement
			certificateUrl
			totalScore
		}
	}
`

function ContestSection({ contest }) {
	const { data, loading } = useQuery(GET_SUBMISSIONS_BY_CONTEST, {
		variables: { contestId: contest.id },
		fetchPolicy: 'cache-and-network',
	})

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-lg font-semibold">
					<Link to={`/contests/${contest.id}`}>
						{contest.title}
					</Link>
				</h2>

				<Link
					to={`/contests/${contest.id}/submit`}
					className="text-sm bg-white text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition">
					Submit
				</Link>
			</div>

			<div className="text-sm text-gray-400 mb-2">Submissions</div>

			{loading && <p className="text-gray-500">Loading...</p>}

			{!loading &&
				(!data?.submissionsByContest ||
					data.submissionsByContest.length === 0) && (
					<p className="text-gray-500">No submissions yet</p>
				)}

			{!loading &&
				data?.submissionsByContest?.map((submission) => (
					<div key={submission.id} className="mb-1 flex items-center gap-3">
						{submission.placement && (
							<span className={`text-xs px-2 py-0.5 rounded ${
								submission.placement === 1 ? 'bg-yellow-600' :
								submission.placement === 2 ? 'bg-gray-400' :
								submission.placement === 3 ? 'bg-amber-700' :
								'bg-gray-600'
							}`}>
								{submission.placement}{submission.placement === 1 ? 'st' : submission.placement === 2 ? 'nd' : submission.placement === 3 ? 'rd' : 'th'}
							</span>
						)}
						<Link
							to={`/submissions/${submission.id}`}
							className="text-blue-400 hover:underline">
							{submission.title || 'Untitled Submission'}
						</Link>
						{submission.certificateUrl && (
							<span className="text-green-400 text-xs">📜 cert</span>
						)}
					</div>
				))}
		</div>
	)
}

function DevPage() {
	const { data, loading, error } = useQuery(GET_CONTESTS_WITH_SUBMISSIONS, {
		fetchPolicy: 'cache-and-network',
	})

	const contestSections = data?.contests || []

	return (
		<div className="min-h-screen bg-gray-900 text-white px-6 py-10">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">Dev Test Page</h1>

				<p className="text-gray-400 mb-8">
					Temporary page for navigating contests, submissions, and forms.
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
					<h2 className="text-lg font-semibold mb-2">Certificate Test Summary</h2>
					<p className="text-sm text-gray-400">
						Echoes: 1st, 2nd, 3rd with certs • Stranger in Mirror: no certs • The Package: all with certs
					</p>
				</div>

				{loading && <p className="text-gray-400">Loading contests...</p>}

				{error && (
					<p className="text-red-400">
						Error loading contests: {error.message}
					</p>
				)}

				<div className="space-y-6">
					{data?.contests?.map((contest) => (
						<ContestSection key={contest.id} contest={contest} />
					))}
				</div>
			</div>
		</div>
	)
}

export default DevPage
