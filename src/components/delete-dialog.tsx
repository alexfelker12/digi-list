import { SQLiteRunResult } from "expo-sqlite";
import { Button, ButtonSize, ButtonVariant, Dialog } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { Icon } from "./icon";


type DeleteDialogProps = {
  triggerLabel?: string
  triggerSize?: ButtonSize
  triggerVariant?: ButtonVariant
  name: string
  onConfirm: () => Promise<SQLiteRunResult | void>
  actionPending: boolean
}
export function DeleteDialog({
  triggerLabel = "",
  triggerSize = "sm",
  triggerVariant = "danger-soft",
  name,
  onConfirm,
  actionPending
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>

        <Button
          size={triggerSize}
          variant={triggerVariant}
          isIconOnly
          isDisabled={actionPending}
        >
          <Icon name="trash" className="text-danger-soft-foreground" size={20} />
          {triggerLabel && <Button.Label>{triggerLabel}</Button.Label>}
        </Button>

      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-4">
          <Dialog.Close variant="ghost" className="absolute top-1.5 right-1.5" />

          <View className="gap-1">
            <Dialog.Title className="leading-none">{name} löschen?</Dialog.Title>
            <Dialog.Description className="leading-snug">Kann nicht rückgängig gemacht werden!</Dialog.Description>
          </View>

          <View className="flex-row gap-2">
            <Button variant="tertiary" className="flex-1"
              onPress={() => setIsOpen(false)}
              isDisabled={actionPending}
            >
              Abbrechen
            </Button>
            <Button variant="danger-soft" className="flex-1"
              onPress={async () => {
                await onConfirm()
                setIsOpen(false)
              }}
              isDisabled={actionPending}
            >
              <Icon name="trash" className="text-danger-soft-foreground" size={20} />
              <Button.Label>Ja, löschen</Button.Label>
            </Button>
          </View>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}