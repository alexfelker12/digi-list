import { SQLiteRunResult } from "expo-sqlite";
import { Button, Dialog } from "heroui-native";
import { Trash2Icon } from "lucide-react-native";
import React from "react";
import { Keyboard, View } from "react-native";
import { Icon } from "./icon";


type DeleteDialogProps = {
  name: string
  onConfirm: () => Promise<SQLiteRunResult | void>
  actionPending: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}
export function DeleteDialog({ name, onConfirm, actionPending, isOpen, onOpenChange }: DeleteDialogProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      {/* <Dialog.Trigger asChild>
        {children || (<Button
          size={triggerSize}
          variant={triggerVariant}
          isIconOnly
          isDisabled={actionPending}
        >
          <Icon icon={Trash2Icon} className="text-danger-soft-foreground" size={18} />
          {triggerLabel && <Button.Label>{triggerLabel}</Button.Label>}
        </Button>)}
      </Dialog.Trigger> */}
      <Dialog.Portal>
        <Dialog.Overlay />
        {/* <DialogBlurOverlay /> */}
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
            <Dialog.Title className="leading-[1.2]">{name} löschen?</Dialog.Title>
            <Dialog.Description className="leading-snug">Kann nicht rückgängig gemacht werden!</Dialog.Description>
          </View>

          <View className="gap-2">
            <Button
              variant="danger-soft"
              onPress={async () => {
                await onConfirm()
                onOpenChange(false)
              }}
              isDisabled={actionPending}
            >
              <Icon icon={Trash2Icon} className="text-danger-soft-foreground" />
              <Button.Label>Ja, löschen</Button.Label>
            </Button>
            <Button
              variant="tertiary"
              onPress={() => onOpenChange(false)}
              isDisabled={actionPending}
            >
              Abbrechen
            </Button>
          </View>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}