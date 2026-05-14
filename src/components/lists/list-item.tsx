import { DeleteDialog } from "@/components/delete-dialog";
import { List } from "@/server/db";
import { useMutationState } from "@tanstack/react-query";
import { SQLiteRunResult } from "expo-sqlite";
import { Button, Card, PressableFeedback } from "heroui-native";
import { GestureResponderEvent } from "react-native";
import { Icon } from "../icon";


type ListItemProps = {
  list: List
  onPressRun: (event: GestureResponderEvent) => void
  onPressEdit: (event: GestureResponderEvent) => void
  onDelete: () => Promise<SQLiteRunResult | void>
}
export function ItemList({ list, onPressRun, onPressEdit, onDelete }: ListItemProps) {
  const actionPending = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status === "pending",
  }).at(-1) ?? false

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
            onConfirm={onDelete}
            actionPending={actionPending}
          />
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}
