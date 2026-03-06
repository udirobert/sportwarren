import { toPng, toJpeg } from 'html-to-image';

/**
 * Utility to export a DOM element as an image
 */
export const exportElementAsImage = async (
  element: HTMLElement,
  filename: string = 'highlight',
  format: 'png' | 'jpeg' = 'png'
) => {
  try {
    const dataUrl = format === 'png' 
      ? await toPng(element, { quality: 0.95, cacheBust: true })
      : await toJpeg(element, { quality: 0.95, cacheBust: true });

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
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
