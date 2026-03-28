import { toPng, toJpeg, toCanvas } from 'html-to-image';

/**
 * Utility to export a DOM element as an image
 */
export const exportElementAsImage = async (
  element: HTMLElement,
  filename: string = 'highlight',
  format: 'png' | 'jpeg' | 'webp' = 'png',
  opts?: { pixelRatio?: number; backgroundColor?: string }
) => {
  try {
    let dataUrl: string;
    if (format === 'png') {
      dataUrl = await toPng(element, { quality: 0.95, cacheBust: true, pixelRatio: opts?.pixelRatio, backgroundColor: opts?.backgroundColor });
    } else if (format === 'jpeg') {
      dataUrl = await toJpeg(element, { quality: 0.95, cacheBust: true, pixelRatio: opts?.pixelRatio, backgroundColor: opts?.backgroundColor });
    } else {
      // webp via canvas
      const canvas = await toCanvas(element, { pixelRatio: opts?.pixelRatio, backgroundColor: opts?.backgroundColor });
      dataUrl = canvas.toDataURL('image/webp', 0.95);
    }

    const link = document.createElement('a');
    link.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('Failed to export image:', error);
    return false;
  }
};

/**
 * Utility to copy a text to clipboard
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
