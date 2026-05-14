import { DeleteDialog } from "@/components/delete-dialog";
import { queryKeys } from "@/lib/queries/_helper";
import { updateListMutationOptions } from "@/lib/queries/list-queries";
import { List } from "@/server/db";
import { useMutation, useMutationState, useQueryClient } from "@tanstack/react-query";
import { SQLiteRunResult } from "expo-sqlite";
import { Button, Card, Menu, PressableFeedback, Separator } from "heroui-native";
import { EditIcon, EllipsisVerticalIcon, FolderPenIcon, Trash2Icon } from 'lucide-react-native';
import { GestureResponderEvent, View } from "react-native";
import { Icon } from "../icon";
import { ListFormDialog } from "./list-form-dialog";


type ListItemProps = {
  list: List
  & { itemsCount: number }
  onPressRun: (event: GestureResponderEvent) => void
  onPressEdit: (event: GestureResponderEvent) => void
  onDelete: () => Promise<SQLiteRunResult | void>
}
export function ItemList({ list, onPressRun, onPressEdit, onDelete }: ListItemProps) {
  const actionPending = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status === "pending",
  }).at(-1) ?? false

  const qc = useQueryClient()
  const { mutateAsync } = useMutation({
    ...updateListMutationOptions(list.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.lists() })
  })

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={onPressRun}
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
                <ListFormDialog list={list} onSubmit={async (values) => { mutateAsync(values) }}>
                  <Menu.Item className="items-start">
                    <View className="mt-1">
                      <Icon icon={FolderPenIcon} className="text-muted" size={16} />
                    </View>
                    <View className="flex-1">
                      <Menu.ItemTitle>Name bearbeiten</Menu.ItemTitle>
                      <Menu.ItemDescription numberOfLines={1}>
                        Benenne die Einkaufsliste um
                      </Menu.ItemDescription>
                    </View>
                  </Menu.Item>
                </ListFormDialog>

                {/* go to edit list items screen */}
                <Menu.Item className="items-start" onPress={onPressEdit}>
                  <View className="mt-1">
                    <Icon icon={EditIcon} className="text-muted" size={16} />
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
                <DeleteDialog
                  name={list.name}
                  onConfirm={onDelete}
                  actionPending={actionPending}
                >
                  <Menu.Item className="items-start" variant="danger">
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
                </DeleteDialog>

              </Menu.Content>
            </Menu.Portal>
          </Menu>

        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
