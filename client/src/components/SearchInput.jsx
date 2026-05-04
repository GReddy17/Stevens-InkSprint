function SearchInput({ searchTerm, setSearchTerm, placeholderText }) {
	return (
		<input
			type="text"
			value={searchTerm}
			onChange={(event) => setSearchTerm(event.target.value)}
			placeholder={placeholderText}
			className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
		/>
	)
}

export default SearchInput
