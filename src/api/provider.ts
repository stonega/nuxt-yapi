import { ofetch, type $Fetch } from 'ofetch'
import type { OpArgType, OpReturnType } from './fetcher'

export interface ApiProvider {
  fetch: $Fetch
}

export class Provider {
  constructor(apiProvider: ApiProvider) {
    this.apiProvider = apiProvider
  }

  apiProvider: ApiProvider

  setBaseUrl(url: string) {
    this.apiProvider = {
      fetch: ofetch.create({
        baseURL: url,
        headers: {
          'Content-Type': 'application/json',
          'accept-language': 'en-US',
        },
        retry: 3,
        retryDelay: 500,
        parseResponse: (data: string) => {
          const response = JSON.parse(data)
          if (response.code !== '000') {
            throw new Error(response.msg || 'Network error')
          }
          else {
            return response.data
          }
        },
      }),
    }
  }

  fetcher<Paths>() {
    return {
      path: <P extends keyof Paths>(path: P) => ({
        method: <M extends keyof Paths[P]>(method: M) => ({
          create: () => {
            switch (method) {
              case 'get':
                return (
                  params: OpArgType<Paths[P][M]>,
                  token?: string,
                ): Promise<OpReturnType<Paths[P][M]>> => {
                  return this.apiProvider.fetch<OpReturnType<Paths[P][M]>>(
                    path as string,
                    {
                      // @ts-expect-error ignore type
                      query: params,
                      headers: token
                        ? {
                            authorization: `Bearer ${token}`,
                          }
                        : {},
                    },
                  )
                }
              case 'post':
                return (
                  params: OpArgType<Paths[P][M]>,
                  token?: string,
                ): Promise<OpReturnType<Paths[P][M]>> => {
                  return this.apiProvider.fetch<OpReturnType<Paths[P][M]>>(
                    path as string,
                    {
                      method: 'POST',
                      // @ts-expect-error ignore type
                      body: params,
                      headers: token
                        ? {
                            authorization: `Bearer ${token}`,
                          }
                        : {},
                    },
                  )
                }
              case 'put':
                return (
                  params: OpArgType<Paths[P][M]>,
                ): Promise<OpReturnType<Paths[P][M]>> => {
                  return this.apiProvider.fetch<OpReturnType<Paths[P][M]>>(
                    path as string,
                    {
                      method: 'PUT',
                      // @ts-expect-error ignore type
                      body: params,
                    },
                  )
                }
              case 'delete':
                return (
                  params: OpArgType<Paths[P][M]>,
                ): Promise<OpReturnType<Paths[P][M]>> => {
                  return this.apiProvider.fetch<OpReturnType<Paths[P][M]>>(
                    path as string,
                    {
                      method: 'DELETE',
                      // @ts-expect-error ignore type
                      body: params,
                    },
                  )
                }
              default:
                break
            }
          },
        }),
      }),
    }
  }
}
