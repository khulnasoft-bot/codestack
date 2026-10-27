import { authorizeWorkspace, jsonError } from '@/lib/security/authorization'
import { getWorkspaceTree } from '@/lib/adapters/workspace/local-workspace'

type Context = { params: Promise<{ workspaceId: string }> }
export async function GET(request: Request, { params }: Context) {
  try { const { workspaceId } = await params; authorizeWorkspace(request, workspaceId, 'read'); return Response.json({ entries: await getWorkspaceTree() }) } catch (error) { return jsonError(error) }
}
