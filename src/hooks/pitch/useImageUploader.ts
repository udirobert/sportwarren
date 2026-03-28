import { useCallback } from 'react';

export function useImageUploader(maxSize: number) {
  const processFile = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxSize / (img.width || maxSize), maxSize / (img.height || maxSize));
            canvas.width = Math.max(1, Math.round((img.width || maxSize) * scale));
            canvas.height = Math.max(1, Math.round((img.height || maxSize) * scale));
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/webp', 0.8);
            resolve(dataUrl);
          } finally {
            URL.revokeObjectURL(url);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        img.src = url;
      });
    },
    [maxSize],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, onResult: (dataUrl: string) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await processFile(file);
        onResult(dataUrl);
      } catch (err) {
        console.warn('Image upload failed:', err);
      }
    },
    [processFile],
  );

  return { processFile, handleFileInput };
}
