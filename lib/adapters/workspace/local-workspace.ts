import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveWorkspacePath, validateRelativePath } from '@/lib/security/path-validation'
import type { Workspace } from '@/lib/domain/workspace'
import { WorkspaceError } from '@/lib/domain/workspace'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const root = process.env.WORKSPACE_ROOT ? path.resolve(process.env.WORKSPACE_ROOT) : process.cwd()

export const localWorkspace: Workspace = {
  id: 'local', name: 'starter-web-ide', status: 'connected',
  capabilities: { filesystem: true, git: false, terminal: false, languageServices: [] },
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}

async function safePath(relativePath: unknown) {
  const resolved = await resolveWorkspacePath(root, relativePath)
  try {
    const resolvedReal = await realpathIfExists(resolved)
    const rootReal = await realpathIfExists(root)
    if (resolvedReal !== rootReal && !resolvedReal.startsWith(`${rootReal}${path.sep}`)) throw new WorkspaceError('INVALID_PATH', 'Path must stay inside the workspace.', 400)
  } catch (error) {
    if (error instanceof WorkspaceError) throw error
  }
  return resolved
}

async function realpathIfExists(target: string) {
  try { return await import('node:fs/promises').then(({ realpath }) => realpath(target)) } catch { return target }
}

function isBinary(buffer: Buffer) { return buffer.subarray(0, Math.min(buffer.length, 8192)).includes(0) }

export async function getWorkspaceTree() {
  async function walk(dir: string, relative = ''): Promise<Array<{ name: string; type: 'file' | 'folder'; path: string; size?: number }>> {
    const entries = await readdir(dir, { withFileTypes: true })
    const result = [] as Array<{ name: string; type: 'file' | 'folder'; path: string; size?: number }>
    for (const entry of entries.sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.next')) continue
      const entryPath = path.posix.join(relative, entry.name)
      if (entry.isDirectory()) result.push({ name: entry.name, type: 'folder', path: entryPath })
      else { const info = await stat(path.join(dir, entry.name)); result.push({ name: entry.name, type: 'file', path: entryPath, size: info.size }) }
    }
    return result
  }
  return walk(root)
}

export async function readWorkspaceFile(relativePath: unknown) {
  const filePath = await safePath(relativePath)
  const info = await stat(filePath).catch(() => { throw new WorkspaceError('NOT_FOUND', 'File not found.', 404) })
  if (!info.isFile()) throw new WorkspaceError('NOT_A_FILE', 'The path is not a file.', 400)
  if (info.size > MAX_FILE_BYTES) throw new WorkspaceError('FILE_TOO_LARGE', 'File exceeds the 2 MB limit.', 413)
  const buffer = await readFile(filePath)
  if (isBinary(buffer)) throw new WorkspaceError('BINARY_FILE', 'Binary files cannot be opened in the editor.', 415)
  return { path: validateRelativePath(relativePath), content: buffer.toString('utf8'), size: info.size, mtimeMs: info.mtimeMs }
}

export async function writeWorkspaceFile(relativePath: unknown, content: unknown, expectedMtimeMs?: number) {
  if (typeof content !== 'string' || Buffer.byteLength(content) > MAX_FILE_BYTES) throw new WorkspaceError('FILE_TOO_LARGE', 'File exceeds the 2 MB limit.', 413)
  const filePath = await safePath(relativePath)
  const current = await stat(filePath).catch(() => null)
  if (expectedMtimeMs !== undefined && current && Math.abs(current.mtimeMs - expectedMtimeMs) > 1) throw new WorkspaceError('CONFLICT', 'File changed on the server.', 409)
  await mkdir(path.dirname(filePath), { recursive: true })
  const temp = `${filePath}.v0-tmp-${process.pid}-${Date.now()}`
  await writeFile(temp, content, 'utf8')
  const { rename } = await import('node:fs/promises')
  await rename(temp, filePath)
  const info = await stat(filePath)
  return { path: validateRelativePath(relativePath), size: info.size, mtimeMs: info.mtimeMs }
}

export function workspaceRoot() { return root }
