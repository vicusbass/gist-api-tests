import request from 'supertest'
import TestAgent from 'supertest/lib/agent'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { BASE_URL, USER_AGENT, GITHUB_TOKEN, GITHUB_USERNAME } from './config'
import { gistResponseSchema } from '../schema/createGistResponse'

let req: TestAgent
const ajv = new Ajv()
addFormats(ajv)
const validate = ajv.compile(gistResponseSchema)

let gistId: string
let gistUrl: string
const gistContent = {
  description: 'test gist',
  public: false,
  files: {
    'temporary.txt': {
      content: 'test content',
    },
  },
}

describe('GitHub private Gists API', () => {
  describe('/gists', () => {
    beforeEach(async () => {
      req = request.agent(BASE_URL)
      req.set('Authorization', `Bearer ${GITHUB_TOKEN}`)
      req.set('Accept', 'application/vnd.github.v3+json')
      req.set('User-Agent', USER_AGENT)

      // create a private gist for the authenticated user as test data
      const response = await req.post('/gists').send(gistContent)
      expect(response.status).toBe(201)
      gistUrl = response.body.url
      expect(gistUrl).toBeDefined()
      const isResponseValid = validate(response.body)
      if (!isResponseValid) {
        console.error(validate.errors)
      }
      expect(isResponseValid).toBe(true)

      const parts = gistUrl.split('/')
      gistId = parts[parts.length - 1]
    }),
      it('should get the newly created gist', async () => {
        const response = await req.get(`/gists/${gistId}`)
        expect(response.status).toBe(200)
        expect(response.body.owner.login).toBe(GITHUB_USERNAME)
        expect(response.body.public).toBe(false)
        expect(response.body.files).toMatchObject(gistContent.files)

        const isResponseValid = validate(response.body)
        if (!isResponseValid) {
          console.error(validate.errors)
        }
        expect(isResponseValid).toBe(true)
      }),
      it('should get a list of gists for the authenticated user', async () => {
        const response = await req.get('/gists')
        expect(response.status).toBe(200)
        expect(response.body.length).toBeGreaterThan(0)
        const gist = response.body.find((g: { id: string }) => g.id === gistId)
        expect(gist).toBeDefined()
      }),
      it('should return 404 for a non-existing gist id', async () => {
        const nonExistingId = 'there-is-no-way-this-id-exists'
        const response = await req.get(`/gists/${nonExistingId}`)
        expect(response.status).toBe(404)
      })
    afterEach(async () => {
      // delete the gist created as test data
      const response = await req.delete(`/gists/${gistId}`)
      expect(response.status).toBe(204)
      req.get(gistUrl).expect(404)
    })
  })
})
