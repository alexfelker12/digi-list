import { Button, Dialog } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { Icon } from "../icon";
import { ListForm, ListFormProps } from "./list-form";


export function ListFormDialog({ list, onSubmit, children }: ListFormProps & {
  children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!list;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {children || (
          <Button variant="secondary">
            <Icon name="add-circle-outline" size={20} />
            <Button.Label>Erstellen</Button.Label>
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-4">
          <Dialog.Close variant="ghost" className="absolute top-1.5 right-1.5" />

          <View className="gap-1">
            <Dialog.Title className="leading-none">Einkaufsliste {isEditing ? "bearbetiten" : "erstellen"}</Dialog.Title>
            {!isEditing && (
              <Dialog.Description className="leading-snug">Gebe einen Namen für die Einkaufsliste</Dialog.Description>
            )}
          </View>

          <ListForm
            list={list}
            onSubmit={async (values) => {
              await onSubmit(values)
              setIsOpen(false)
            }}
          />

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
