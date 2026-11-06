/**
 * AL REHMAN META EGGS — IMAGEKIT INTEGRATION SERVICE
 * Cloud Media Storage & Image CDN Pipeline
 *
 * Automatically converts user payment receipt screenshots into permanent CDN URLs
 * hosted at: https://ik.imagekit.io/ujhr66d01/payment_proofs/
 */

export const IMAGEKIT_CONFIG = {
  urlEndpoint: 'https://ik.imagekit.io/ujhr66d01',
  privateKey: 'private_8HiNsiNC0EPXk7LLNqF19WetHfs=',
  uploadEndpoint: 'https://upload.imagekit.io/api/v1/files/upload',
  defaultFolder: '/payment_proofs'
};

/**
 * Generate Base64 Basic Authorization Header for ImageKit API
 */
function getAuthHeader() {
  const token = `${IMAGEKIT_CONFIG.privateKey}:`;
  if (typeof window !== 'undefined' && window.btoa) {
    return `Basic ${window.btoa(token)}`;
  }
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(token).toString('base64')}`;
  }
  return '';
}

/**
 * Upload an image file or Data URL to ImageKit CDN
 * @param {File|Blob|string} fileOrDataUrl - The image File, Blob, or base64 Data URL
 * @param {string} [customFileName] - Optional file name
 * @param {string} [folder] - Target folder in ImageKit
 * @returns {Promise<{success: boolean, url: string, thumbnailUrl?: string, fileId?: string, error?: string}>}
 */
export async function uploadToImageKit(
  fileOrDataUrl,
  customFileName = '',
  folder = IMAGEKIT_CONFIG.defaultFolder
) {
  if (!fileOrDataUrl) {
    return { success: false, error: 'No image file provided.' };
  }

  // File size validation (5MB max)
  if (fileOrDataUrl.size && fileOrDataUrl.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Image file size exceeds the 5 MB limit. Please select a smaller screenshot.' };
  }

  try {
    const timestamp = Date.now();
    const cleanName =
      (customFileName || (fileOrDataUrl.name ? fileOrDataUrl.name.replace(/[^a-zA-Z0-9._-]/g, '_') : '')) ||
      `receipt_${timestamp}.jpg`;

    const formData = new FormData();
    formData.append('file', fileOrDataUrl);
    formData.append('fileName', cleanName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');

    const authHeader = getAuthHeader();
    const response = await fetch(IMAGEKIT_CONFIG.uploadEndpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = 'Upload failed';
      try {
        const json = JSON.parse(errText);
        parsedErr = json.message || json.help || errText;
      } catch {
        parsedErr = errText;
      }
      throw new Error(`ImageKit Error (${response.status}): ${parsedErr}`);
    }

    const data = await response.json();

    return {
      success: true,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || data.url,
      fileId: data.fileId,
      name: data.name,
      size: data.size
    };
  } catch (err) {
    console.warn('ImageKit upload encountered an issue, falling back:', err?.message || err);

    // Fallback: If network error or CORS issue, convert file to data URL so the user is never blocked
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      return {
        success: true,
        url: fileOrDataUrl,
        thumbnailUrl: fileOrDataUrl,
        isFallback: true
      };
    }

    if (typeof FileReader !== 'undefined' && fileOrDataUrl instanceof Blob) {
      try {
        const base64Url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileOrDataUrl);
        });
        return {
          success: true,
          url: base64Url,
          thumbnailUrl: base64Url,
          isFallback: true
        };
      } catch (readErr) {
        return { success: false, error: err?.message || 'Failed to upload image.' };
      }
    }

    return { success: false, error: err?.message || 'Failed to upload image.' };
  }
}

export default uploadToImageKit;
