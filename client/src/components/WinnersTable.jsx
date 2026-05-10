function WinnersTable({ winners, filteredWinners, winnersPage, setWinnersPage, winnersTotalPages, winnersFilter, setWinnersFilter, winnersSort, handleSort, S }) {
	const winnersPaginated = filteredWinners.slice((winnersPage - 1) * 10, winnersPage * 10)

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-8">
			<div className="p-4 flex justify-between">
				<h2 className="text-xl font-bold">🏅 Winners</h2>
				<input
					placeholder="Filter..."
					value={winnersFilter}
					onChange={e => { setWinnersFilter(e.target.value); setWinnersPage(1) }}
					className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
				/>
			</div>
			{winners.length > 0 && filteredWinners.length === 0 && (
				<div className="p-4 text-center text-gray-400">No matching results</div>
			)}
			<table className="w-full">
				<thead className="bg-gray-700">
					<tr>
						<th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('w', 'contestTitle')}>
							Contest <S f="contestTitle" c={winnersSort} />
						</th>
						<th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('w', 'winner')}>
							Winner <S f="winner" c={winnersSort} />
						</th>
					</tr>
				</thead>
				<tbody>
					{winnersPaginated.map((w, i) => (
						<tr key={i} className="border-t border-gray-700">
							<td className="px-4 py-3">{w.contestTitle}</td>
							<td className="px-4 py-3 font-semibold">{w.author?.displayName || w.author?.email || '?'}</td>
						</tr>
					))}
				</tbody>
			</table>
			{winnersTotalPages > 1 && (
				<div className="p-3 flex justify-center gap-2">
					<button onClick={() => setWinnersPage(p => Math.max(1, p - 1))} disabled={winnersPage === 1} className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50">Prev</button>
					<span className="px-2">{winnersPage}/{winnersTotalPages}</span>
					<button onClick={() => setWinnersPage(p => Math.min(winnersTotalPages, p + 1))} disabled={winnersPage === winnersTotalPages} className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50">Next</button>
				</div>
			)}
		</div>
	)
}

export default WinnersTable