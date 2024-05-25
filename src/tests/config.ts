import dotenv from 'dotenv'

dotenv.config()

export const BASE_URL = 'https://api.github.com'
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
export const USER_AGENT = process.env.USER_AGENT!
export const GITHUB_USERNAME = process.env.GITHUB_USERNAME
