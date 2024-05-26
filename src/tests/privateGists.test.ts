import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { BASE_URL, USER_AGENT, TOKEN, USERNAME } from './config'
import { gistResponseSchema } from '../schema/createGistResponse'
import ApiClient, { GistContent } from '../client/apiClient'

const apiClient: ApiClient = new ApiClient(BASE_URL, TOKEN, USER_AGENT)

const ajv = new Ajv()
addFormats(ajv)
const validate = ajv.compile(gistResponseSchema)

let gistId: string
let gistUrl: string
const gistContent: GistContent = {
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
      // create a private gist for the authenticated user as test data
      const response = await apiClient.createGist(gistContent)
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
        const response = await apiClient.getGist(gistId)
        expect(response.status).toBe(200)
        expect(response.body.owner.login).toBe(USERNAME)
        expect(response.body.public).toBe(false)

        // validate against JSON schema
        const isResponseValid = validate(response.body)
        if (!isResponseValid) {
          console.error(validate.errors)
        }
        expect(isResponseValid).toBe(true)
      }),
      it('should get a list of gists for the authenticated user', async () => {
        const response = await apiClient.getGists()
        expect(response.status).toBe(200)
        expect(response.body.length).toBeGreaterThan(0)
        const gist = response.body.find((g: { id: string }) => g.id === gistId)
        expect(gist).toBeDefined()
      }),
      it('should return 404 for a non-existing gist id', async () => {
        const nonExistingId = 'there-is-no-way-this-id-exists'
        const response = await apiClient.getGist(nonExistingId)
        expect(response.status).toBe(404)
      }),
      it('should get secret gist from another user', async () => {
        const nonExistingId = 'ebcf6e4c02ecd21f65aac28321e77ddf'
        const response = await apiClient.getGist(nonExistingId)
        expect(response.status).toBe(200)
        expect(response.body.owner.login).toBe('vasiloa')
      }),
      it('should update the gist', async () => {
        const newContent = {
          description: 'updated test gist',
        }
        let response = await apiClient.updateGist(gistId, newContent)
        expect(response.status).toBe(200)
        expect(response.body.description).toBe(newContent.description)
        expect(response.body.public).toBe(gistContent.public)
        expect(response.body).toHaveProperty('files')
        expect(response.body.files).toMatchObject({
          'temporary.txt': expect.any(Object),
        })
        // making sure gist was updated
        response = await apiClient.getGist(gistId)
        expect(response.body.description).toBe(newContent.description)
      }),
      it('should return 404 when updating non-existing gist', async () => {
        const nonExistingId = 'there-is-no-way-this-id-exists'
        const newContent = {
          description: 'updated test gist',
        }
        const response = await apiClient.updateGist(nonExistingId, newContent)
        expect(response.status).toBe(404)
      }),
      afterEach(async () => {
        // delete the gist created as test data
        let response = await apiClient.deleteGist(gistId)
        expect(response.status).toBe(204)
        response = await apiClient.getGist(gistId)
        expect(response.status).toBe(404)
      })
  })
})
