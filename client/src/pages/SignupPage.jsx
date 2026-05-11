import { gql, useLazyQuery } from '@apollo/client'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
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
	const [submitError, setSubmitError] = useState('')
	const [fetchMe] = useLazyQuery(ME_QUERY, {
		fetchPolicy: 'network-only',
	})

	const handleSignup = async ({ email, password, displayName }) => {
		setSubmitError('')
		
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
			if (err.code === 'auth/email-already-in-use') {
				setSubmitError('That email is already in use')
			} else if (err.code === 'auth/invalid-email') {
				setSubmitError('Please enter a valid email address')
			} else if (err.code === 'auth/weak-password') {
				setSubmitError('Password should be at least 6 characters')
			} else {
				setSubmitError(err.message || 'Unable to create account')
			}
		}
	}

	return <SignupForm onSubmit={handleSignup} submitError={submitError} />
}

export default SignupPage
