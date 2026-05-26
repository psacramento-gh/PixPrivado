/** Load image bytes with EXIF orientation applied (matches browser display). */
export async function loadOrientedBitmap(
  source: Blob | File,
): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(source, {
      imageOrientation: "from-image",
    });
  } catch {
    return createImageBitmap(source);
  }
}

export async function loadOrientedBitmapFromUrl(
  url: string,
): Promise<ImageBitmap> {
  const response = await fetch(url);
  const blob = await response.blob();
  return loadOrientedBitmap(blob);
}
