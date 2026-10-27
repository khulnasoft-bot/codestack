'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  Bell,
  BookOpen,
  Box,
  Braces,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  Command,
  Copy,
  Ellipsis,
  ExternalLink,
  FileCode2,
  FileJson,
  Files,
  GitBranch,
  GitCommitHorizontal,
  GitCompare,
  GitPullRequest,
  LayoutPanelLeft,
  Maximize2,
  Menu,
  MessageSquareMore,
  MoreHorizontal,
  PanelBottom,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Split,
  Terminal,
  UserRound,
  X,
  Zap,
} from 'lucide-react'

type View = 'explorer' | 'search' | 'source' | 'run' | 'extensions' | 'guides'
type FileItem = { name: string; type: 'file' | 'folder'; language?: string; children?: FileItem[] }

const files: FileItem[] = [
  { name: 'app', type: 'folder', children: [
    { name: 'page.tsx', type: 'file', language: 'TypeScript React' },
    { name: 'layout.tsx', type: 'file', language: 'TypeScript React' },
    { name: 'globals.css', type: 'file', language: 'CSS' },
  ] },
  { name: 'components', type: 'folder', children: [
    { name: 'ide-shell.tsx', type: 'file', language: 'TypeScript React' },
    { name: 'ui', type: 'folder', children: [{ name: 'button.tsx', type: 'file', language: 'TypeScript React' }] },
  ] },
  { name: 'lib', type: 'folder', children: [{ name: 'utils.ts', type: 'file', language: 'TypeScript' }] },
  { name: 'package.json', type: 'file', language: 'JSON' },
  { name: 'tsconfig.json', type: 'file', language: 'JSON' },
  { name: 'README.md', type: 'file', language: 'Markdown' },
]

const content: Record<string, string> = {
  'page.tsx': `import { IDE } from '@/components/ide/ide-shell'\n\nexport default function Page() {\n  return <IDE />\n}`,
  'layout.tsx': `import type { Metadata } from 'next'\n\nexport const metadata: Metadata = {\n  title: 'Web IDE',\n  description: 'A browser-based development workspace',\n}`,
  'globals.css': `@import 'tailwindcss';\n\n:root {\n  --background: #0b0d10;\n  --foreground: #e4e7ec;\n}`,
  'ide-shell.tsx': `export function IDE() {\n  return <WorkspaceShell />\n}`,
  'utils.ts': `export function cn(...inputs: string[]) {\n  return inputs.filter(Boolean).join(' ')\n}`,
  'package.json': `{"name":"web-ide","private":true,"scripts":{"dev":"next dev"}}`,
  'tsconfig.json': `{"compilerOptions":{"strict":true,"jsx":"react-jsx"}}`,
  'README.md': `# Web IDE\n\nA browser-based development workspace.`,
}

const viewMeta: Record<View, { label: string; icon: typeof Files }> = {
  explorer: { label: 'Explorer', icon: Files },
  search: { label: 'Search', icon: Search },
  source: { label: 'Source Control', icon: GitBranch },
  run: { label: 'Run and Debug', icon: Play },
  extensions: { label: 'Extensions', icon: Box },
  guides: { label: 'Development Guides', icon: BookOpen },
}

function IconButton({ label, children, active = false, onClick }: { label: string; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button className={`icon-button ${active ? 'active' : ''}`} aria-label={label} title={label} onClick={onClick}>{children}</button>
}

function ActivityBar({ view, setView }: { view: View; setView: (view: View) => void }) {
  const top: View[] = ['explorer', 'search', 'source', 'run', 'extensions', 'guides']
  return <nav className="activity-bar" aria-label="Activity bar">
    <div className="activity-brand"><Code2 size={20} strokeWidth={2.3} /></div>
    <div className="activity-items">{top.map((item) => { const Icon = viewMeta[item].icon; return <IconButton key={item} label={viewMeta[item].label} active={view === item} onClick={() => setView(item)}><Icon size={19} /></IconButton> })}</div>
    <div className="activity-bottom"><IconButton label="Accounts"><UserRound size={18} /></IconButton><IconButton label="Settings" onClick={() => setView('explorer')}><Settings size={19} /></IconButton></div>
  </nav>
}

function TitleBar({ onCommand }: { onCommand: () => void }) {
  return <header className="title-bar">
    <div className="title-left"><div className="window-dots"><span /><span /><span /></div><span className="workspace-title">Web IDE</span><span className="title-separator">/</span><span className="repo-name">starter-web-ide</span></div>
    <div className="command-center" role="button" tabIndex={0} onClick={onCommand}><Command size={14} /><span>Search files, commands, and settings</span><kbd>⌘ P</kbd></div>
    <div className="title-actions"><IconButton label="Back"><ChevronRight className="rotate-180" size={16} /></IconButton><IconButton label="Forward"><ChevronRight size={16} /></IconButton><IconButton label="Notifications"><Bell size={16} /></IconButton><IconButton label="Layout"><LayoutPanelLeft size={16} /></IconButton><div className="avatar">JD</div></div>
  </header>
}

function FileTree({ onOpen }: { onOpen: (name: string) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ app: true, components: true, lib: false, ui: false })
  const render = (items: FileItem[], depth = 0) => items.map((item) => item.type === 'folder' ? <div key={item.name}><button className="tree-row folder-row" style={{ paddingLeft: 10 + depth * 14 }} onClick={() => setExpanded((v) => ({ ...v, [item.name]: !v[item.name] }))}><ChevronRight size={13} className={expanded[item.name] ? 'chevron-open' : ''} /><span className="folder-glyph">{expanded[item.name] ? '▾' : '▸'}</span><span>{item.name}</span></button>{expanded[item.name] && item.children && render(item.children, depth + 1)}</div> : <button key={item.name} className="tree-row file-row" style={{ paddingLeft: 25 + depth * 14 }} onClick={() => onOpen(item.name)}><FileGlyph name={item.name} /><span>{item.name}</span></button>)
  return <div className="file-tree">{render(files)}</div>
}

function FileGlyph({ name }: { name: string }) { if (name.endsWith('.json')) return <FileJson size={15} className="file-json" />; if (name.endsWith('.tsx')) return <Braces size={15} className="file-ts" />; if (name.endsWith('.css')) return <span className="css-glyph">#</span>; return <FileCode2 size={15} className="file-muted" /> }

function ExplorerView({ onOpen }: { onOpen: (name: string) => void }) {
  return <><div className="sidebar-heading"><span>EXPLORER</span><div><IconButton label="New file"><Plus size={15} /></IconButton><IconButton label="More actions"><MoreHorizontal size={16} /></IconButton></div></div><div className="workspace-label"><ChevronDown size={13} /> STARTER-WEB-IDE <span className="workspace-actions"><RefreshCw size={13} /><Ellipsis size={15} /></span></div><FileTree onOpen={onOpen} /><div className="sidebar-spacer" /><div className="outline-row"><ChevronRight size={13} /> OUTLINE</div><div className="outline-row"><ChevronRight size={13} /> TIMELINE</div></>
}

function Sidebar({ view, onOpen }: { view: View; onOpen: (name: string) => void }) {
  if (view === 'explorer') return <ExplorerView onOpen={onOpen} />
  const meta = viewMeta[view]
  return <div className="alternate-view"><div className="sidebar-heading"><span>{meta.label.toUpperCase()}</span><IconButton label="More actions"><MoreHorizontal size={16} /></IconButton></div>{view === 'search' && <><div className="search-box"><Search size={14} /><span>Search in files</span></div><div className="empty-sidebar"><Search size={28} /><p>Search across your workspace</p><small>Use the search box to find text in all files.</small></div></>}{view === 'source' && <><div className="branch-card"><GitBranch size={15} /> main <ChevronDown size={14} /></div><div className="change-heading">CHANGES <span>2</span></div><div className="change-file"><span className="change-dot">M</span> app/page.tsx <span className="change-action">+</span></div><div className="change-file"><span className="change-dot">U</span> components/ide-shell.tsx <span className="change-action">+</span></div><button className="commit-button"><GitCommitHorizontal size={15} /> Commit staged changes</button></>}{view === 'run' && <div className="empty-sidebar"><Play size={28} /><p>No launch configurations</p><small>Add a .vscode/launch.json to get started.</small></div>}{view === 'extensions' && <><div className="search-box"><Search size={14} /><span>Search extensions</span></div><ExtensionRow icon="✦" name="ESLint" detail="Microsoft · 13.4M installs" /><ExtensionRow icon="TS" name="TypeScript Import Sorter" detail="zackiria · 1.2M installs" /><ExtensionRow icon="◇" name="Tailwind CSS IntelliSense" detail="Tailwind Labs · 6.8M installs" /></>}{view === 'guides' && <GuidesView />}</div>
}

function ExtensionRow({ icon, name, detail }: { icon: string; name: string; detail: string }) { return <button className="extension-row"><span className="extension-icon">{icon}</span><span><strong>{name}</strong><small>{detail}</small></span></button> }
function GuidesView() { return <div className="guide-list"><div className="guide-summary"><BookOpen size={18} /><div><strong>Project guides</strong><small>Architecture and implementation notes</small></div></div><div className="guide-item active-guide"><span className="guide-status done">✓</span><span><strong>IDE foundation</strong><small>Shell, editor, and terminal</small></span></div><div className="guide-item"><span className="guide-status progress">◒</span><span><strong>Workspace adapters</strong><small>Filesystem and persistence</small></span></div><div className="guide-item"><span className="guide-status blocked">!</span><span><strong>Production hardening</strong><small>Auth, security, testing</small></span></div></div> }

function Editor({ tabs, activeFile, setActiveFile, setTabs, dirty, setDirty }: { tabs: string[]; activeFile: string; setActiveFile: (name: string) => void; setTabs: (tabs: string[]) => void; dirty: boolean; setDirty: (value: boolean) => void }) {
  const [value, setValue] = useState(content[activeFile] ?? '')
  useEffect(() => { setValue(content[activeFile] ?? '') }, [activeFile])
  const lines = value.split('\\n')
  return <section className="editor-area"><div className="tabs-row">{tabs.map((tab) => <button key={tab} className={`editor-tab ${activeFile === tab ? 'active-tab' : ''}`} onClick={() => setActiveFile(tab)}><FileGlyph name={tab} /><span>{tab}</span>{activeFile === tab && dirty ? <CircleDot size={13} className="dirty-dot" /> : <X size={13} className="tab-close" onClick={(e) => { e.stopPropagation(); const next = tabs.filter((t) => t !== tab); setTabs(next); if (activeFile === tab && next[0]) setActiveFile(next[0]) }} />}</button>)}<button className="tab-add" aria-label="Split editor"><Split size={15} /></button><button className="tab-add" aria-label="More editor actions"><Ellipsis size={16} /></button></div><div className="breadcrumb"><span>app</span><ChevronRight size={13} /><span className="crumb-active">{activeFile}</span><span className="breadcrumb-spacer" /><IconButton label="Split editor"><Split size={14} /></IconButton><IconButton label="More editor actions"><Ellipsis size={15} /></IconButton></div><div className="code-wrap"><div className="minimap"><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /></div><div className="line-numbers">{lines.map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea aria-label={`Editing ${activeFile}`} spellCheck={false} value={value} onChange={(event) => { setValue(event.target.value); setDirty(true) }} className="code-editor" /></div><div className="editor-find"><Search size={14} /><span>Find</span><span className="find-count">⌘ F</span></div></section>
}

function TerminalPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) { return <section className={`terminal-panel ${open ? '' : 'collapsed'}`}><div className="panel-tabs"><button className="panel-tab active"><Terminal size={14} /> TERMINAL</button><button className="panel-tab"><AlertCircle size={14} /> PROBLEMS <span className="problem-count">2</span></button><button className="panel-tab"><Activity size={14} /> OUTPUT</button><button className="panel-tab">DEBUG CONSOLE</button><button className="panel-tab">PORTS</button><span className="panel-spacer" /><IconButton label="New terminal"><Plus size={15} /></IconButton><IconButton label="Split terminal"><Split size={15} /></IconButton><IconButton label="Collapse panel" onClick={onToggle}><ChevronDown size={16} /></IconButton></div>{open && <div className="terminal-body"><div className="terminal-line"><span className="terminal-muted">➜</span> <span className="terminal-path">~/starter-web-ide</span> <span className="terminal-command">pnpm dev</span></div><div className="terminal-output">▲ Next.js 16.4.3<br /><span className="terminal-success">✓ Ready in 1.8s</span><br /><br /><span className="terminal-muted">○</span> Local: <span className="terminal-link">http://localhost:3000</span><br /><span className="terminal-muted">○</span> Network: use --host to expose</div><div className="terminal-line cursor-line"><span className="terminal-muted">➜</span> <span className="terminal-path">~/starter-web-ide</span> <span className="terminal-cursor" /></div></div>}</section> }

function StatusBar({ dirty }: { dirty: boolean }) { return <footer className="status-bar"><div className="status-left"><span><GitBranch size={13} /> main</span><span><GitPullRequest size={13} /> 0</span><span className="sync-status">↻</span></div><div className="status-right"><span><AlertCircle size={13} /> 2</span><span>Ln 1, Col 1</span><span>Spaces: 2</span><span>UTF-8</span><span>LF</span><span><Braces size={13} /> TypeScript React</span><span className="status-feedback"><MessageSquareMore size={14} /></span><span>{dirty ? 'Unsaved changes' : 'Ready'}</span></div></footer> }

export function IDE() {
  const [view, setView] = useState<View>('explorer')
  const [tabs, setTabs] = useState(['page.tsx', 'layout.tsx', 'globals.css'])
  const [activeFile, setActiveFile] = useState('page.tsx')
  const [dirty, setDirty] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [paletteQuery, setPaletteQuery] = useState('')

  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); setPaletteOpen(true) } if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); setDirty(false) } if (event.key === 'Escape') setPaletteOpen(false) }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [])
  const openFile = (name: string) => { setActiveFile(name); if (!tabs.includes(name)) setTabs([...tabs, name]) }
  const commands = ['Open File', 'Save', 'Save All', 'Find in Files', 'Toggle Terminal', 'Split Editor', 'Toggle Theme', 'Open Development Guides', 'Reload Workspace']
  const filtered = useMemo(() => commands.filter((command) => command.toLowerCase().includes(paletteQuery.toLowerCase())), [paletteQuery])

  return <main className={`ide-app ${theme}`}><TitleBar onCommand={() => setPaletteOpen(true)} /><div className="ide-body"><ActivityBar view={view} setView={setView} /><aside className="sidebar"><Sidebar view={view} onOpen={openFile} /></aside><div className="workbench"><div className="workbench-main"><Editor tabs={tabs} activeFile={activeFile} setActiveFile={setActiveFile} setTabs={setTabs} dirty={dirty} setDirty={setDirty} /><TerminalPanel open={terminalOpen} onToggle={() => setTerminalOpen(!terminalOpen)} /></div><StatusBar dirty={dirty} /></div></div>{paletteOpen && <div className="palette-backdrop" onClick={() => setPaletteOpen(false)}><div className="command-palette" onClick={(e) => e.stopPropagation()}><div className="palette-input"><Search size={16} /><input autoFocus value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Type a command to search..." /></div><div className="palette-section">COMMANDS</div>{filtered.map((command, index) => <button key={command} className="palette-command" onClick={() => { if (command === 'Toggle Terminal') setTerminalOpen(!terminalOpen); if (command === 'Toggle Theme') setTheme(theme === 'dark' ? 'light' : 'dark'); if (command === 'Open Development Guides') setView('guides'); setPaletteOpen(false) }}><span className="command-icon">{index === 0 ? <Files size={15} /> : index === 1 ? <Copy size={15} /> : <Zap size={15} />}</span><span>{command}</span><kbd>{index === 0 ? '⌘ P' : index === 1 ? '⌘ S' : ''}</kbd></button>)}</div></div>}</main>
}
