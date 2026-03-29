import type { ITheme } from '@xterm/xterm'

export interface ThemeDefinition {
  id: string
  name: string
  xterm: ITheme
  ui: {
    bgPrimary: string
    bgSecondary: string
    bgTertiary: string
    accent: string
    textPrimary: string
    textSecondary: string
    border: string
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    xterm: {
      background: '#1a1a2e',
      foreground: '#e0e0e0',
      cursor: '#a0c4ff',
      cursorAccent: '#1a1a2e',
      selectionBackground: '#264f78',
      selectionForeground: '#ffffff',
      black: '#1a1a2e',
      red: '#f87171',
      green: '#4ade80',
      yellow: '#fbbf24',
      blue: '#60a5fa',
      magenta: '#c084fc',
      cyan: '#22d3ee',
      white: '#e0e0e0',
      brightBlack: '#4a5568',
      brightRed: '#fca5a5',
      brightGreen: '#86efac',
      brightYellow: '#fde68a',
      brightBlue: '#93c5fd',
      brightMagenta: '#d8b4fe',
      brightCyan: '#67e8f9',
      brightWhite: '#ffffff'
    },
    ui: {
      bgPrimary: '#1a1a2e',
      bgSecondary: '#16213e',
      bgTertiary: '#0f3460',
      accent: '#a0c4ff',
      textPrimary: '#e0e0e0',
      textSecondary: '#7a7a9a',
      border: '#0f3460'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    xterm: {
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorAccent: '#282a36',
      selectionBackground: '#44475a',
      selectionForeground: '#f8f8f2',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff'
    },
    ui: {
      bgPrimary: '#282a36',
      bgSecondary: '#21222c',
      bgTertiary: '#44475a',
      accent: '#bd93f9',
      textPrimary: '#f8f8f2',
      textSecondary: '#6272a4',
      border: '#44475a'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    xterm: {
      background: '#2e3440',
      foreground: '#d8dee9',
      cursor: '#d8dee9',
      cursorAccent: '#2e3440',
      selectionBackground: '#434c5e',
      selectionForeground: '#eceff4',
      black: '#3b4252',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      magenta: '#b48ead',
      cyan: '#88c0d0',
      white: '#e5e9f0',
      brightBlack: '#4c566a',
      brightRed: '#bf616a',
      brightGreen: '#a3be8c',
      brightYellow: '#ebcb8b',
      brightBlue: '#81a1c1',
      brightMagenta: '#b48ead',
      brightCyan: '#8fbcbb',
      brightWhite: '#eceff4'
    },
    ui: {
      bgPrimary: '#2e3440',
      bgSecondary: '#3b4252',
      bgTertiary: '#434c5e',
      accent: '#88c0d0',
      textPrimary: '#d8dee9',
      textSecondary: '#4c566a',
      border: '#434c5e'
    }
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    xterm: {
      background: '#282c34',
      foreground: '#abb2bf',
      cursor: '#528bff',
      cursorAccent: '#282c34',
      selectionBackground: '#3e4451',
      selectionForeground: '#abb2bf',
      black: '#282c34',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#e5c07b',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#abb2bf',
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#e5c07b',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff'
    },
    ui: {
      bgPrimary: '#282c34',
      bgSecondary: '#21252b',
      bgTertiary: '#3e4451',
      accent: '#61afef',
      textPrimary: '#abb2bf',
      textSecondary: '#5c6370',
      border: '#3e4451'
    }
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    xterm: {
      background: '#1e1e2e',
      foreground: '#cdd6f4',
      cursor: '#f5e0dc',
      cursorAccent: '#1e1e2e',
      selectionBackground: '#45475a',
      selectionForeground: '#cdd6f4',
      black: '#45475a',
      red: '#f38ba8',
      green: '#a6e3a1',
      yellow: '#f9e2af',
      blue: '#89b4fa',
      magenta: '#cba6f7',
      cyan: '#94e2d5',
      white: '#bac2de',
      brightBlack: '#585b70',
      brightRed: '#f38ba8',
      brightGreen: '#a6e3a1',
      brightYellow: '#f9e2af',
      brightBlue: '#89b4fa',
      brightMagenta: '#cba6f7',
      brightCyan: '#94e2d5',
      brightWhite: '#a6adc8'
    },
    ui: {
      bgPrimary: '#1e1e2e',
      bgSecondary: '#181825',
      bgTertiary: '#313244',
      accent: '#cba6f7',
      textPrimary: '#cdd6f4',
      textSecondary: '#585b70',
      border: '#313244'
    }
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    xterm: {
      background: '#002b36',
      foreground: '#839496',
      cursor: '#839496',
      cursorAccent: '#002b36',
      selectionBackground: '#073642',
      selectionForeground: '#93a1a1',
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#586e75',
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#fdf6e3'
    },
    ui: {
      bgPrimary: '#002b36',
      bgSecondary: '#073642',
      bgTertiary: '#073642',
      accent: '#268bd2',
      textPrimary: '#839496',
      textSecondary: '#586e75',
      border: '#073642'
    }
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    xterm: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      cursor: '#c0caf5',
      cursorAccent: '#1a1b26',
      selectionBackground: '#33467c',
      selectionForeground: '#c0caf5',
      black: '#15161e',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#bb9af7',
      cyan: '#7dcfff',
      white: '#a9b1d6',
      brightBlack: '#414868',
      brightRed: '#f7768e',
      brightGreen: '#9ece6a',
      brightYellow: '#e0af68',
      brightBlue: '#7aa2f7',
      brightMagenta: '#bb9af7',
      brightCyan: '#7dcfff',
      brightWhite: '#c0caf5'
    },
    ui: {
      bgPrimary: '#1a1b26',
      bgSecondary: '#16161e',
      bgTertiary: '#292e42',
      accent: '#7aa2f7',
      textPrimary: '#a9b1d6',
      textSecondary: '#414868',
      border: '#292e42'
    }
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    xterm: {
      background: '#282828',
      foreground: '#ebdbb2',
      cursor: '#ebdbb2',
      cursorAccent: '#282828',
      selectionBackground: '#504945',
      selectionForeground: '#ebdbb2',
      black: '#282828',
      red: '#cc241d',
      green: '#98971a',
      yellow: '#d79921',
      blue: '#458588',
      magenta: '#b16286',
      cyan: '#689d6a',
      white: '#a89984',
      brightBlack: '#928374',
      brightRed: '#fb4934',
      brightGreen: '#b8bb26',
      brightYellow: '#fabd2f',
      brightBlue: '#83a598',
      brightMagenta: '#d3869b',
      brightCyan: '#8ec07c',
      brightWhite: '#ebdbb2'
    },
    ui: {
      bgPrimary: '#282828',
      bgSecondary: '#1d2021',
      bgTertiary: '#3c3836',
      accent: '#fabd2f',
      textPrimary: '#ebdbb2',
      textSecondary: '#928374',
      border: '#3c3836'
    }
  }
]

export const DEFAULT_THEME_ID = 'midnight'

export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
