import { authorizeWorkspace, jsonError } from '@/lib/security/authorization'
import { localWorkspace } from '@/lib/adapters/workspace/local-workspace'

export async function GET(request: Request) {
  try { authorizeWorkspace(request, 'local', 'list'); return Response.json({ workspaces: [localWorkspace] }) } catch (error) { return jsonError(error) }
}

export async function POST(request: Request) {
  try { authorizeWorkspace(request, 'local', 'create'); return Response.json({ workspace: localWorkspace }, { status: 200 }) } catch (error) { return jsonError(error) }
}
