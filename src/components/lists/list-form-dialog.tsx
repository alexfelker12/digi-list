import { Dialog } from "heroui-native";
import { Keyboard, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ListForm, ListFormProps } from "./list-form";


export function ListFormDialog({ list, onSubmit, isOpen, onOpenChange }: ListFormProps & {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEditing = !!list
  return (
    <View className="absolute top-0 right-0">
      <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
        {/* <Dialog.Trigger asChild>
        {children || (
          <Button variant="secondary" className="h-10">
            <Icon icon={CirclePlusIcon} />
            <Button.Label>Erstellen</Button.Label>
          </Button>
        )}
      </Dialog.Trigger> */}
        <Dialog.Portal>
          <Dialog.Overlay />
          <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={16}>
            <Dialog.Content
              className="gap-4"
              onStartShouldSetResponder={() => {
                if (Keyboard.isVisible()) {
                  Keyboard.dismiss()
                  return true
                }
                return false
              }}
            >
              <Dialog.Close variant="ghost" className="absolute top-1.5 right-1.5" />

              <View className="gap-1">
                <Dialog.Title className="leading-[1.2]">Einkaufsliste {isEditing ? "bearbeiten" : "erstellen"}</Dialog.Title>
                {!isEditing && (
                  <Dialog.Description className="leading-snug">Gebe einen Namen für die Einkaufsliste</Dialog.Description>
                )}
              </View>

              <ListForm
                list={list}
                onSubmit={async (values) => {
                  await onSubmit(values)
                  onOpenChange(false)
                }}
              />

            </Dialog.Content>
          </KeyboardAvoidingView>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}
