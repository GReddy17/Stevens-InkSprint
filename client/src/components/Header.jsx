import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

// Hardcoded for now.
const TEMP_CURRENT_USER_ID = '69dd79e6ddb8b4224c65fa1e'

function Header() {
	const [user, setUser] = useState(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef(null)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser)
		})

		return () => unsubscribe()
	}, [])

	// Close dropdown when clicking outside of it
	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpen(false)
			}
		}
		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () =>
				document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [menuOpen])

	const handleLogout = async () => {
		setMenuOpen(false)
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
						// Logged in: display name links to user's profile,
						// arrow opens a dropdown with profile/edit/logout actions.
						<div className="relative" ref={menuRef}>
							<div className="flex items-center gap-1">
								<Link
									to={`/profiles/${TEMP_CURRENT_USER_ID}`}
									className="text-gray-200 hover:text-white">
									{user.displayName || user.email || 'Account'}
								</Link>
								<button
									type="button"
									onClick={() => setMenuOpen((open) => !open)}
									aria-label="Open account menu"
									aria-haspopup="true"
									aria-expanded={menuOpen}
									className="text-gray-400 hover:text-white px-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className={`w-4 h-4 transition-transform ${
											menuOpen ? 'rotate-180' : ''
										}`}>
										<path
											fillRule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>

							{menuOpen && (
								<div className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
									<Link
										to={`/profiles/${TEMP_CURRENT_USER_ID}`}
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										View Profile
									</Link>
									<Link
										to="/profile/edit"
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										Edit Profile
									</Link>
									<button
										type="button"
										onClick={handleLogout}
										className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 border-t border-gray-700">
										Log Out
									</button>
								</div>
							)}
						</div>
					)}
				</nav>
			</div>
		</header>
	)
}

export default Header
