import { Text } from '@/components/text';
import { Button } from "heroui-native";
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { CirclePlusIcon } from "lucide-react-native";
import { useState } from 'react';
import { Icon } from "../icon";
import { ItemForm, ItemFormProps } from "./item-form";


export function ItemFormSheet({ item, onSubmit, children }: ItemFormProps & {
  children?: React.ReactNode
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isEditing = !!item;

  return (
    <BottomSheet isOpen={sheetOpen} onOpenChange={setSheetOpen}>
      <BottomSheet.Trigger asChild>
        {children || (
          <Button variant="secondary" className="h-10">
            <Icon icon={CirclePlusIcon} />
            <Button.Label>Erstellen</Button.Label>
          </Button>
        )}
      </BottomSheet.Trigger>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          contentContainerClassName="p-4 pt-0"
        >
          {/* Titel */}
          <Text className="text-lg font-semibold mb-4">
            {isEditing ? 'Produkt bearbeiten' : 'Neues Produkt'}
          </Text>

          <ItemForm
            item={item}
            onSubmit={async (values) => {
              await onSubmit(values)
              setSheetOpen(false)
            }}
          />
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet >
  );
}
