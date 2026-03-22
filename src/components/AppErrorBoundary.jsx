import React from "react";
import ErrorState from "./ErrorState";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Something broke on this page"
          message="Refresh the page to continue. If it happens again, the last action likely triggered an unexpected state."
          actionLabel="Reload Page"
          onAction={() => window.location.reload()}
          className="min-h-screen"
        />
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
