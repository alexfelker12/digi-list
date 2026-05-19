import { Text } from '@/components/text';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { Keyboard, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemForm, ItemFormProps } from "./item-form";


export function ItemFormSheet({ item, onSubmit, isOpen, onOpenChange }: ItemFormProps & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { top } = useSafeAreaInsets()
  const isEditing = !!item
  return (
    <View className="absolute top-0 right-0">
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        {/* <BottomSheet.Trigger asChild>
        {children || (
          <Button variant="secondary" className="h-10">
            <Icon icon={CirclePlusIcon} />
            <Button.Label>Erstellen</Button.Label>
          </Button>
        )}
      </BottomSheet.Trigger> */}
        <BottomSheet.Portal>
          <BottomSheet.Overlay onPress={() => Keyboard.dismiss()} />
          <BottomSheet.Content
            contentContainerClassName="p-4 pt-0"
            keyboardBlurBehavior="restore"
            enableBlurKeyboardOnGesture
            topInset={top}
          >
            {/* Titel */}
            <Text className="text-lg font-semibold mb-4">
              {isEditing ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <ItemForm
                item={item}
                onSubmit={async (values) => {
                  await onSubmit(values)
                  onOpenChange(false)
                }}
              />
            </ScrollView>

          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}
