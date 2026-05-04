import { Link } from 'react-router-dom'

function Header() {
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
						to="/dev"
						className="text-gray-300 hover:text-white border border-white px-2">
						Dev Page (Temp Link)
					</Link>

					<Link
						to="/contests/new"
						className="text-gray-300 hover:text-white border border-white px-2">
						Contest Form (Temp Link)
					</Link>

					<Link
						to="/profiles/69dd79e6ddb8b4224c65fa1e"
						className="text-gray-300 hover:text-white border border-white px-2">
						View Profile (Temp Link)
					</Link>

					<Link
						to="/profile/edit"
						className="text-gray-300 hover:text-white border border-white px-2">
						Edit Profile (Temp Link)
					</Link>
				</nav>
			</div>
		</header>
	)
}

export default Header
