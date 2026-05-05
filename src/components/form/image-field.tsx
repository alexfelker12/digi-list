import { useFieldContext } from '@/lib/form';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import * as ImagePicker from 'expo-image-picker';
import { Button, Label, TextField } from "heroui-native";
import { Alert, Pressable, View } from 'react-native';
import { Icon } from "../icon";
import { Text } from "../text";


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
      mediaTypes: ["images"],
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
    <TextField>
      <Label className="text-sm text-muted">Bilder</Label>

      {uris.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {uris.map((uri) => (
            //* 23.3% width is roughly the width of 1 of 4 pictures in a row
            <View key={uri} className="flex-1 aspect-square max-w-[23.3%] overflow-hidden">
              <Image
                source={{ uri }}
                style={{ flex: 1, borderRadius: 8 }}
                contentFit="cover"
                contentPosition="center"
                transition={200}
              />
              <Pressable
                className="absolute top-0.5 right-0.5"
                onPress={() => field.handleChange(uris.filter((u) => u !== uri))}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View className="pb-2">
          <Text className="italic text-muted text-center">Keine Bilder ausgewählt</Text>
        </View>
      )}

      <View className="flex-row gap-3">

        <View className="flex-1">
          <Button
            variant="tertiary"
            onPress={pickFromCamera}
          >
            <Icon name="camera-outline" size={20} />
            <Button.Label className="text-sm">Kamera</Button.Label>
          </Button>
        </View>

        <View className="flex-1">
          <Button
            variant="tertiary"
            onPress={pickFromGallery}
          >
            <Icon name="images-outline" size={20} />
            <Button.Label className="text-sm">Galerie</Button.Label>
          </Button>
        </View>

      </View>

    </TextField>
  );
}
