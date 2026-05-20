import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/queries/item-queries";
import { ItemWithUriArray } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { cn } from "heroui-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, GestureResponderEvent, ListRenderItem, View } from "react-native";
import { DeleteDialog } from "../delete-dialog";
import { ItemFormSheet } from "./item-form-sheet";
import { ProductItem } from "./product-item";


type ProductsListingProps = {
  data: ItemWithUriArray[] | undefined
  isPending?: boolean
  className?: string
  onPress?: (
    item: ItemWithUriArray,
    event: GestureResponderEvent
  ) => void
}
export function ProductsListing({ data, isPending, className, onPress }: ProductsListingProps) {
  // open state edit/delete context
  const [selectedItem, setSelectedItem] = useState<ItemWithUriArray | undefined>(undefined)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleOpenEdit = useCallback((item: ItemWithUriArray) => {
    setSelectedItem(item)
    setEditOpen(true)
  }, [])
  const handleOpenDelete = useCallback((item: ItemWithUriArray) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }, [])

  // mutations
  const { mutateAsync: updateItem } = useMutation(updateItemMutationOptions())
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteItemMutationOptions())

  // flashlist
  const renderItem = useCallback<ListRenderItem<ItemWithUriArray>>(
    ({ item }) => (
      <ProductItem
        item={item}
        onPress={onPress}
        openEditSheet={handleOpenEdit}
        openDeleteDialog={handleOpenDelete}
      />
    ),
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
          <EmptyListIndicator message="Noch keine Produkte erstellt" />
        )}
        contentContainerClassName={cn("gap-2 px-1 pb-1", className)}
      />

      {/* one edit sheet for all product items */}
      <ItemFormSheet
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        item={selectedItem}
        onSubmit={async (data) => {
          if (!selectedItem) return;
          updateItem({ itemId: selectedItem.id, data })
        }}
      />

      {/* one delete dialog for all product items */}
      <DeleteDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        name={selectedItem?.name ?? ""}
        onConfirm={async () => {
          if (!selectedItem) return;
          deleteItem({ itemId: selectedItem.id })
        }}
        actionPending={deletePending}
      >
      </DeleteDialog>
    </View>
  );
}
