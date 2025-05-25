import { uploadImageToFirebase } from '@/config/uploadImagesToFirebase';
import { CameraOCRProps } from '@/interfaces/AppInterfaces';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL!;


export default function CameraOCR({
  onTextExtracted,
  onImageSelected,
  characterImageSource,
}: CameraOCRProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');


  const handleImageSelection = async (uri: string) => {
    setSelectedImage(uri);
    setIsUploading(true);

    // Genera un nombre único y la ruta en el bucket
    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `ocr-${Date.now()}.${ext}`;

    // Sube a Firebase y recibe la URL pública
    const publicUrl = await uploadImageToFirebase(uri, fileName);
    setIsUploading(false);

    if (!publicUrl) {
      return Alert.alert('Error', 'No se pudo subir la imagen.');
    }

    setSelectedImageUrl(publicUrl);
    onImageSelected?.(publicUrl);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso necesario', 'Necesito acceso a la cámara.');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      await handleImageSelection(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso necesario', 'Necesito acceso a la galería.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      await handleImageSelection(result.assets[0].uri);
    }
  };

  const extractText = async () => {
    if (!selectedImageUrl) {
      return Alert.alert('Sin imagen', 'Selecciona primero una imagen.');
    }

    setIsProcessing(true);
    try {
      const resp = await fetch(`${API_URL}/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selectedImageUrl }),
      });
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error(err);
      }
      const json = await resp.json();
      const text = json.text?.trim() || '';
      if (!text) {
        Alert.alert('Sin texto', 'No se detectó texto en la imagen.');
      } else {
        setExtractedText(text);
        onTextExtracted?.(text);
      }
    } catch (e: any) {
      console.error('OCR error:', e);
      Alert.alert('Error OCR', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setSelectedImageUrl(null);
    setExtractedText('');

  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Toca la imagen para abrir{'\n'}la cámara o galería
      </Text>

      <TouchableOpacity onPress={openCamera} style={styles.characterContainer}>
        {characterImageSource ? (
          <Image
            source={characterImageSource}
            style={styles.characterImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="camera" size={80} color="#EF5C40" />
          </View>
        )}
      </TouchableOpacity>

      {selectedImage && (
        <View style={styles.preview}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          <TouchableOpacity onPress={reset} style={styles.closeButton}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#EF5C40" />
          </TouchableOpacity>
        </View>
      )}

      {isUploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#EF5C40" />
          <Text style={styles.uploadingText}>Subiendo imagen...</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity onPress={openGallery} style={styles.galleryBtn}>
          <MaterialCommunityIcons name="image-multiple" size={20} color="white" />
          <Text style={styles.btnText}>Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={extractText}
          disabled={isUploading || isProcessing || !selectedImageUrl}
          style={[
            styles.ocrBtn,
            (isUploading || isProcessing || !selectedImageUrl) && styles.disabledBtn,
          ]}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.btnText}>Procesando...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="text-recognition" size={20} color="white" />
              <Text style={styles.btnText}>Extraer Texto</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  instructionText: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  characterContainer: { alignItems: 'center', marginBottom: 20 },
  characterImage: { width: 200, height: 200 },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F2A9A0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: { position: 'relative', marginBottom: 20 },
  image: { width: 200, height: 150, borderRadius: 10 },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#EF5C40',
    fontSize: 14,
  },
  buttons: { flexDirection: 'row', gap: 15 },
  galleryBtn: {
    backgroundColor: '#4A4A4A',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold' },
  ocrBtn: {
    backgroundColor: '#EF5C40',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  disabledBtn: { backgroundColor: '#cccccc' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFF5DC',
    width: '80%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  textContainer: { marginVertical: 10 },
  extracted: { fontSize: 16, lineHeight: 22 },
  okBtn: {
    backgroundColor: '#EF5C40',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  okText: { color: 'white', fontWeight: 'bold' },
});