import { Text } from '@/components/text';
import { Button } from "heroui-native";
import { BottomSheet } from 'heroui-native/bottom-sheet';
import { useState } from 'react';
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
          <Button variant="outline">
            <Button.Label>Neues Item</Button.Label>
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
