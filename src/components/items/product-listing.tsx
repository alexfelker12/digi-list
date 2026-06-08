import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/queries/item-queries";
import { ItemWithUriArray } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { Menu } from "heroui-native/menu";
import { Separator } from "heroui-native/separator";
import { SquarePenIcon, Trash2Icon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, GestureResponderEvent, ListRenderItem, View } from "react-native";
import { cn } from "tailwind-variants";
import { DeleteDialog } from "../delete-dialog";
import { Icon } from "../icon";
import { Text } from "../text";
import { ItemFormSheet } from "./item-form-sheet";
import { ProductItem } from "./product-item";


type ProductsListingProps = {
  data: ItemWithUriArray[] | undefined
  searchValue?: string
  isPending?: boolean
  className?: string
  onPress?: (
    item: ItemWithUriArray,
    event: GestureResponderEvent
  ) => void
}
export function ProductsListing({ data, searchValue, isPending, className, onPress }: ProductsListingProps) {
  // open state edit/delete context
  const [selectedItem, setSelectedItem] = useState<ItemWithUriArray | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleOpenMenu = useCallback((item: ItemWithUriArray) => {
    setSelectedItem(item)
    setMenuOpen(true)
  }, [])

  // mutations
  const { mutateAsync: updateItem } = useMutation(updateItemMutationOptions())
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteItemMutationOptions())

  // flatlist
  const renderItem = useCallback<ListRenderItem<ItemWithUriArray>>(
    ({ item }) => <ProductItem item={item} onPress={onPress} openMenu={handleOpenMenu} />,
    [onPress]
  )
  const keyExtractor = useCallback(
    (item: ItemWithUriArray) => String(item.id),
    []
  )

  return (
    <View className="flex-1 -mx-1">
      {/* product listing with (almost) dump rows */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        ListEmptyComponent={isPending ? (
          <ActivityIndicator size="large" className="text-accent" />
        ) : (
          !!searchValue ? (
            <View className="flex-1 justify-center items-center flex-row p-4">
              <Text className="text-muted italic">keine Produkte für </Text>
              <Text className="font-semibold">"{searchValue}" </Text>
              <Text className="text-muted italic">gefunden</Text>
            </View>
          ) : (
            <EmptyListIndicator message="Noch keine Produkte erstellt" />
          )
        )}
        contentContainerClassName={cn("gap-2 px-1 pb-1", className)}
      />

      <Menu
        presentation="bottom-sheet"
        isOpen={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <Menu.Portal>
          <Menu.Overlay />
          <Menu.Content presentation="bottom-sheet" contentContainerClassName="pt-1">
            <Menu.Label className="mb-1">Aktionen für {selectedItem?.name ?? ""}</Menu.Label>

            {/* edit item */}
            <Menu.Item className="items-start"
              onPress={() => setEditOpen(true)}
            >
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

            <ItemFormSheet
              isOpen={editOpen}
              onOpenChange={setEditOpen}
              item={selectedItem}
              onSubmit={async (data) => {
                if (!selectedItem) return;
                updateItem({ itemId: selectedItem.id, data })
              }}
            />

            <Separator className="m-2" />

            {/* delete item */}
            <Menu.Item className="items-start" variant="danger"
              onPress={() => setDeleteOpen(true)}
            >
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

            <DeleteDialog
              isOpen={deleteOpen}
              onOpenChange={setDeleteOpen}
              name={selectedItem?.name ?? ""}
              onConfirm={async () => {
                if (!selectedItem) return;
                deleteItem({ itemId: selectedItem.id })
              }}
              actionPending={deletePending}
            />

          </Menu.Content>
        </Menu.Portal>
      </Menu>

    </View>
  );
}
