import { DeleteDialog } from "@/components/delete-dialog";
import { deleteListMutationOptions } from "@/lib/queries/list-queries";
import { List } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, PressableFeedback } from "heroui-native";
import { GestureResponderEvent } from "react-native";
import { Icon } from "../icon";


type ListItemProps = {
  list: List
  onPressRun: (event: GestureResponderEvent) => void
  onPressEdit: (event: GestureResponderEvent) => void
}
export function ListItem({ list, onPressRun, onPressEdit }: ListItemProps) {
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteListMutationOptions(list.id))

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
            onConfirm={deleteItem}
            actionPending={deletePending}
          />
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
