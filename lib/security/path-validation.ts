import path from 'node:path'
import { realpath } from 'node:fs/promises'
import { WorkspaceError } from '@/lib/domain/workspace'

const MAX_RELATIVE_PATH = 512

export function validateRelativePath(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0 || input.length > MAX_RELATIVE_PATH) {
    throw new WorkspaceError('INVALID_PATH', 'A relative file path is required.', 400)
  }
  const normalized = input.replaceAll('\\', '/')
  if (normalized.startsWith('/') || normalized.split('/').includes('..') || normalized.includes('\0')) {
    throw new WorkspaceError('INVALID_PATH', 'Path must stay inside the workspace.', 400)
  }
  const result = path.posix.normalize(normalized)
  if (result === '.' || result.startsWith('../') || path.posix.isAbsolute(result)) {
    throw new WorkspaceError('INVALID_PATH', 'Path must stay inside the workspace.', 400)
  }
  return result
}

export async function resolveWorkspacePath(root: string, relativePath: unknown): Promise<string> {
  const safePath = validateRelativePath(relativePath)
  const rootReal = await realpath(root)
  const candidate = path.resolve(rootReal, safePath)
  if (candidate !== rootReal && !candidate.startsWith(`${rootReal}${path.sep}`)) {
    throw new WorkspaceError('INVALID_PATH', 'Path must stay inside the workspace.', 400)
  }
  return candidate
}
