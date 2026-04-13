import { useQuery, gql } from '@apollo/client'

const GET_CONTESTS = gql`
  query GetContests {
    contests {
      id
      title
      prompt
      startTime
      endTime
      status
    }
  }
`

function App() {
  const { loading, error, data } = useQuery(GET_CONTESTS)

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <h1 className='text-3xl font-bold mb-6'>Ink Sprint</h1>

      {loading && <p className='text-gray-400'>Loading contests...</p>}
      {error && <p className='text-red-400'>Error: {error.message}</p>}

      {data && (
        <div className='space-y-4'>
          {data.contests.map((contest) => (
            <div
              key={contest.id}
              className='bg-gray-800 p-4 rounded-lg border border-gray-700'
            >
              <h2 className='text-xl font-semibold'>{contest.title}</h2>
              <p className='text-gray-300 mt-1'>{contest.prompt}</p>

              <div className='flex gap-4 mt-2 text-sm text-gray-400'>
                <span>
                  Starts: {new Date(contest.startTime).toLocaleString()}
                </span>
                <span>
                  Ends: {new Date(contest.endTime).toLocaleString()}
                </span>
                <span className='text-green-400'>{contest.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App