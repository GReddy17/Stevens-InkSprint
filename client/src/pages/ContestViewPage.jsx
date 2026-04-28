import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

const GET_CONTEST = gql`
  query GetContest($contestId: ID!) {
    contest(id: $contestId) {
      id
      title
      prompt
      rules
      startTime
      endTime
      status
      votingType
      votingDurationHours
      wordMin
      wordMax
    }
  }
`;

function ContestViewPage() {
	const { contestId } = useParams()

	const { loading, error, data } = useQuery(GET_CONTEST, {
		variables: { contestId },
		skip: !contestId,
	})

	const contest = data?.contest

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
					<h1 className="text-3xl font-bold mb-4">Contest</h1>
					<p className="text-red-400">{error?.message || 'Contest not found.'}</p>
				</div>
			</div>
		)
	}

	const formatDate = (value) => {
		if (!value) return 'TBD'
		const parsed = new Date(value)
		return Number.isNaN(parsed.getTime())
			? value
			: parsed.toLocaleString()
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<div className="flex flex-wrap items-start justify-between gap-3 mb-2">
					<h1 className="text-3xl font-bold">{contest.title}</h1>
					{contest.status && (
						<span className="text-xs uppercase tracking-wide bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-gray-300">
							{contest.status}
						</span>
					)}
				</div>
				<p className="text-gray-400 mb-8">
					{formatDate(contest.startTime)} - {formatDate(contest.endTime)}
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<h2 className="text-xl font-semibold mb-2">Prompt</h2>
					<p className="text-gray-200 leading-7 whitespace-pre-line">
						{contest.prompt}
					</p>
				</div>

				{contest.rules && (
					<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
						<h2 className="text-xl font-semibold mb-2">Rules</h2>
						<p className="text-gray-300 whitespace-pre-line">
							{contest.rules}
						</p>
					</div>
				)}

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
					<h2 className="text-xl font-semibold mb-3">Details</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
						<div>
							<dt className="text-gray-400">Voting Type</dt>
							<dd className="text-gray-200">
								{contest.votingType || 'EVERYONE'}
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Voting Duration</dt>
							<dd className="text-gray-200">
								{contest.votingDurationHours ?? 48} hours
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Min Words</dt>
							<dd className="text-gray-200">
								{contest.wordMin ?? 'No minimum'}
							</dd>
						</div>
						<div>
							<dt className="text-gray-400">Max Words</dt>
							<dd className="text-gray-200">
								{contest.wordMax ?? 'No maximum'}
							</dd>
						</div>
					</dl>
				</div>

				<div className="flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => {
							// TODO: route to submission form for this contest
							console.log('Navigate to submission form for:', contest.id)
						}}
						className="bg-white text-gray-900 font-medium px-5 py-2.5 rounded-lg hover:bg-gray-200">
						Submit an Entry
					</button>
					<button
						type="button"
						onClick={() => {
							// TODO: route to submissions list for this contest
							console.log('View submissions for:', contest.id)
						}}
						className="bg-gray-800 border border-gray-700 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-gray-700">
						View Submissions
					</button>
				</div>
			</div>
		</div>
	)
}

export default ContestViewPage
