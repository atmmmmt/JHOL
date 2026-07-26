import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Optional compact mode for embedding inside a panel (keeps the shell visible). */
  compact?: boolean
  /** Called when the user asks to retry (e.g. to reset local state). */
  onReset?: () => void
}

type ErrorBoundaryState = {
  hasError: boolean
  message: string | null
}

/**
 * Catches render/runtime errors so a crash shows an actionable message instead
 * of a blank white page (React unmounts the whole tree on an uncaught error).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface details in the console for diagnostics.
    console.error('Dashboard render error:', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div
        dir="rtl"
        style={{
          display: 'flex',
          minHeight: this.props.compact ? '40vh' : '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '24px',
          textAlign: 'center',
          color: '#e7e4f7',
          background: this.props.compact ? 'transparent' : '#0b0a1e',
          fontFamily: 'inherit',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          حدث خطأ غير متوقع
        </h2>
        <p style={{ maxWidth: '460px', lineHeight: 1.8, opacity: 0.8, margin: 0 }}>
          تعذّر عرض هذا القسم. جرّب إعادة التحميل، وإذا استمرّت المشكلة أرسل
          الرسالة التالية للدعم الفني.
        </p>
        {this.state.message ? (
          <code
            style={{
              display: 'block',
              maxWidth: '520px',
              overflowWrap: 'anywhere',
              borderRadius: '12px',
              border: '1px solid rgba(160,149,208,0.25)',
              background: 'rgba(8,7,24,0.5)',
              padding: '10px 14px',
              fontSize: '12px',
              opacity: 0.9,
            }}
          >
            {this.state.message}
          </code>
        ) : null}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              borderRadius: '12px',
              border: '1px solid rgba(29,171,137,0.4)',
              background: 'rgba(29,171,137,0.14)',
              color: '#57e0b8',
              padding: '9px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            إعادة المحاولة
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              borderRadius: '12px',
              border: '1px solid rgba(160,149,208,0.3)',
              background: 'transparent',
              color: '#e7e4f7',
              padding: '9px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    )
  }
}
