import { createClient } from 'redis'

let redisClient = null
let redisConnectionAttempted = false

export async function connectRedis() {
	if (redisClient) return redisClient
	if (redisConnectionAttempted) return null

	redisConnectionAttempted = true

	try {
		const client = createClient({
			url: process.env.REDIS_URL || 'redis://localhost:6379',
			socket: {
				reconnectStrategy: false,
			},
		})

		client.on('error', (error) => {
			console.warn('Redis unavailable:', error.message)
		})

		await client.connect()

		redisClient = client
		console.log('Redis connected')
		return redisClient
	} catch (error) {
		console.warn('Redis not available, continuing without cache')
		redisClient = null
		return null
	}
}

export async function getRedis() {
	return await connectRedis()
}