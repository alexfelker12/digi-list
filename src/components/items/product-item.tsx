import { queryKeys } from "@/lib/queries/_helper";
import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/queries/item-queries";
import { getDisplayUri } from "@/lib/utils";
import { ItemWithUriArray } from "@/server/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card, Menu, PressableFeedback, Separator } from "heroui-native";
import { EllipsisVerticalIcon, SquarePenIcon, Trash2Icon } from "lucide-react-native";
import { useState } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import { DeleteDialog } from "../delete-dialog";
import { Icon } from "../icon";
import { ImageViewerModal } from "../image/image-viewer-modal";
import { ItemFormSheet } from "./item-form-sheet";


type ItemTestProps = {
  item: ItemWithUriArray
  onPress?: (item: ItemWithUriArray, event: GestureResponderEvent) => void
}
export function ProductItem({ item, onPress }: ItemTestProps) {
  const [viewerVisible, setViewerVisible] = useState(false);

  // mutations
  const qc = useQueryClient()
  const invalidateItemsQuery = () => qc.invalidateQueries({ queryKey: queryKeys.items() })

  const { mutateAsync: updateList } = useMutation({
    ...updateItemMutationOptions(item.id),
    onSuccess: invalidateItemsQuery,
  })

  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation({
    ...deleteItemMutationOptions(item.id),
    onSuccess: invalidateItemsQuery,
  })

  const uris = item.imageUris.length > 0 ? item.imageUris : ["react-logo"];
  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={(event) => onPress?.(item, event)}
    >
      <Card className="flex-row gap-2">
        <PressableFeedback.Highlight />

        <Card.Header className="flex-1 aspect-square">
          <Pressable
            onPress={() => setViewerVisible(true)}
            className="size-full"
          >
            <Image
              source={{ uri: getDisplayUri(uris[0]) }}
              style={{ flex: 1, borderRadius: 8 }}
              contentFit="cover"
              contentPosition="center"
              transition={50}

              {...(item.imageUris.length === 0 && {
                width: 100,
                height: 100
              })}
            />
          </Pressable>

          <ImageViewerModal
            uris={uris}
            visible={viewerVisible}
            onClose={() => setViewerVisible(false)}
          />
        </Card.Header>

        <Card.Body className="flex-4 gap-0">
          <Card.Title className="pr-20 text-lg" numberOfLines={1}>{item.name}</Card.Title>
          {/* // TODO: more information here? */}
        </Card.Body>

        <Card.Footer className="absolute top-4 right-4 flex-row gap-1.5">
          <Menu presentation="bottom-sheet">
            <Menu.Trigger asChild>
              <Button variant="outline" className="h-10" hitSlop={8} isIconOnly>
                <Icon icon={EllipsisVerticalIcon} size={18} />
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Overlay />
              <Menu.Content presentation="bottom-sheet" contentContainerClassName="pt-1">
                <Menu.Label className="mb-1">Aktionen für {item.name}</Menu.Label>

                {/* edit item */}
                <ItemFormSheet item={item} onSubmit={async (values) => { updateList(values) }}>
                  <Menu.Item className="items-start">
                    <View className="mt-1">
                      <Icon icon={SquarePenIcon} className="text-muted" size={16} />
                    </View>
                    <View className="flex-1">
                      <Menu.ItemTitle>Bearbeiten</Menu.ItemTitle>
                      <Menu.ItemDescription numberOfLines={1}>
                        Passe Name, Bilder, etc... an
                      </Menu.ItemDescription>
                    </View>
                  </Menu.Item>
                </ItemFormSheet>

                <Separator className="m-2" />

                {/* delete item */}
                <DeleteDialog
                  name={item.name}
                  onConfirm={deleteItem}
                  actionPending={deletePending}
                >
                  <Menu.Item className="items-start" variant="danger">
                    <View className="mt-1">
                      <Icon icon={Trash2Icon} className="text-danger" size={16} />
                    </View>
                    <View className="flex-1">
                      <Menu.ItemTitle>Löschen</Menu.ItemTitle>
                      <Menu.ItemDescription numberOfLines={1}>
                        Wird aus allen Einkaufslisten entfernt!
                      </Menu.ItemDescription>
                    </View>
                  </Menu.Item>
                </DeleteDialog>

              </Menu.Content>
            </Menu.Portal>
          </Menu>
        </Card.Footer>

      </Card>
    </PressableFeedback>
  );
}

