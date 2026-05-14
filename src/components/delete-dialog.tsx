import { SQLiteRunResult } from "expo-sqlite";
import { Button, ButtonSize, ButtonVariant, Dialog } from "heroui-native";
import { Trash2Icon } from "lucide-react-native";
import React, { useState } from "react";
import { Keyboard, View } from "react-native";
import { DialogBlurOverlay } from "./dialog/dialog-blur-overlay";
import { Icon } from "./icon";


type DeleteDialogProps = {
  triggerLabel?: string
  triggerSize?: ButtonSize
  triggerVariant?: ButtonVariant
  name: string
  onConfirm: () => Promise<SQLiteRunResult | void>
  actionPending: boolean
  children?: React.ReactNode
}
export function DeleteDialog({
  triggerLabel = "",
  triggerSize = "sm",
  triggerVariant = "danger-soft",
  name,
  onConfirm,
  actionPending,
  children
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {children || (<Button
          size={triggerSize}
          variant={triggerVariant}
          isIconOnly
          isDisabled={actionPending}
        >
          <Icon icon={Trash2Icon} className="text-danger-soft-foreground" size={18} />
          {triggerLabel && <Button.Label>{triggerLabel}</Button.Label>}
        </Button>)}
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* <Dialog.Overlay /> */}
        <DialogBlurOverlay />
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
              <Icon icon={Trash2Icon} className="text-danger-soft-foreground" />
              <Button.Label>Ja, löschen</Button.Label>
            </Button>
          </View>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}