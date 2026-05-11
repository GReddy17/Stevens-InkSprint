import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { gql, useQuery } from '@apollo/client'
import { auth } from '../firebase'

const GET_ME = gql`
	query Me {
		me {
			id
			displayName
		}
	}
`

function Header() {
	const [user, setUser] = useState(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef(null)

	// Only run the `me` query once Firebase says we're signed in!
	const {
		data: meData,
		refetch: refetchMe,
		loading: meLoading,
	} = useQuery(GET_ME, {
		skip: !user,
		fetchPolicy: 'network-only',
	})

	const currentUserId = meData?.me?.id

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			setUser(firebaseUser)

			if (firebaseUser) {
				await firebaseUser.getIdToken(true)
				refetchMe?.()
			}
		})

		return () => unsubscribe()
	}, [refetchMe])

	// Close dropdown when clicking outside of it
	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpen(false)
			}
		}
		if (menuOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
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
					{!user ? (
						<>
							<Link to="/login" className="text-gray-300 hover:text-white">
								Login
							</Link>
							<Link to="/signup" className="text-gray-300 hover:text-white">
								Sign Up
							</Link>
						</>
					) : (
						<div className="relative" ref={menuRef}>
							<button
								type="button"
								onClick={() => setMenuOpen((open) => !open)}
								className="flex items-center gap-1 text-gray-200 hover:text-white"
								aria-label="Open account menu"
								aria-haspopup="true"
								aria-expanded={menuOpen}>
								<span>{user.displayName || user.email || 'Account'}</span>
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

							{menuOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
									<Link
										to="/"
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										Home
									</Link>
									<Link
										to="/contests/"
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										Contests
									</Link>
									<Link
										to="/contests/new"
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										Create Contest
									</Link>
									<Link
										to="/leaderboard/"
										onClick={() => setMenuOpen(false)}
										className="block px-4 py-2 text-gray-200 hover:bg-gray-700">
										Leaderboard
									</Link>

									{currentUserId && (
										<Link
											to={`/profiles/${currentUserId}`}
											onClick={() => setMenuOpen(false)}
											className="block px-4 py-2 text-gray-200 hover:bg-gray-700 border-t border-gray-700">
											View Profile
										</Link>
									)}

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
