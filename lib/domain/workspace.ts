export type WorkspaceStatus = 'connected' | 'disconnected' | 'unavailable'

export type WorkspaceCapabilities = {
  filesystem: boolean
  git: boolean
  terminal: boolean
  languageServices: string[]
}

export type Workspace = {
  id: string
  name: string
  status: WorkspaceStatus
  capabilities: WorkspaceCapabilities
  createdAt: string
  updatedAt: string
}

export class WorkspaceError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 400) {
    super(message)
    this.name = 'WorkspaceError'
  }
}
