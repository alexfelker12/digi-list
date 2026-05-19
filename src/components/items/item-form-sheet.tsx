import { Text } from '@/components/text';
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ItemForm, ItemFormProps } from "./item-form";


export function ItemFormSheet({ item, onSubmit, isOpen, onOpenChange }: ItemFormProps & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
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
          <BottomSheet.Overlay />
          <BottomSheet.Content
            contentContainerClassName="p-4 pt-0"
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            enableDynamicSizing
          >
            {/* Titel */}
            <Text className="text-lg font-semibold mb-4">
              {isEditing ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </Text>
            {/* <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={16}
            > */}
            <KeyboardAwareScrollView
              bottomOffset={16}
              keyboardShouldPersistTaps="handled"
            >
              <ItemForm
                item={item}
                onSubmit={async (values) => {
                  await onSubmit(values)
                  onOpenChange(false)
                }}
              />
            </KeyboardAwareScrollView>
            {/* </KeyboardAvoidingView> */}
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </View>
  );
}
