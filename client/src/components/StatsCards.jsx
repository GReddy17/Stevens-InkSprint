function StatsCards({ completedContests, totalWinners }) {
	return (
		<div className="grid grid-cols-2 gap-4 mb-8">
			<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
				<p className="text-4xl font-bold text-yellow-400">{completedContests}</p>
				<p className="text-gray-400">Completed</p>
			</div>
			<div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
				<p className="text-4xl font-bold text-green-400">{totalWinners}</p>
				<p className="text-gray-400">Winners</p>
			</div>
		</div>
	)
}

export default StatsCards