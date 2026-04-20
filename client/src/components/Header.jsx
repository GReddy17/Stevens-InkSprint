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
						to="/submissions/new"
						className="text-gray-300 hover:text-white border border-white px-2">
						Submission Form (Temp Link)
					</Link>

					<Link
						to="/submissions/view"
						className="text-gray-300 hover:text-white border border-white px-2">
						Mock Submission (Temp Link)
					</Link>

					<Link
						to="/contests/new"
						className="text-gray-300 hover:text-white border border-white px-2">
						Contest Form (Temp Link)
					</Link>

					<Link
						to="/contests/view"
						className="text-gray-300 hover:text-white border border-white px-2">
						View Mock Contest (Temp Link)
					</Link>
				</nav>
			</div>
		</header>
	)
}

export default Header
