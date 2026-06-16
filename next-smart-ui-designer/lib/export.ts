import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export async function exportPhonePreviewAsPng(node: HTMLElement | null, filename = 'mpesa-screen.png') {
  if (!node) return;
  const dataUrl = await toPng(node, {
    backgroundColor: '#F5F5F5',
    pixelRatio: 2
  });
  saveAs(dataUrl, filename);
}
