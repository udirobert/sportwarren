"use client";

import { useState, useCallback, useRef } from "react";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export interface AvatarUploadState {
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
  isProcessing: boolean;
  error: string | null;
}

export interface UseAvatarUploadReturn extends AvatarUploadState {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onClick: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clear: () => void;
}

/**
 * Reusable avatar upload hook.
 * - Handles file input click and change
 * - Validates file type and size
 * - Generates a local preview URL immediately
 * - Encodes as base64 for storage/upload
 */
export function useAvatarUpload(): UseAvatarUploadReturn {
  const [state, setState] = useState<AvatarUploadState>({
    previewUrl: null,
    base64: null,
    mimeType: null,
    isProcessing: false,
    error: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clear = useCallback(() => {
    setState({
      previewUrl: null,
      base64: null,
      mimeType: null,
      isProcessing: false,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState((prev) => ({ ...prev, error: null, isProcessing: true }));

    // Validate type
    if (!ALLOWED_TYPES.has(file.type)) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Please upload a JPG, PNG, or WebP image.",
      }));
      return;
    }

    // Validate size
    if (file.size > MAX_BYTES) {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Image must be smaller than 5MB.",
      }));
      return;
    }

    // Generate preview URL
    const previewUrl = URL.createObjectURL(file);

    // Read as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        // Extract base64 data (remove data:image/xxx;base64, prefix)
        const base64 = result.split(",")[1] || result;
        setState({
          previewUrl,
          base64,
          mimeType: file.type,
          isProcessing: false,
          error: null,
        });
      }
    };
    reader.onerror = () => {
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Failed to read image file.",
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  return {
    ...state,
    fileInputRef,
    onClick,
    onChange,
    clear,
  };
}
