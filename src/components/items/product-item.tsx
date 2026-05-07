import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/list-queries";
import { getDisplayUri } from "@/lib/utils";
import { ItemWithUriArray } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card, Dialog } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { Icon } from "../icon";
import { Text } from "../text";
import { ItemFormSheet } from "./item-form-sheet";


type ItemTestProps = {
  item: ItemWithUriArray
}
export function ProductItem({ item }: ItemTestProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { mutateAsync: updateItem } = useMutation(updateItemMutationOptions(item.id))
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteItemMutationOptions(item.id))

  const uris = item.imageUris.length > 0 ? item.imageUris : ["react-logo"];

  return (
    <Card className="flex-row gap-2">
      <Card.Header className="flex-1 aspect-square">

        <Image
          source={{ uri: getDisplayUri(uris[0]) }}
          style={{ flex: 1, borderRadius: 8 }}
          contentFit="cover"
          contentPosition="center"
          transition={200}

          {...(item.imageUris.length === 0 && {
            width: 100,
            height: 100
          })}
        />

      </Card.Header>

      <Card.Body className="flex-3 gap-0">

        <Card.Title className="pr-20" numberOfLines={1}>{item.name}</Card.Title>

        <View className="flex-1 flex-col justify-end gap-2">
          {/* <View className="flex-row gap-1">
            <Text>{item.quantity}x</Text>
            <Text>{unitMap[item.unit]}</Text>
          </View> */}

          <Text className="text-sm text-muted leading-tight">{item.notes}</Text>
        </View>

      </Card.Body>

      <Card.Footer className="absolute top-4 right-4 flex-row gap-1.5">

        <ItemFormSheet item={item}
          onSubmit={async (values) => {
            await updateItem(values)
          }}
        >
          <Button variant="outline" size="sm" isIconOnly>
            <Icon name="create" size={20} />
          </Button>
        </ItemFormSheet>

        <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>

            <Button size="sm" variant="danger-soft" isIconOnly isDisabled={deletePending}>
              <Icon name="trash" className="text-danger-soft-foreground" size={20} />
            </Button>

          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content className="gap-4">
              <Dialog.Close variant="ghost" className="absolute top-1.5 right-1.5" />

              <View className="gap-1">
                <Dialog.Title className="leading-none">{item.name} löschen?</Dialog.Title>
                <Dialog.Description className="leading-snug">Kann nicht rückgängig gemacht werden!</Dialog.Description>
              </View>

              <View className="flex-row gap-2">
                <Button variant="tertiary" className="flex-1"
                  onPress={() => setIsOpen(false)}
                  isDisabled={deletePending}
                >
                  Abbrechen
                </Button>
                <Button variant="danger-soft" className="flex-1"
                  onPress={async () => {
                    await deleteItem()
                    setIsOpen(false)
                  }}
                  isDisabled={deletePending}
                >
                  <Icon name="trash" className="text-danger-soft-foreground" size={20} />
                  <Button.Label>Ja, löschen</Button.Label>
                </Button>
              </View>

            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

      </Card.Footer>
    </Card>
  );
}

