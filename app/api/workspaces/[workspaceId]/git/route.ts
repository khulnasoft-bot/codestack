import { authorizeWorkspace, jsonError } from '@/lib/security/authorization'
import { workspaceRoot } from '@/lib/adapters/workspace/local-workspace'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const exec = promisify(execFile)
type Context = { params: Promise<{ workspaceId: string }> }
export async function GET(request: Request, { params }: Context) {
  try { const { workspaceId } = await params; authorizeWorkspace(request, workspaceId, 'git'); const { stdout } = await exec('git', ['status', '--short', '--branch'], { cwd: workspaceRoot(), timeout: 5000, maxBuffer: 256 * 1024 }); const lines = stdout.trim().split('\n').filter(Boolean); return Response.json({ branch: lines[0]?.replace(/^##\s*/, '').split('...')[0] ?? null, entries: lines.slice(1) }) } catch (error) { return jsonError(error) }
}
