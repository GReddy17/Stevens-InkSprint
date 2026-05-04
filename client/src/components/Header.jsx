import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

function Header() {
	const [user, setUser] = useState(null)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser)
		})

		return () => unsubscribe()
	}, [])

	const handleLogout = async () => {
		await signOut(auth)
	}

	return (
		<header className="bg-gray-900 border-b border-gray-800">
			<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
				<Link to="/" className="text-xl font-bold text-white">
					Ink Sprint
				</Link>

				<nav className="flex items-center gap-4 text-sm">
					<Link to="/" className="text-gray-300 hover:text-white">
						Home
					</Link>

					<Link
						to="/contests/new"
						className="text-gray-300 hover:text-white border border-white px-2">
						Contest Form [TEMP LINK]
					</Link>

					{/* AUTH SECTION */}
					{!user ? (
						// Display Login/Signup links if not logged in
						<>
							<Link to="/login" className="text-gray-300 hover:text-white">
								Login
							</Link>
							<Link
								to="/signup"
								className="text-gray-300 hover:text-white">
								Sign Up
							</Link>
						</>
					) : (
						// Display username and logout link if logged in
						<>
							<span className="text-gray-400">
								{user.displayName}
							</span>
							<button
								onClick={handleLogout}
								className="text-gray-300 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg">
								Logout
							</button>
						</>
					)}
				</nav>
			</div>
		</header>
	)
}

export default Header
