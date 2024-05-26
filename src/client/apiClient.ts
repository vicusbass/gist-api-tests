import request, { Response } from 'supertest'
import TestAgent from 'supertest/lib/agent'

export type GistContent = {
  description?: string
  public?: boolean
  files?: {
    [key: string]: {
      content: string
    }
  }
}

export type PaginationParams = {
  per_page?: number
  page?: number
  since?: string
}

class ApiClient {
  private req: TestAgent

  constructor(
    private baseUrl: string,
    private token: string,
    private userAgent: string,
  ) {
    this.req = request.agent(baseUrl)
    this.req.set('Authorization', `Bearer ${token}`)
    this.req.set('Accept', 'application/vnd.github.v3+json')
    this.req.set('User-Agent', userAgent)
  }

  async createGist(content: GistContent): Promise<Response> {
    return await this.req.post('/gists').send(content)
  }

  async updateGist(id: string, content: GistContent): Promise<Response> {
    return await this.req.patch(`/gists/${id}`).send(content)
  }

  async getGist(id: string) {
    return await this.req.get(`/gists/${id}`)
  }

  async getGists() {
    return await this.req.get('/gists')
  }

  async getPublicGists(params: PaginationParams = {}) {
    const stringParams: Record<string, string> = {}
    for (const key in params) {
      if (
        Object.prototype.hasOwnProperty.call(params, key) &&
        params[key as keyof PaginationParams] !== undefined
      ) {
        stringParams[key] = String(params[key as keyof PaginationParams])
      }
    }
    const queryParams = new URLSearchParams(stringParams).toString()
    return await this.req.get(`/gists/public?${queryParams}`)
  }

  async deleteGist(id: string) {
    return await this.req.delete(`/gists/${id}`)
  }
}

export default ApiClient
