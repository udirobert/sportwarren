"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class TrpcErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Card className="border-red-100 bg-red-50 p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Failed to load data
              </p>
              <p className="text-xs text-red-500 mt-1">{this.state.message}</p>
              <button
                className="mt-3 text-xs text-red-600 underline"
                onClick={() => this.setState({ hasError: false, message: "" })}
              >
                Try again
              </button>
            </div>
          </Card>
        )
      );
    }
    return this.props.children;
  }
}
