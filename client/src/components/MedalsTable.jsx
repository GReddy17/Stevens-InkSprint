function MedalsTable({ userMedals, filteredMedals, medalsPage, setMedalsPage, medalsTotalPages, medalsFilter, setMedalsFilter, medalsSort, handleSort, S, downloadCert, API_URL }) {
	const medalsPaginated = filteredMedals.slice((medalsPage - 1) * 10, medalsPage * 10)

	const downloadCertHandler = (url) => {
		if (url) {
			const link = document.createElement('a')
			link.href = API_URL + url
			link.download = 'certificate.png'
			link.click()
		}
	}

	if (Object.keys(userMedals).length === 0) {
		return (
			<div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
				<p className="text-gray-400">No medals yet.</p>
			</div>
		)
	}

	return (
		<div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
			<div className="p-4 flex justify-between">
				<h2 className="text-xl font-bold">🥇 Medals</h2>
				<input
					placeholder="Filter..."
					value={medalsFilter}
					onChange={e => { setMedalsFilter(e.target.value); setMedalsPage(1) }}
					className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
				/>
			</div>
			{filteredMedals.length === 0 && <div className="p-4 text-center text-gray-400">No matching results</div>}
			<table className="w-full">
				<thead className="bg-gray-700">
					<tr>
						<th className="px-4 py-2 text-left">#</th>
						<th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('m', 'user')}>
							User <S f="user" c={medalsSort} />
						</th>
						<th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('m', 'gold')}>
							🥇 <S f="gold" c={medalsSort} />
						</th>
						<th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('m', 'silver')}>
							🥈 <S f="silver" c={medalsSort} />
						</th>
						<th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('m', 'bronze')}>
							🥉 <S f="bronze" c={medalsSort} />
						</th>
						<th className="px-4 py-2 text-center cursor-pointer" onClick={() => handleSort('m', 'total')}>
							Total <S f="total" c={medalsSort} />
						</th>
						<th className="px-4 py-2 text-left">Wins</th>
					</tr>
				</thead>
				<tbody>
					{medalsPaginated.map((e) => (
						<tr key={e.user?.id} className="border-t border-gray-700">
							<td className="px-4 py-3">
								<span className={`font-bold ${e.rank === 1 ? 'text-yellow-400' : e.rank === 2 ? 'text-gray-300' : e.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
									{e.rank}
								</span>
							</td>
							<td className="px-4 py-3 font-semibold">{e.user?.displayName || e.user?.email || '?'}</td>
							<td className="px-4 py-3 text-center text-xl">{e.gold}</td>
							<td className="px-4 py-3 text-center text-xl">{e.silver}</td>
							<td className="px-4 py-3 text-center text-xl">{e.bronze}</td>
							<td className="px-4 py-3 text-center font-bold text-yellow-400">{e.total}</td>
							<td className="px-4 py-3">
								{e.wins.map((w, j) => (
									<div key={j} className="flex gap-2 mb-1">
										<span className="text-sm text-gray-400">{w.contestTitle}</span>
										{w.certificateUrl && (
											<button onClick={() => downloadCertHandler(w.certificateUrl)} className="text-green-400 text-xs">
												Download
											</button>
										)}
									</div>
								))}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{medalsTotalPages > 1 && (
				<div className="p-3 flex justify-center gap-2">
					<button onClick={() => setMedalsPage(p => Math.max(1, p - 1))} disabled={medalsPage === 1} className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50">Prev</button>
					<span className="px-2">{medalsPage}/{medalsTotalPages}</span>
					<button onClick={() => setMedalsPage(p => Math.min(medalsTotalPages, p + 1))} disabled={medalsPage === medalsTotalPages} className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50">Next</button>
				</div>
			)}
		</div>
	)
}

export default MedalsTable