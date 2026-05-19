import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/queries/item-queries";
import { getDisplayUri } from "@/lib/utils";
import { ItemWithUriArray } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card, Menu, PressableFeedback, Separator } from "heroui-native";
import { EllipsisVerticalIcon, SquarePenIcon, Trash2Icon } from "lucide-react-native";
import { useState } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import { DeleteDialog } from "../delete-dialog";
import { Icon } from "../icon";
import { ImagePlaceholder } from "../image/image-placeholder";
import { ImageViewerModal } from "../image/image-viewer-modal";
import { ItemFormSheet } from "./item-form-sheet";


type ItemTestProps = {
  item: ItemWithUriArray
  onPress?: (item: ItemWithUriArray, event: GestureResponderEvent) => void
}
export function ProductItem({ item, onPress }: ItemTestProps) {
  const { id, imageUris, name } = item
  const [viewerVisible, setViewerVisible] = useState(false)

  // mutations
  const { mutateAsync: updateList } = useMutation(updateItemMutationOptions(id))
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteItemMutationOptions(id))

  const hasImageUris = imageUris.length > 0

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={(event) => onPress?.(item, event)}
    >
      <Card className="flex-row gap-3">
        <PressableFeedback.Highlight />

        <Card.Header className="h-10 aspect-square">
          {hasImageUris ? (
            <Pressable
              onPress={() => setViewerVisible(true)}
              className="size-full"
            >
              <Image
                source={{ uri: getDisplayUri(imageUris[0]) }}
                style={{ flex: 1, borderRadius: 8 }}
                contentFit="cover"
                contentPosition="center"
                transition={50}
              />
            </Pressable>
          ) : (
            <ImagePlaceholder />
          )}

          {/* fullscreen image viewer */}
          {hasImageUris && viewerVisible && <ImageViewerModal
            uris={imageUris}
            visible={viewerVisible}
            onClose={() => setViewerVisible(false)}
          />}
        </Card.Header>

        <Card.Body className="flex-1 gap-0">
          <Card.Title className="text-lg leading-[1.2]" numberOfLines={1}>{name}</Card.Title>
          {/* // TODO: more information here? */}
        </Card.Body>

        <Card.Footer className="">
          <Menu presentation="bottom-sheet">
            <Menu.Trigger asChild>
              <Button variant="outline" className="h-10" hitSlop={8} isIconOnly>
                <Icon icon={EllipsisVerticalIcon} size={18} />
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Overlay />
              <Menu.Content presentation="bottom-sheet" contentContainerClassName="pt-1">
                <Menu.Label className="mb-1">Aktionen für {name}</Menu.Label>

                {/* edit item */}
                {/* // TODO: use one for each listing */}
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
                {/* // TODO: global delete dialog with hook to set confirm action? */}
                <DeleteDialog
                  name={name}
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

