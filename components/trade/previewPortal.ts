export const PREVIEW_CONTAINER_ID = 'preview-buy-container-asdf';

export function getPreviewContainerRoot() {
  if (typeof document === 'undefined') return null;
  return document.getElementById(PREVIEW_CONTAINER_ID);
}
