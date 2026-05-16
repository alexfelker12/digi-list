import { useListItems } from "@/screens/context/list-items-context";
import { SQLiteRunResult } from "expo-sqlite";
import { Button, cn, Dialog } from "heroui-native";
import { RotateCcwIcon } from "lucide-react-native";
import { useState } from "react";
import { Keyboard, View } from "react-native";
import { Icon } from "../icon";


type ResetListDialogProps = {
  onConfirm: () => Promise<SQLiteRunResult | void>
  actionPending: boolean
}
export function ResetListDialog({ onConfirm, actionPending }: ResetListDialogProps) {
  const { listName, itemsCount } = useListItems()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => {
      if (itemsCount === 0 && open) return;
      setIsOpen(open)
    }}>

      <Dialog.Trigger asChild>
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          isDisabled={itemsCount === 0}
          className={cn(
            // manually adding disabled styles since isDisabled does not seem to work
            itemsCount === 0 && "opacity-50 pointer-events-none"
          )}
        >
          <Icon icon={RotateCcwIcon} />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
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
            <Dialog.Title className="leading-[1.2]">{listName} zurücksetzen?</Dialog.Title>
            <Dialog.Description className="leading-snug">Dein Listenfortschritt geht dabei verloren!</Dialog.Description>
          </View>

          <View className="flex-row gap-2">
            <Button
              variant="tertiary"
              className="flex-1"
              onPress={() => setIsOpen(false)}
              isDisabled={actionPending}
            >
              Abbrechen
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={async () => {
                await onConfirm()
                setIsOpen(false)
              }}
              isDisabled={actionPending}
            >
              <Button.Label>Zurücksetzen</Button.Label>
            </Button>
          </View>

        </Dialog.Content>
      </Dialog.Portal>

    </Dialog>
  );
}
