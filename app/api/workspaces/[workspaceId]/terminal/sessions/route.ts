import { authorizeWorkspace, jsonError } from '@/lib/security/authorization'
import { WorkspaceError } from '@/lib/domain/workspace'
type Context = { params: Promise<{ workspaceId: string }> }
export async function POST(request: Request, { params }: Context) {
  try { const { workspaceId } = await params; authorizeWorkspace(request, workspaceId, 'terminal'); throw new WorkspaceError('TERMINAL_UNAVAILABLE', 'Persistent terminal sessions require an isolated workspace service.', 503) } catch (error) { return jsonError(error) }
}
