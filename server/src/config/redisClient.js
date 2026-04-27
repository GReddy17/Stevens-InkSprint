import { createClient } from 'redis'

let redisClient = null

export async function connectRedis() {
  if (redisClient) return redisClient

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  })

  redisClient.on('error', (err) => {
    console.error('Redis error:', err.message)
  })

  await redisClient.connect()
  console.log('Redis connected')
  return redisClient
}

export async function getRedis() {
  if (!redisClient) return await connectRedis()
  return redisClient
}