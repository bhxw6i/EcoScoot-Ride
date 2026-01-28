/**
 * Utility functions for handling image data
 */

/**
 * Converts a binary string or Uint8Array to a data URL for display in img tags,
 * or returns the URL string directly if it's already a URL
 */
export const binaryToImageSrc = (imageData: string | Uint8Array | null): string => {
  if (!imageData) return '/placeholder.svg';
  
  // If it's already a URL or path, return it
  if (typeof imageData === 'string') {
    if (imageData.startsWith('/') || 
        imageData.startsWith('http') || 
        imageData.startsWith('data:')) {
      return imageData;
    }
    
    // If it's a base64 string, check if it needs the data URL prefix
    if (imageData.startsWith('data:')) {
      return imageData;
    }
    
    // Handle potential base64 string without prefix
    try {
      if (/^[A-Za-z0-9+/=]+$/.test(imageData)) {
        return `data:image/jpeg;base64,${imageData}`;
      }
    } catch (e) {
      // If error, just return the string as is
      return imageData;
    }
    
    // Otherwise return the string as is
    return imageData;
  }
  
  // Handle Uint8Array (legacy support)
  if (imageData instanceof Uint8Array) {
    try {
      const base64 = btoa(
        Array.from(imageData)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      return `data:image/jpeg;base64,${base64}`;
    } catch (e) {
      console.error('Error converting Uint8Array to base64:', e);
      return '/placeholder.svg';
    }
  }
  
  return '/placeholder.svg';
};

/**
 * Converts a File to Uint8Array for storage
 */
export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Converts a File to base64 string for storage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
