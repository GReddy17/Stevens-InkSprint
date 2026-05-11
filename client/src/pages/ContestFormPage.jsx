import { gql, useMutation } from '@apollo/client'
import ContestForm from '../components/ContestForm'

const CREATE_CONTEST = gql`
	mutation CreateContest($input: CreateContestInput!) {
		createContest(input: $input) {
			id
			title
			status
			votingType
			votingGroupMemberIds
			votingGroupMembers {
				id
				displayName
				email
			}
			wordMin
			wordMax
		}
	}
`

function ContestFormPage() {
	const [createContest, { loading, error, data }] = useMutation(CREATE_CONTEST)

	const handleCreateContest = async (payload) => {
		try {
			await createContest({
				variables: {
					input: {
						title: payload.title,
						prompt: payload.prompt,
						rules: payload.rules,
						startTime: payload.startTime,
						endTime: payload.endTime,
						votingType: payload.votingType,
						votingStartTime: payload.votingStartTime,
						votingEndTime: payload.votingEndTime,
						votingGroupMemberIds: payload.votingGroupMemberIds || [],
						wordMin: payload.wordMin,
						wordMax: payload.wordMax,
					},
				},
				refetchQueries: ['GetContests'],
				awaitRefetchQueries: true,
			})
		} catch (err) {
			console.error('Create contest failed:', err.message)
		}
	}

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-2">Create a Contest</h1>
				<p className="text-gray-400 mb-8">
					Set up a new writing contest for the community.
				</p>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
					<ContestForm onSubmit={handleCreateContest} />

					{loading && (
						<p className="text-sm text-gray-300 mt-4">Creating contest...</p>
					)}

					{error && (
						<p className="text-sm text-red-400 mt-4">{error.message}</p>
					)}

					{data?.createContest && (
						<p className="text-sm text-green-400 mt-4">
							Contest created: {data.createContest.title}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export default ContestFormPage
