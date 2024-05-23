import request from 'supertest'
import dotenv from 'dotenv'

dotenv.config()

const BASE_URL = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

describe('GitHub Gist API', () => {
  it('should get a list of gists for the authenticated user', async () => {
    const response = await request(BASE_URL)
      .get('/gists')
      .set('Authorization', `token ${GITHUB_TOKEN}`)
      .set('Accept', 'application/vnd.github.v3+json')

    expect(response.status).toBe(200)
  })
})
