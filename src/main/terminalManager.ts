import * as pty from 'node-pty'
import os from 'os'
import type { TerminalSession } from '../shared/types'

export class TerminalManager {
  private sessions = new Map<string, pty.IPty>()
  private startupTimers = new Map<string, ReturnType<typeof setTimeout>>()

  create(session: TerminalSession): pty.IPty {
    // Kill existing session with same ID to prevent duplicates (React StrictMode)
    this.close(session.id)

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh'

    const env = { ...process.env } as Record<string, string>
    delete env['ELECTRON_RUN_AS_NODE']

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: session.cols || 80,
      rows: session.rows || 24,
      cwd: session.cwd || os.homedir(),
      env
    })

    this.sessions.set(session.id, ptyProcess)

    // Send 'claude' command once the shell is ready
    const timer = setTimeout(() => {
      this.startupTimers.delete(session.id)
      if (this.sessions.get(session.id) === ptyProcess) {
        ptyProcess.write('claude\r')
      }
    }, 500)
    this.startupTimers.set(session.id, timer)

    return ptyProcess
  }

  write(sessionId: string, data: string): void {
    this.sessions.get(sessionId)?.write(data)
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.sessions.get(sessionId)?.resize(cols, rows)
  }

  close(sessionId: string): void {
    const timer = this.startupTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
      this.startupTimers.delete(sessionId)
    }
    const proc = this.sessions.get(sessionId)
    if (proc) {
      proc.kill()
      this.sessions.delete(sessionId)
    }
  }

  closeAll(): void {
    for (const [id] of this.sessions) {
      this.close(id)
    }
  }
}
