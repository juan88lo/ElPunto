import { vi } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import React from 'react'

// Mock para Apollo Client
export const mockApolloClient = {
  query: vi.fn(),
  mutate: vi.fn(),
  watchQuery: vi.fn(),
  readQuery: vi.fn(),
  writeQuery: vi.fn(),
  clearStore: vi.fn(),
  resetStore: vi.fn(),
}

// Mock Provider para Apollo
export const createMockProvider = (mocks: any[] = []) => {
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(MockedProvider, { mocks, addTypename: false }, children)
  )
}

// Helper para crear mocks de GraphQL
export const createGraphQLMock = (query: any, variables: any = {}, result: any) => ({
  request: {
    query,
    variables,
  },
  result: {
    data: result,
  },
})

export const createGraphQLErrorMock = (query: any, variables: any = {}, error: string) => ({
  request: {
    query,
    variables,
  },
  error: new Error(error),
})
