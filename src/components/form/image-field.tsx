import { Text } from '@/components/text';
import { useFieldContext } from '@/lib/form';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, View } from 'react-native';


export function ImageFieldComponent() {
  const field = useFieldContext<string[]>();
  const uris = field.state.value ?? [];

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung fehlt', 'Galerie-Zugriff wurde nicht erlaubt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      field.handleChange([...uris, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung fehlt', 'Kamera-Zugriff wurde nicht erlaubt.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      field.handleChange([...uris, result.assets[0].uri]);
    }
  }

  return (
    <View className="mb-3">
      <Text className="text-sm text-muted mb-1">Bilder</Text>

      {uris.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {uris.map((uri) => (
            <View key={uri} className="w-20 h-20 rounded-lg overflow-hidden">
              <Image source={{ uri }} className="w-full h-full" />
              <Pressable
                className="absolute top-1 right-1"
                onPress={() => field.handleChange(uris.filter((u) => u !== uri))}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={pickFromCamera}
          className="flex-1 flex-row items-center justify-center gap-2 border border-border rounded-lg py-2"
        >
          <Ionicons name="camera-outline" size={16} />
          <Text className="text-sm">Kamera</Text>
        </Pressable>
        <Pressable
          onPress={pickFromGallery}
          className="flex-1 flex-row items-center justify-center gap-2 border border-border rounded-lg py-2"
        >
          <Ionicons name="images-outline" size={16} />
          <Text className="text-sm">Galerie</Text>
        </Pressable>
      </View>
    </View>
  );
}
