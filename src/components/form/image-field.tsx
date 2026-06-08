import { useFieldContext } from "@/lib/form/form-context";
import { getDisplayUri } from "@/lib/utils";
import { Image } from "expo-image";
import { launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from "expo-image-picker";
import { Button } from "heroui-native/button";
import { CloseButton } from "heroui-native/close-button";
import { Label } from "heroui-native/label";
import { TextField } from "heroui-native/text-field";
import { CameraIcon, ImagesIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Icon } from "../icon";
import { ImageViewerModal } from "../image/image-viewer-modal";
import { Text } from "../text";


// TODO:? additionally save assetId to block duplicate images saves
export function ImageFieldComponent() {
  const field = useFieldContext<string[]>()
  const uris = field.state.value ?? []
  // image viewer
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  async function pickFromGallery() {
    const { status } = await requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Berechtigung fehlt", "Galerie-Zugriff wurde nicht erlaubt.")
      return
    }
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      // gallery uri
      field.handleChange([...uris, ...result.assets.map((a) => a.uri)])
    }
  }

  async function pickFromCamera() {
    const { status } = await requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Berechtigung fehlt", "Kamera-Zugriff wurde nicht erlaubt.")
      return
    }
    const result = await launchCameraAsync({ quality: 0.8 })
    if (!result.canceled) {
      field.handleChange([...uris, result.assets[0].uri])
    }
  }

  const hasImageUris = uris.length > 0
  return (
    <TextField>
      <Label className="text-sm text-muted">Bilder</Label>

      {hasImageUris ? (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {uris.map((uriOrFilename, index) => (
            <View
              key={uriOrFilename}
              //* 23.2% is the closest to 25% minus gap-2 across all images. calc with % + px is not supported
              className="w-full aspect-square max-w-[23.2%] overflow-hidden"
            >
              <Pressable
                onPress={() => {
                  setViewerIndex(index)
                  setViewerVisible(true)
                }}
                className="size-full"
              >
                <Image
                  source={{ uri: getDisplayUri(uriOrFilename) }}
                  style={{ flex: 1, borderRadius: 8 }}
                  contentFit="cover"
                  contentPosition="center"
                  transition={200}
                />
              </Pressable>
              <CloseButton
                className="absolute top-0.5 right-0.5 size-4.5"
                onPress={() => field.handleChange(uris.filter((u) => u !== uriOrFilename))}
                hitSlop={8}
              >
                <Icon icon={XIcon} size={12} />
              </CloseButton>
            </View>
          ))}

          {/* fullscreen image viewer */}
          {hasImageUris && <ImageViewerModal
            visible={viewerVisible}
            uris={uris}
            initialIndex={viewerIndex}
            onClose={() => setViewerVisible(false)}
          />}
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
