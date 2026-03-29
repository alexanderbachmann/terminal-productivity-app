import * as pty from 'node-pty'
import os from 'os'
import type { TerminalSession } from '../shared/types'

export class TerminalManager {
  private sessions = new Map<string, pty.IPty>()

  create(session: TerminalSession): pty.IPty {
    const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : 'bash')

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: session.cols || 80,
      rows: session.rows || 24,
      cwd: session.cwd || os.homedir(),
      env: process.env as Record<string, string>
    })

    this.sessions.set(session.id, ptyProcess)

    if (session.startupCommand) {
      setTimeout(() => {
        ptyProcess.write(session.startupCommand + '\r')
      }, 300)
    }

    return ptyProcess
  }

  write(sessionId: string, data: string): void {
    this.sessions.get(sessionId)?.write(data)
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.sessions.get(sessionId)?.resize(cols, rows)
  }

  close(sessionId: string): void {
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
