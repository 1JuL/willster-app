// lib/uploadImageToFirebase.ts

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../utils/firebase';

/**
 * fileUri: URI local (p.ej. file:///…/photo.jpg)
 * fileName: nombre de archivo en Storage
 */
export async function uploadImageToFirebase(
  fileUri: string,
  fileName: string
): Promise<string|null> {
  try {
    // 1) Referencia dentro del bucket: carpeta 'imgswill'
    const storageRef = ref(storage, `imgswill/${fileName}`);

    // 2) Convierte el URI a Blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 3) Súbelo como bytes
    await uploadBytes(storageRef, blob);

    // 4) Devuelve la URL pública
    return await getDownloadURL(storageRef);
  } catch (err: any) {
    console.error('Firebase upload error:', err);
    return null;
  }
}