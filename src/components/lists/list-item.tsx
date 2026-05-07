import { DeleteDialog } from "@/components/delete-dialog";
import { deleteListMutationOptions } from "@/lib/list-queries";
import { List } from "@/server/db";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Card, PressableFeedback } from "heroui-native";
import { GestureResponderEvent } from "react-native";


type ListItemProps = {
  list: List
  onPress: (event: GestureResponderEvent) => void
}
export function ListItem({ list, onPress }: ListItemProps) {
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation(deleteListMutationOptions(list.id))
  const router = useRouter()

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={onPress}
    >
      <Card className="flex-row justify-between items-center">
        <PressableFeedback.Highlight />

        <Card.Body>
          <Card.Title>{list.name}</Card.Title>
        </Card.Body>

        <Card.Footer>
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
