import { gql, useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import StatsCards from '../components/StatsCards'
import WinnersTable from '../components/WinnersTable'
import MedalsTable from '../components/MedalsTable'

const GET_MEDALS = gql`
	query GetMedals {
		contestsByStatus(status: COMPLETED) {
			id
			title
			submissions {
				id
				placement
				title
				certificateUrl
				author { id displayName email }
			}
		}
	}
`

const GET_CONTEST_STATUS = gql`
	query GetContestStatuses {
		contests { id status }
	}
`

const API_URL = 'http://localhost:4000'
const PAGE_SIZE = 10

export default function LeaderboardPage() {
	const [medalsPage, setMedalsPage] = useState(1)
	const [winnersPage, setWinnersPage] = useState(1)
	const [medalsSort, setMedalsSort] = useState({ field: 'gold', desc: true })
	const [winnersSort, setWinnersSort] = useState({ field: 'contestTitle', desc: false })
	const [medalsFilter, setMedalsFilter] = useState('')
	const [winnersFilter, setWinnersFilter] = useState('')

	const medalsQuery = useQuery(GET_MEDALS, { fetchPolicy: 'network-only' })
	const statusQuery = useQuery(GET_CONTEST_STATUS, { fetchPolicy: 'network-only', pollInterval: 10000 })

	const loading = medalsQuery.loading
	const medalsData = medalsQuery.data
	const statusData = statusQuery.data
	const refetchMedals = medalsQuery.refetch

	useEffect(() => {
		if (statusData?.contests) {
			const prev = JSON.parse(sessionStorage.getItem('contestStatuses') || '{}')
			const next = {}
			let hasNew = false
			statusData.contests.forEach(c => {
				next[c.id] = c.status
				if (c.status === 'COMPLETED' && prev[c.id] !== 'COMPLETED') hasNew = true
			})
			sessionStorage.setItem('contestStatuses', JSON.stringify(next))
			if (hasNew) refetchMedals()
		}
	}, [statusData, refetchMedals])

	const { completedContests, allWinners, userMedals } = useMemo(() => {
		const contests = medalsData?.contestsByStatus || []
		const winners = []
		const medals = {}

		contests.forEach(contest => {
			const winner = contest.submissions?.find(s => s.placement === 1)
			if (winner) winners.push({ contestTitle: contest.title, ...winner })

			contest.submissions?.forEach(sub => {
				if (sub.placement && sub.placement <= 3) {
					const uid = sub.author?.id
					if (!medals[uid]) medals[uid] = { user: sub.author, gold: 0, silver: 0, bronze: 0, total: 0, wins: [] }
					if (sub.placement === 1) medals[uid].gold++
					else if (sub.placement === 2) medals[uid].silver++
					else if (sub.placement === 3) medals[uid].bronze++
					medals[uid].total++
					medals[uid].wins.push({ contestTitle: contest.title, title: sub.title, placement: sub.placement, certificateUrl: sub.certificateUrl })
				}
			})
		})
		return { completedContests: contests, allWinners: winners, userMedals: medals }
	}, [medalsData])

	const rankedMedals = useMemo(() => {
		const sorted = Object.values(userMedals).sort((a, b) => {
			if (b.gold !== a.gold) return b.gold - a.gold
			if (b.silver !== a.silver) return b.silver - a.silver
			return b.bronze - a.bronze
		})
		return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }))
	}, [userMedals])

	const filteredMedals = useMemo(() => {
		let r = [...rankedMedals]
		if (medalsFilter) r = r.filter(e => (e.user?.displayName || e.user?.email || '').toLowerCase().includes(medalsFilter.toLowerCase()))
		r.sort((a, b) => {
			if (medalsSort.field === 'user') return medalsSort.desc ? (b.user?.displayName || '').localeCompare(a.user?.displayName || '') : (a.user?.displayName || '').localeCompare(b.user?.displayName || '')
			return medalsSort.desc ? b[medalsSort.field] - a[medalsSort.field] : a[medalsSort.field] - b[medalsSort.field]
		})
		return r
	}, [rankedMedals, medalsSort, medalsFilter])

	const medalsTotalPages = Math.ceil(filteredMedals.length / PAGE_SIZE)

	const filteredWinners = useMemo(() => {
		let r = [...allWinners]
		if (winnersFilter) r = r.filter(w => w.contestTitle.toLowerCase().includes(winnersFilter.toLowerCase()) || (w.author?.displayName || '').toLowerCase().includes(winnersFilter.toLowerCase()))
		r.sort((a, b) => {
			const aVal = winnersSort.field === 'contestTitle' ? a.contestTitle : (a.author?.displayName || a.author?.email || '')
			const bVal = winnersSort.field === 'contestTitle' ? b.contestTitle : (b.author?.displayName || b.author?.email || '')
			return winnersSort.desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
		})
		return r
	}, [allWinners, winnersSort, winnersFilter])

	const winnersTotalPages = Math.ceil(filteredWinners.length / PAGE_SIZE)

	const handleSort = (t, f) => t === 'm' ? setMedalsSort(p => ({ field: f, desc: p.field === f ? !p.desc : true })) : setWinnersSort(p => ({ field: f, desc: p.field === f ? !p.desc : false }))
	const S = ({ f, c }) => <span className="ml-1">{c.field === f ? (c.desc ? '▼' : '▲') : ''}</span>

	if (loading) return <div className="bg-gray-900 text-white px-6 py-10"><div className="max-w-4xl mx-auto"><p className="text-gray-400">Loading...</p></div></div>

	return (
		<div className="bg-gray-900 text-white px-6 py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">🏆 Global Leaderboard</h1>
					<Link to="/" className="text-gray-400 hover:text-white">← Back</Link>
				</div>

				<StatsCards completedContests={completedContests.length} totalWinners={allWinners.length} />

				<WinnersTable
					winners={allWinners}
					filteredWinners={filteredWinners}
					winnersPage={winnersPage}
					setWinnersPage={setWinnersPage}
					winnersTotalPages={winnersTotalPages}
					winnersFilter={winnersFilter}
					setWinnersFilter={setWinnersFilter}
					winnersSort={winnersSort}
					handleSort={handleSort}
					S={S}
				/>

				<MedalsTable
					userMedals={userMedals}
					filteredMedals={filteredMedals}
					medalsPage={medalsPage}
					setMedalsPage={setMedalsPage}
					medalsTotalPages={medalsTotalPages}
					medalsFilter={medalsFilter}
					setMedalsFilter={setMedalsFilter}
					medalsSort={medalsSort}
					handleSort={handleSort}
					S={S}
					API_URL={API_URL}
				/>
			</div>
		</div>
	)
}