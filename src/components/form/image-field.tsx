import { useFieldContext } from "@/lib/form/form-context";
import { getDisplayUri, saveImageToAppStorage } from '@/lib/utils';
import { Image } from "expo-image";
import { launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { Button, Label, TextField } from "heroui-native";
import { CameraIcon, ImagesIcon, XIcon } from "lucide-react-native";
import { Alert, Pressable, View } from 'react-native';
import { Icon } from "../icon";
import { Text } from "../text";


export function ImageFieldComponent() {
  const field = useFieldContext<string[]>();
  const uris = field.state.value ?? [];

  async function pickFromGallery() {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung fehlt', 'Galerie-Zugriff wurde nicht erlaubt.');
      return;
    }
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      // Galerie → vollständiger URI, nicht von uns verwaltet
      field.handleChange([...uris, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function pickFromCamera() {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung fehlt', 'Kamera-Zugriff wurde nicht erlaubt.');
      return;
    }
    const result = await launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      // Kamera → in App-Storage kopieren, nur Dateiname speichern
      const filename = await saveImageToAppStorage(result.assets[0].uri);
      field.handleChange([...uris, filename]);
    }
  }

  return (
    <TextField>
      <Label className="text-sm text-muted">Bilder</Label>

      {uris.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {uris.map((uriOrFilename) => (
            <View key={uriOrFilename} className="flex-1 aspect-square max-w-[23.3%] overflow-hidden">
              <Image
                source={{ uri: getDisplayUri(uriOrFilename) }}
                style={{ flex: 1, borderRadius: 8 }}
                contentFit="cover"
                contentPosition="center"
                transition={200}
              />
              <Pressable
                className="absolute top-0.5 right-0.5"
                onPress={() => field.handleChange(uris.filter((u) => u !== uriOrFilename))}
                hitSlop={8}
              >
                <Icon icon={XIcon} className="text-white" />
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
          <Button variant="tertiary" onPress={pickFromCamera}>
            <Icon icon={CameraIcon} className="text-foreground" />
            <Button.Label className="text-sm">Kamera</Button.Label>
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="tertiary" onPress={pickFromGallery}>
            <Icon icon={ImagesIcon} className="text-foreground" />
            <Button.Label className="text-sm">Galerie</Button.Label>
          </Button>
        </View>
      </View>

    </TextField>
  );
}
