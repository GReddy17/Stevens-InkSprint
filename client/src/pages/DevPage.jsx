import { gql, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

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
    }
  }
`

function ContestSection({ contest }) {
  const { data, loading } = useQuery(GET_SUBMISSIONS_BY_CONTEST, {
    variables: { contestId: contest.id },
  })

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-xl p-5'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='text-lg font-semibold'>{contest.title}</h2>

        <Link
          to={`/contests/${contest.id}/submit`}
          className='text-sm bg-white text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition'
        >
          Submit
        </Link>
      </div>

      <div className='text-sm text-gray-400 mb-2'>Submissions</div>

      {loading && <p className='text-gray-500'>Loading...</p>}

      {!loading && (!data?.submissionsByContest || data.submissionsByContest.length === 0) && (
        <p className='text-gray-500'>No submissions yet</p>
      )}

      {!loading &&
        data?.submissionsByContest?.map((submission) => (
          <div key={submission.id} className='mb-1'>
            <Link
              to={`/submissions/${submission.id}`}
              className='text-blue-400 hover:underline'
            >
              {submission.title || 'Untitled Submission'}
            </Link>
          </div>
        ))}
    </div>
  )
}

function DevPage() {
  const { data, loading, error } = useQuery(GET_CONTESTS_WITH_SUBMISSIONS)

  return (
    <div className='min-h-screen bg-gray-900 text-white px-6 py-10'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6'>Dev Test Page</h1>

        <p className='text-gray-400 mb-8'>
          Temporary page for navigating contests, submissions, and forms.
        </p>

        {loading && <p className='text-gray-400'>Loading contests...</p>}

        {error && (
          <p className='text-red-400'>Error loading contests: {error.message}</p>
        )}

        <div className='space-y-6'>
          {data?.contests?.map((contest) => (
            <ContestSection key={contest.id} contest={contest} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DevPage