import request from 'supertest'
import { BASE_URL, USER_AGENT, TOKEN } from './config'

describe('GitHub Gist API', () => {
  describe('Invalid headers', () => {
    it('should return 200 if no token is provided', async () => {
      const response = await request(BASE_URL)
        .get('/gists')
        .set('Accept', 'application/vnd.github.v3+json')
        .set('User-Agent', USER_AGENT)
      expect(response.status).toBe(200)
    }),
      it('should return 401 if an invalid token is provided', async () => {
        const response = await request(BASE_URL)
          .get('/gists/public')
          .set('Accept', 'application/vnd.github.v3+json')
          .set('User-Agent', USER_AGENT)
          .set('Authorization', 'Bearer OH_NOES')
        expect(response.status).toBe(401)
      }),
      it('should return 403 if user agent is missing', async () => {
        const response = await request(BASE_URL)
          .get('/gists/public')
          .set('Authorization', `Bearer ${TOKEN}`)
          .set('Accept', 'application/vnd.github.v3+json')
        expect(response.status).toBe(403)
      })
  })
})
