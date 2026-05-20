import { DeleteDialog } from "@/components/delete-dialog";
import { deleteListMutationOptions, updateListMutationOptions } from "@/lib/queries/list-queries";
import { List } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Card, Menu, PressableFeedback, Separator } from "heroui-native";
import { EllipsisVerticalIcon, NotebookPenIcon, PencilIcon, Trash2Icon } from 'lucide-react-native';
import { useState } from "react";
import { View } from "react-native";
import { Icon } from "../icon";
import { ListFormDialog } from "./list-form-dialog";


type ListItemProps = {
  list: List & { itemsCount: number }
}
export function ItemList({ list }: ListItemProps) {
  // TODO: adjust list listing the same way as product listing
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // mutations
  const { mutateAsync: updateList, isPending: updatePending } = useMutation(updateListMutationOptions(list.id))
  const { mutateAsync: deleteList, isPending: deletePending } = useMutation(deleteListMutationOptions(list.id))

  // navigation
  const navigateToRun = () => {
    router.push({ pathname: "/list/[id]/run", params: { id: list.id, listName: list.name } })
  }
  const navigateToEdit = () => {
    router.push({ pathname: "/list/[id]/edit", params: { id: list.id, listName: list.name } })
  }

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={() => navigateToRun()}
    >
      <Card className="flex-row justify-between items-center">
        <PressableFeedback.Highlight />

        <Card.Body>
          <Card.Title className="leading-tight">{list.name}</Card.Title>
          <Card.Description className="leading-snug">
            {list.itemsCount || "keine"} Produkt{list.itemsCount === 1 ? "" : "e"}
          </Card.Description>
        </Card.Body>

        <Card.Footer className="flex-row gap-1.5">
          <Menu presentation="bottom-sheet">
            <Menu.Trigger asChild>
              <Button variant="outline" className="h-10" hitSlop={8} isIconOnly>
                <Icon icon={EllipsisVerticalIcon} size={18} />
              </Button>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Overlay />
              <Menu.Content presentation="bottom-sheet" contentContainerClassName="pt-1">
                <Menu.Label className="mb-1">Aktionen für {list.name}</Menu.Label>

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
                  list={list}
                  onSubmit={async (values) => { updateList(values) }}
                />

                {/* go to edit list items screen */}
                <Menu.Item className="items-start" onPress={() => navigateToEdit()}>
                  <View className="mt-1">
                    <Icon icon={NotebookPenIcon} className="text-muted" size={16} />
                  </View>
                  <View className="flex-1">
                    <Menu.ItemTitle>Produkte bearbeiten</Menu.ItemTitle>
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
                  name={list.name}
                  onConfirm={deleteList}
                  actionPending={updatePending || deletePending}
                />

              </Menu.Content>
            </Menu.Portal>
          </Menu>

        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
