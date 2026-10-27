import type { Workspace } from '@/lib/domain/workspace'

export type GitStatus = { branch: string | null; changed: string[]; staged: string[]; untracked: string[] }
export type TerminalSession = { id: string; workspaceId: string; status: 'starting' | 'running' | 'exited'; createdAt: string }
export type LanguageDiagnostic = { filePath: string; startLine: number; startColumn: number; endLine: number; endColumn: number; severity: 'error' | 'warning' | 'info'; message: string }

export interface WorkspaceService { list(request: Request): Promise<Workspace[]> }
export interface GitService { status(workspaceId: string): Promise<GitStatus> }
export interface TerminalService { create(workspaceId: string, owner: string): Promise<TerminalSession>; terminate(sessionId: string, owner: string): Promise<void> }
export interface LanguageService { diagnostics(workspaceId: string, filePath: string, content: string): Promise<LanguageDiagnostic[]> }
