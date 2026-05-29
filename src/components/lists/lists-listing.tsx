import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { deleteListMutationOptions, updateListMutationOptions } from "@/lib/queries/list-queries";
import { ListWithItemCount } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { cn, Menu, Separator } from "heroui-native";
import { NotebookPenIcon, PencilIcon, Trash2Icon } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, GestureResponderEvent, ListRenderItem, View } from "react-native";
import { DeleteDialog } from "../delete-dialog";
import { Icon } from "../icon";
import { List } from "./list";
import { ListFormDialog } from "./list-form-dialog";


type ListsListingProps = {
  data: ListWithItemCount[] | undefined
  isPending?: boolean
  className?: string
  onPress?: (list: ListWithItemCount, event: GestureResponderEvent) => void
}
export function ListsListing({ data, isPending, className, onPress }: ListsListingProps) {
  // open state edit/delete context
  const [selectedList, setSelectedList] = useState<ListWithItemCount | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleOpenMenu = useCallback((list: ListWithItemCount) => {
    setSelectedList(list)
    setMenuOpen(true)
  }, [])

  // mutations
  const { mutateAsync: updateList, isPending: updatePending } = useMutation(updateListMutationOptions())
  const { mutateAsync: deleteList, isPending: deletePending } = useMutation(deleteListMutationOptions())

  const navigateToRun = (list: ListWithItemCount) => {
    router.push({ pathname: "/list/[id]/run", params: { id: list.id, listName: list.name } })
  }
  const navigateToEdit = (list: ListWithItemCount) => {
    router.push({ pathname: "/list/[id]/edit", params: { id: list.id, listName: list.name } })
  }

  // flatlist
  const renderItem = useCallback<ListRenderItem<ListWithItemCount>>(
    ({ item: list }) => <List
      list={list}
      onPress={(...args) => {
        if (onPress) {
          onPress(...args)
        } else {
          navigateToRun(list)
        }
      }}
      openMenu={handleOpenMenu}
    />,
    []
  )
  const keyExtractor = useCallback(
    (item: ListWithItemCount) => String(item.id),
    []
  )

  return (
    <View className="flex-1 -mx-1">
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

      <Menu
        presentation="bottom-sheet"
        isOpen={menuOpen}
        onOpenChange={setMenuOpen}
      >
        <Menu.Portal>
          <Menu.Overlay />
          <Menu.Content presentation="bottom-sheet" contentContainerClassName="pt-1">
            <Menu.Label className="mb-1">Aktionen für {selectedList?.name ?? ""}</Menu.Label>

            {/* edit list (for now only name) */}
            <Menu.Item className="items-start"
              onPress={() => setEditOpen(true)}
            >
              <View className="mt-1">
                <Icon icon={PencilIcon} className="text-muted" size={16} />
              </View>
              <View className="flex-1">
                <Menu.ItemTitle>Name bearbeiten</Menu.ItemTitle>
                <Menu.ItemDescription numberOfLines={1}>
                  Benenne die Einkaufsliste um
                </Menu.ItemDescription>
              </View>
            </Menu.Item>

            <ListFormDialog
              isOpen={editOpen}
              onOpenChange={setEditOpen}
              list={selectedList}
              onSubmit={async (data) => {
                if (!selectedList) return;
                updateList({ listId: selectedList.id, data })
              }}
            />

            {/* go to edit list items screen */}
            <Menu.Item
              className="items-start"
              onPress={() => {
                if (!selectedList) return;
                navigateToEdit(selectedList)
              }}
            >
              <View className="mt-1">
                <Icon icon={NotebookPenIcon} className="text-muted" size={16} />
              </View>
              <View className="flex-1">
                <Menu.ItemTitle>Produkte hinzufügen</Menu.ItemTitle>
                <Menu.ItemDescription numberOfLines={1}>
                  Passe Produkte und ihre Reihenfolge an
                </Menu.ItemDescription>
              </View>
            </Menu.Item>

            <Separator className="m-2" />

            {/* delete list */}
            <Menu.Item className="items-start" variant="danger"
              onPress={() => setDeleteOpen(true)}
            >
              <View className="mt-1">
                <Icon icon={Trash2Icon} className="text-danger" size={16} />
              </View>
              <View className="flex-1">
                <Menu.ItemTitle>Einkaufsliste löschen</Menu.ItemTitle>
                <Menu.ItemDescription numberOfLines={1}>
                  Listen-Fortschritt geht verloren!
                </Menu.ItemDescription>
              </View>
            </Menu.Item>

            <DeleteDialog
              isOpen={deleteOpen}
              onOpenChange={setDeleteOpen}
              name={selectedList?.name ?? ""}
              onConfirm={async () => {
                if (!selectedList) return;
                deleteList({ listId: selectedList.id })
              }}
              actionPending={updatePending || deletePending}
            />

          </Menu.Content>
        </Menu.Portal>
      </Menu>

    </View>
  );
}
