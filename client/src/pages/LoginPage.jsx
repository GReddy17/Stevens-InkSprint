import { gql, useLazyQuery } from '@apollo/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import LoginForm from '../components/LoginForm'

const ME_QUERY = gql`
  query Me {
    me {
      id
      firebaseUid
      email
      displayName
    }
  }
`

function LoginPage() {
  const navigate = useNavigate()
  const [fetchMe] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const handleLogin = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)

      await fetchMe()

      navigate('/contests')
    } catch (err) {
      console.error(err.message)
    }
  }

  return <LoginForm onSubmit={handleLogin} />
}

export default LoginPage