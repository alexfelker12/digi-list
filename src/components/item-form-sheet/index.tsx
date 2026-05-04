import { Text } from '@/components/text';
import { dynamicItemMutationOptions } from "@/lib/list-queries";
import { UNITS } from '@/server/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from "@tanstack/react-query";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import { Button, FieldError, Input, Label, TextField } from "heroui-native";
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Icon } from "../icon";
import { EMPTY_FORM, FormState, ItemFormSheetProps } from "./types";


export function ItemFormSheet({ item }: ItemFormSheetProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const isEditing = !!item;
  const { mutateAsync, isPending } = useMutation(dynamicItemMutationOptions(item?.id));

  const [form, setForm] = useState<FormState>(() => {
    if (item) {
      return {
        name: item.name,
        quantity: item.quantity?.toString() ?? '',
        unit: item.unit ?? '',
        notes: item.notes ?? '',
        imageUris: item.imageUris,
      }
    } else {
      return EMPTY_FORM
    }
  });


  // ── Bilder ─────────────────────────────────────────────────────────────────
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

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
      set('imageUris', [...form.imageUris, ...result.assets.map(a => a.uri)]);
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
      set('imageUris', [...form.imageUris, result.assets[0].uri]);
    }
  }

  function removeImage(uri: string) {
    set('imageUris', form.imageUris.filter(u => u !== uri));
  }

  // ── Speichern ──────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      notes: form.notes.trim() || null,
      imageUris: form.imageUris,
    };

    await mutateAsync(payload);
    setSheetOpen(false);
  }

  // ── UI ─────────────────────────────────────────────────────────────────────

  return (
    <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen}>
      <BottomSheet.Trigger asChild>
        <Button>
          <Button.Label>Neues Item</Button.Label>
        </Button>
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          contentContainerClassName="p-4 pt-0"
        >
          {/* Titel */}
          <Text className="text-lg font-semibold mb-4">
            {isEditing ? 'Produkt bearbeiten' : 'Neues Produkt'}
          </Text>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex-1 flex-col gap-4"
          >
            {/* Name */}
            <TextField isRequired className="gap-1">
              <Label className="text-sm">Name</Label>
              <Input
                placeholder="z.B. Milch"
                className="py-2.5 px-2"
                value={form.name}
                onChangeText={v => set('name', v)}
              />
              <FieldError>Bitte Namen eingeben</FieldError>
            </TextField>

            {/* Menge + Einheit nebeneinander */}
            <Field label="Menge" style={{ flex: 1 }}>
              <TextInput
                className="bg-field-background text-field-foreground border border-field-border rounded-lg px-3 py-2"
                placeholder="z.B. 2"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={form.quantity}
                onChangeText={v => set('quantity', v)}
              />
            </Field>

            <Field label="Einheit" style={{ flex: 1 }}>
              <View className="flex-row flex-wrap gap-1 mt-1">
                {UNITS.map(u => (
                  <Pressable
                    key={u}
                    onPress={() => set('unit', u)}
                    className={`px-2 py-1 rounded-md border ${form.unit === u
                      ? 'bg-accent border-accent'
                      : 'bg-field-background border-field-border'
                      }`}
                  >
                    <Text className={`text-xs ${form.unit === u ? 'text-accent-foreground' : 'text-field-foreground'}`}>
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            {/* Notizen */}
            <Field label="Notizen">
              <TextInput
                className="bg-field-background text-field-foreground border border-field-border rounded-lg px-3 py-2"
                placeholder="Optional"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                value={form.notes}
                onChangeText={v => set('notes', v)}
              />
            </Field>


            {/* Bilder */}
            <Field label="Bilder">
              <View className="flex-row flex-wrap gap-2 mb-2">
                {form.imageUris.map(uri => (
                  <View key={uri} className="size-18 rounded-sm overflow-hidden">
                    <Image source={{ uri }} style={styles.image} />
                    <Button
                      onPress={() => removeImage(uri)}
                      hitSlop={8}
                      isIconOnly
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </Button>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={pickFromCamera}
                >
                  <Icon name="camera-outline" />
                  <Button.Label>Kamera</Button.Label>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={pickFromGallery}
                >
                  <Icon name="images-outline" />
                  <Button.Label>Galerie</Button.Label>
                </Button>
              </View>
            </Field>
          </ScrollView>

          {/* Speichern */}
          <Button
            variant="primary"
            onPress={handleSave}
            isDisabled={!form.name.trim() || isPending}
            // isLoading={isPending}
            className="mt-4"
          >
            <Button.Label>
              {isEditing ? 'Änderungen speichern' : 'Item anlegen'}
            </Button.Label>
          </Button>

        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet >
  );
}

// ── Hilfskomponente ───────────────────────────────────────────────────────────

function Field({ label, children, style }: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View className="mb-3" style={style}>
      <Text className="text-sm text-muted mb-1">{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  imageThumb: { width: 72, height: 72, borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 2, right: 2 },
});
