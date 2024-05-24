import request from 'supertest'
import dotenv from 'dotenv'
import TestAgent from 'supertest/lib/agent'

dotenv.config()

const BASE_URL = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const USER_AGENT = process.env.USER_AGENT || 'vicusbass'

let req: TestAgent

beforeEach(() => {
  req = request.agent(BASE_URL)
  req.set('Authorization', `Bearer ${GITHUB_TOKEN}`)
  req.set('Accept', 'application/vnd.github.v3+json')
  req.set('User-Agent', USER_AGENT)
})

describe('GitHub Gist API', () => {
  describe('GET /gists/public', () => {
    it('should get a list of maximum 30 public gists by default', async () => {
      const response = await req.get('/gists')
      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body.length).toBeLessThanOrEqual(30)
    })
  })
})
