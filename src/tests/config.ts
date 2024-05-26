import dotenv from 'dotenv'

dotenv.config()

export const BASE_URL = 'https://api.github.com'
export const TOKEN = process.env.TOKEN!
export const USER_AGENT = process.env.USER_AGENT!
export const USERNAME = process.env.USERNAME
