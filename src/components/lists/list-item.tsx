import { DeleteDialog } from "@/components/delete-dialog";
import { queryKeys } from "@/lib/queries/_helper";
import { deleteListMutationOptions } from "@/lib/queries/list-queries";
import { List } from "@/server/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, PressableFeedback } from "heroui-native";
import { GestureResponderEvent } from "react-native";
import { Icon } from "../icon";


type ListItemProps = {
  list: List
  onPressRun: (event: GestureResponderEvent) => void
  onPressEdit: (event: GestureResponderEvent) => void
}
export function ItemList({ list, onPressRun, onPressEdit }: ListItemProps) {
  const qc = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    ...deleteListMutationOptions(list.id),
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
          <Card.Title>{list.name}</Card.Title>
        </Card.Body>

        <Card.Footer className="flex-row gap-1.5">
          <Button variant="outline" size="sm" onPress={onPressEdit} isIconOnly>
            <Icon name="create" size={20} />
          </Button>

          <DeleteDialog
            name={list.name}
            onConfirm={mutateAsync}
            actionPending={isPending}
          />
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
