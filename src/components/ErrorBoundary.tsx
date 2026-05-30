import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log full component stack so the offending import/component is visible
    // even when the error itself is opaque (e.g. "undefined is not an object").
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] React render crash", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-2xl w-full space-y-4">
            <h1 className="text-xl font-semibold text-foreground">Something broke while rendering.</h1>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/40 p-4 rounded-md overflow-auto max-h-64">
              {this.state.error.message}
              {"\n\n"}
              {this.state.info?.componentStack ?? this.state.error.stack}
            </pre>
            <button
              className="text-sm underline text-foreground"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;