import request from 'supertest'
import dotenv from 'dotenv'
import TestAgent from 'supertest/lib/agent'

dotenv.config()

const BASE_URL = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const USER_AGENT = process.env.USER_AGENT || 'vicusbass'

let req: TestAgent

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
          .set('Authorization', `Bearer ${GITHUB_TOKEN}`)
          .set('Accept', 'application/vnd.github.v3+json')
        expect(response.status).toBe(403)
      })
  }),
    describe('GET /gists/public', () => {
      beforeEach(() => {
        req = request.agent(BASE_URL)
        req.set('Authorization', `Bearer ${GITHUB_TOKEN}`)
        req.set('Accept', 'application/vnd.github.v3+json')
        req.set('User-Agent', USER_AGENT)
      })
      it('should get a list of maximum 30 public gists by default', async () => {
        const response = await req.get('/gists')
        expect(response.status).toBe(200)
        expect(response.body).toBeInstanceOf(Array)
        expect(response.body.length).toBeGreaterThan(0)
        expect(response.body.length).toBeLessThanOrEqual(30)
      }),
        it('should get a list of public gists with a given limit', async () => {
          const limit = 2
          const response = await req.get(`/gists/public?per_page=${limit}`)
          expect(response.status).toBe(200)
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body.length).toBeGreaterThan(0)
          expect(response.body.length).toBeLessThanOrEqual(limit)
        }),
        it('should be paginated', async () => {
          const response = await req.get(`/gists/public?per_page=1&page=5`)
          expect(response.status).toBe(200)
          expect(response.body).toBeInstanceOf(Array)
          expect(response.headers).toHaveProperty('link')
          expect(response.headers.link).toContain(
            '/gists/public?per_page=1&page=6>; rel="next"',
          )
          expect(response.headers.link).toContain(
            '/gists/public?per_page=1&page=4>; rel="prev"',
          )
        }),
        it.each([0, -3, 101])(
          'should ignore limits higher than 100 or smaller than 1: value %p',
          async limit => {
            const response = await req.get(`/gists/public?per_page=${limit}`)
            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
            const expectedLength = limit <= 0 ? 30 : 100
            expect(response.body.length).toEqual(expectedLength)
          },
        ),
        it('should return gists newer than a given date', async () => {
          const date = new Date()
          date.setDate(date.getDate() - 7)
          const response = await req.get(
            `/gists/public?since=${date.toISOString()}`,
          )
          expect(response.status).toBe(200)
          expect(response.body).toBeInstanceOf(Array)
          expect(response.body.length).toBeGreaterThan(0)
          response.body.forEach((gist: { updated_at: string }) => {
            expect(gist).toHaveProperty('updated_at')
            expect(new Date(gist.updated_at).getTime()).toBeGreaterThanOrEqual(
              date.getTime(),
            )
          })
        })
    })
})
