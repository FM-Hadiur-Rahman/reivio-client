// ErrorBoundary.jsx
import React from "react";
import { logError } from "../utils/logError";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error, info) {
    await logError(error, "React error boundary");
  }

  render() {
    if (this.state.hasError) {
      return (
        <h2 className="text-center text-red-600 mt-10">
          Something went wrong.
        </h2>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
