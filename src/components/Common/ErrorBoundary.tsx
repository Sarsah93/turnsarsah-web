import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: '#111222',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: '20px',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#e74c3c', fontSize: '2.5rem', marginBottom: '20px' }}>
            ⚠ GAME ERROR OCCURRED
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', maxWidth: '600px', lineHeight: '1.5', color: '#bdc3c7', whiteSpace: 'pre-line' }}>
            {window.navigator.language.startsWith('ko') 
              ? '예기치 못한 게임 로직 오류가 발생하여 화면을 표시할 수 없습니다.\n아래 버튼을 눌러 새로고침 후 다시 플레이해주시기 바랍니다.' 
              : 'An unexpected game logic error occurred and the screen cannot be displayed.\nPlease click the button below to refresh and try again.'}
          </p>
          {this.state.error && (
            <pre style={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #34495e',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '800px',
              overflowX: 'auto',
              fontSize: '11px',
              color: '#e74c3c',
              textAlign: 'left',
              marginBottom: '30px',
              fontFamily: 'monospace'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            style={{
              backgroundColor: '#e67e22',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 40px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(230,126,34,0.4)',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {window.navigator.language.startsWith('ko') ? '게임 새로고침' : 'Refresh Game'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
