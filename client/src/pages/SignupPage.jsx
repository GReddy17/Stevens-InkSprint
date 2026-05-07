import { gql, useLazyQuery } from '@apollo/client'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import SignupForm from '../components/SignupForm'

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

function SignupPage() {
	const navigate = useNavigate()
	const [fetchMe] = useLazyQuery(ME_QUERY, {
		fetchPolicy: 'network-only',
	})

	const handleSignup = async ({ email, password, displayName }) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			)

			await updateProfile(userCredential.user, {
				displayName,
			})
			await userCredential.user.reload()
			await userCredential.user.getIdToken(true)

			await fetchMe()

			navigate('/')
		} catch (err) {
			console.error(err.message)
		}
	}

	return <SignupForm onSubmit={handleSignup} />
}

export default SignupPage
