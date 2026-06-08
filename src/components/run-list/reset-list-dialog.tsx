import { useListItems } from "@/screens/context/list-items-context";
import { SQLiteRunResult } from "expo-sqlite";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { Spinner } from "heroui-native/spinner";
import { ListRestartIcon, RotateCcwIcon } from "lucide-react-native";
import { useState } from "react";
import { Keyboard, View } from "react-native";
import { cn } from "tailwind-variants";
import { Icon } from "../icon";


type ResetListDialogProps = {
  onConfirm: () => Promise<SQLiteRunResult | void>
  actionPending: boolean
}
export function ResetListDialog({ onConfirm, actionPending }: ResetListDialogProps) {
  const { listName, totalItemsCount } = useListItems()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => {
      if (totalItemsCount === 0 && open) return;
      setIsOpen(open)
    }}>

      <Dialog.Trigger asChild>
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          isDisabled={totalItemsCount === 0}
          className={cn(
            // manually adding disabled styles since isDisabled does not seem to work
            totalItemsCount === 0 && "opacity-50 pointer-events-none"
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

          <View className="gap-2">
            <Button
              variant="secondary"
              onPress={async () => {
                await onConfirm()
                setIsOpen(false)
              }}
              isDisabled={actionPending}
            >
              {actionPending ? <Spinner /> : <Icon icon={ListRestartIcon} />}
              <Button.Label>Zurücksetzen</Button.Label>
            </Button>
            <Button
              variant="ghost"
              onPress={() => setIsOpen(false)}
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
