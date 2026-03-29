import fs from 'fs'
import path from 'path'
import os from 'os'
import type { WorkspaceLayout, TerminalTemplate } from '../shared/types'

const STORE_DIR = path.join(os.homedir(), '.terminal-productivity-app')

function ensureStoreDir(): void {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true })
  }
}

function projectKey(projectPath: string): string {
  return Buffer.from(projectPath).toString('base64url')
}

function layoutPath(projectPath: string): string {
  return path.join(STORE_DIR, `${projectKey(projectPath)}.json`)
}

export class SessionStore {
  save(layout: WorkspaceLayout): void {
    ensureStoreDir()
    fs.writeFileSync(layoutPath(layout.projectPath), JSON.stringify(layout, null, 2))
  }

  load(projectPath: string): WorkspaceLayout | null {
    const filePath = layoutPath(projectPath)
    if (!fs.existsSync(filePath)) return null
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return null
    }
  }

  saveTemplate(projectPath: string, template: TerminalTemplate): void {
    const layout = this.load(projectPath) ?? {
      projectPath,
      terminals: [],
      templates: [],
      updatedAt: new Date().toISOString()
    }
    const idx = layout.templates.findIndex((t) => t.id === template.id)
    if (idx >= 0) {
      layout.templates[idx] = template
    } else {
      layout.templates.push(template)
    }
    layout.updatedAt = new Date().toISOString()
    this.save(layout)
  }
}
