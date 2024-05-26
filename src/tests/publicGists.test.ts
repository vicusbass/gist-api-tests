import { Response } from 'supertest'
import { BASE_URL, USER_AGENT, TOKEN } from './config'
import ApiClient from '../client/apiClient'

const apiClient: ApiClient = new ApiClient(BASE_URL, TOKEN, USER_AGENT)

describe('GitHub Gist API', () => {
  describe('GET /gists/public', () => {
    beforeEach(() => {})
    it('should get a list of maximum 30 public gists by default', async () => {
      const response = await apiClient.getPublicGists()
      checkResponseBody(response)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body.length).toBeLessThanOrEqual(30)
    }),
      it('should get a list of public gists with a given limit', async () => {
        const limit = 2
        const response = await apiClient.getPublicGists({ per_page: limit })
        checkResponseBody(response)
        expect(response.body.length).toBeGreaterThan(0)
        expect(response.body.length).toBeLessThanOrEqual(limit)
      }),
      it('should be paginated', async () => {
        const response = await apiClient.getPublicGists({
          per_page: 1,
          page: 5,
        })
        checkResponseBody(response)
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
          const response = await apiClient.getPublicGists({ per_page: limit })
          checkResponseBody(response)
          const expectedLength = limit <= 0 ? 30 : 100
          expect(response.body.length).toEqual(expectedLength)
        },
      ),
      it('should return gists newer than a given date', async () => {
        const date = new Date()
        date.setDate(date.getDate() - 7)
        const response = await apiClient.getPublicGists({
          since: date.toISOString(),
        })
        checkResponseBody(response)
        expect(response.body.length).toBeGreaterThan(0)
        response.body.forEach((gist: { updated_at: string }) => {
          expect(gist).toHaveProperty('updated_at')
          expect(new Date(gist.updated_at).getTime()).toBeGreaterThanOrEqual(
            date.getTime(),
          )
        })
      }),
      it('should not return gists from the future', async () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        const response = await apiClient.getPublicGists({
          since: date.toISOString(),
        })
        checkResponseBody(response)
        expect(response.body.length).toEqual(0)
      })
  })
})

const checkResponseBody = (response: Response) => {
  expect(response.status).toBe(200)
  expect(response.body).toBeInstanceOf(Array)
}
