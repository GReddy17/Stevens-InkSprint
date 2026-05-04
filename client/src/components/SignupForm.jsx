import { useState } from 'react'
import { Link } from 'react-router-dom'

const SignupForm = ({ onSubmit }) => {
	const [formData, setFormData] = useState({
		email: '',
		displayName: '',
		password: '',
	})

	const [errors, setErrors] = useState({})

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const validate = () => {
		const newErrors = {}

		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Invalid email format'
		}

		if (!formData.displayName) {
			newErrors.displayName = 'Display name is required'
		}

		if (!formData.password) {
			newErrors.password = 'Password is required'
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters'
		}

		return newErrors
	}

	const handleSubmit = (e) => {
		e.preventDefault()

		const validationErrors = validate()
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors)
			return
		}

		setErrors({})

		if (onSubmit) onSubmit(formData)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6 max-w-lg mx-auto">
			<h2 className="text-2xl font-semibold text-white">Sign Up</h2>

			{/* Email */}
			<div>
				<label className="block mb-2 text-sm font-medium text-gray-300">
					Email
				</label>
				<input
					type="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
				/>
				{errors.email && (
					<p className="text-red-400 text-sm mt-1">{errors.email}</p>
				)}
			</div>

			{/* Display Name */}
			<div>
				<label className="block mb-2 text-sm font-medium text-gray-300">
					Display Name
				</label>
				<input
					type="text"
					name="displayName"
					value={formData.displayName}
					onChange={handleChange}
					className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
				/>
				{errors.displayName && (
					<p className="text-red-400 text-sm mt-1">{errors.displayName}</p>
				)}
			</div>

			{/* Password */}
			<div>
				<label className="block mb-2 text-sm font-medium text-gray-300">
					Password
				</label>
				<input
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					className="w-full rounded-lg bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
				/>
				{errors.password && (
					<p className="text-red-400 text-sm mt-1">{errors.password}</p>
				)}
			</div>

			{/* Submit */}
			<button
				type="submit"
				className="w-full bg-white text-gray-900 font-medium px-5 py-3 rounded-lg hover:bg-gray-200 transition">
				Create Account
			</button>

			{/* Link */}
			<p className="text-sm text-gray-400 text-center">
				Already have an account?{' '}
				<Link to="/login" className="text-white hover:underline">
					Login here
				</Link>
			</p>
		</form>
	)
}

export default SignupForm
