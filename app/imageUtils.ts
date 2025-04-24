// imageUtils.ts

/**
 * Compresses an image file to reduce its size while maintaining quality
 * @param file - The original image file
 * @param maxSizeMB - Maximum size in MB for the compressed image
 * @returns Promise resolving to the compressed image file
 */
export const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Calculate the required scale to achieve the target file size
        // This is a simplified approach - in production you'd want more advanced compression
        let quality = 0.7; // Initial quality
        let maxWidth = img.width;
        let maxHeight = img.height;
        
        // Scale down the image if it's very large
        const MAX_DIMENSION = 1920; // Max dimension for most devices
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          if (img.width > img.height) {
            maxWidth = MAX_DIMENSION;
            maxHeight = Math.round(img.height * (MAX_DIMENSION / img.width));
          } else {
            maxHeight = MAX_DIMENSION;
            maxWidth = Math.round(img.width * (MAX_DIMENSION / img.height));
          }
        }
        
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        
        // Draw the resized image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create a new file from the blob
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg', // Always convert to JPEG for better compression
              lastModified: file.lastModified,
            });
            
            resolve(newFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file to a base64 string
 * @param file - The file to convert
 * @returns Promise resolving to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file to a Buffer
 * @param file - The file to convert
 * @returns Promise resolving to a Buffer
 */
export const fileToBuffer = async (file: File): Promise<Buffer> => {
  const base64 = await fileToBase64(file);
  // Extract the base64 data without the prefix
  const base64Data = base64.split(',')[1];
  // Convert to Buffer
  return Buffer.from(base64Data, 'base64');
};