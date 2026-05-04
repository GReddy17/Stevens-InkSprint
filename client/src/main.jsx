import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import './index.css'
import App from './App.jsx'
import { auth } from './firebase'

// HTTP link
const httpLink = new HttpLink({
	uri: 'http://localhost:4000',
})

// Auth link
const authLink = setContext(async (_, { headers }) => {
	let token = null

	if (auth.currentUser) {
		token = await auth.currentUser.getIdToken()
	}

	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
		},
	}
})

// Combine links
const client = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ApolloProvider>
	</StrictMode>,
)
