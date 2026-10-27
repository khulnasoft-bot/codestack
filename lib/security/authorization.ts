import { WorkspaceError } from '@/lib/domain/workspace'

export function authorizeWorkspace(request: Request, workspaceId: string, action: string) {
  if (workspaceId !== 'local') throw new WorkspaceError('WORKSPACE_FORBIDDEN', 'Workspace access denied.', 403)
  const user = request.headers.get('x-workspace-user')
  if (process.env.NODE_ENV === 'production' && !user) throw new WorkspaceError('UNAUTHENTICATED', 'Authentication is required.', 401)
  if (user && user.length > 128) throw new WorkspaceError('UNAUTHENTICATED', 'Authentication is invalid.', 401)
  return { principal: user ?? 'local-development', action }
}

export function jsonError(error: unknown) {
  const known = error instanceof WorkspaceError ? error : new WorkspaceError('INTERNAL_ERROR', 'Workspace operation failed.', 500)
  return Response.json({ error: { code: known.code, message: known.message } }, { status: known.status })
}
