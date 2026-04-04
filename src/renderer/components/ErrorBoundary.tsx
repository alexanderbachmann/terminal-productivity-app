import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

interface Props {
  children: React.ReactNode
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '16px',
          fontFamily: 'system-ui, sans-serif',
          color: '#ccc',
          background: '#1e1e1e'
        }}>
          <h2 style={{ margin: 0 }}>Something went wrong</h2>
          <p style={{ margin: 0, color: '#999', maxWidth: 500, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '8px 20px',
              border: '1px solid #555',
              borderRadius: '4px',
              background: '#333',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
