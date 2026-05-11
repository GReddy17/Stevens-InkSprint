import { gql, useLazyQuery } from '@apollo/client'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
	const [submitError, setSubmitError] = useState('')
	const [fetchMe] = useLazyQuery(ME_QUERY, {
		fetchPolicy: 'network-only',
	})

	const handleLogin = async ({ email, password }) => {
		setSubmitError('')

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			)

			await userCredential.user.reload()
			await userCredential.user.getIdToken(true)

			await fetchMe()

			navigate('/')
		} catch (err) {
			if (
				err.code === 'auth/invalid-credential' ||
				err.code === 'auth/user-not-found' ||
				err.code === 'auth/wrong-password'
			) {
				setSubmitError('Invalid email or password')
			} else if (err.code === 'auth/invalid-email') {
				setSubmitError('Please enter a valid email address')
			} else if (err.code === 'auth/too-many-requests') {
				setSubmitError('Too many login attempts. Please try again later')
			} else {
				setSubmitError(err.message || 'Unable to log in')
			}
		}
	}

	return <LoginForm onSubmit={handleLogin} submitError={submitError} />
}

export default LoginPage
