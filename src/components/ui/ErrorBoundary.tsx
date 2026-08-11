import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface State {
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unexpected render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="h-screen grid place-items-center bg-bg text-text p-8">
        <div className="card max-w-lg p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 text-secondary" size={32} />
          <h1 className="text-lg font-semibold">
            Uygulama beklenmeyen bir hatayla karşılaştı
          </h1>
          <p className="text-sm text-muted mt-2">
            Verileriniz yerel veritabanında korunur. Uygulamayı yeniden yükleyip
            tekrar deneyin.
          </p>
          <pre className="mt-4 rounded-lg bg-surface2 p-3 text-left text-xs overflow-auto">
            {this.state.error.message}
          </pre>
          <button
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Yeniden Yükle
          </button>
        </div>
      </main>
    );
  }
}
