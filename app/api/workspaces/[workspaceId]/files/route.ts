import { authorizeWorkspace, jsonError } from '@/lib/security/authorization'
import { readWorkspaceFile, writeWorkspaceFile } from '@/lib/adapters/workspace/local-workspace'

type Context = { params: Promise<{ workspaceId: string }> }
export async function GET(request: Request, { params }: Context) {
  try { const { workspaceId } = await params; authorizeWorkspace(request, workspaceId, 'read'); const path = new URL(request.url).searchParams.get('path'); return Response.json(await readWorkspaceFile(path)) } catch (error) { return jsonError(error) }
}
export async function PUT(request: Request, { params }: Context) {
  try { const { workspaceId } = await params; authorizeWorkspace(request, workspaceId, 'write'); const body = await request.json(); return Response.json(await writeWorkspaceFile(body.path, body.content, body.expectedMtimeMs)) } catch (error) { return jsonError(error) }
}
