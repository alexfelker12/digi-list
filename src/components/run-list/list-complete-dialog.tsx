import { useListItems } from "@/screens/context/list-items-context";
import { Button, Dialog } from "heroui-native";
import { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";


type ListCompleteDialogProps = {
  isCompleted: boolean
}
export function ListCompleteDialog({ isCompleted }: ListCompleteDialogProps) {
  const { listName } = useListItems()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isCompleted) return;
    setTimeout(() => setIsOpen(true), 250)
  }, [isCompleted])

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
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
            <Dialog.Title className="leading-[1.2]">{listName} fertiggestellt!</Dialog.Title>
            <Dialog.Description className="leading-snug">
              Du hast alle Produkte auf der Einkaufsliste abgehackt, Glückwunsch!
            </Dialog.Description>
          </View>

          <View className="flex-row gap-2 justify-end">
            <Button variant="secondary" className="flex-1"
              onPress={() => setIsOpen(false)}
            >
              Schließen
            </Button>
          </View>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
