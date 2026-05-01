import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-white">
                    <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                    <p className="text-sm">{this.state.error?.toString()}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
