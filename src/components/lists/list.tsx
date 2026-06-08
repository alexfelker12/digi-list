import { ListWithItemCount } from "@/server/db";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { EllipsisVerticalIcon } from 'lucide-react-native';
import { GestureResponderEvent } from "react-native";
import { Icon } from "../icon";


type ListProps = {
  list: ListWithItemCount
  openMenu: (list: ListWithItemCount) => void
  onPress?: (list: ListWithItemCount, event: GestureResponderEvent) => void
}
export function List({ list, openMenu, onPress }: ListProps) {
  const { name, itemsCount } = list

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={(event) => onPress?.(list, event)}
    >
      <Card className="flex-row justify-between items-center">
        <PressableFeedback.Highlight />

        <Card.Body>
          <Card.Title className="leading-tight">{name}</Card.Title>
          <Card.Description className="leading-snug">
            {itemsCount || "keine"} Produkt{itemsCount === 1 ? "" : "e"}
          </Card.Description>
        </Card.Body>

        <Card.Footer className="flex-row gap-1.5">
          <Button
            variant="outline"
            className="h-10"
            onPress={() => openMenu(list)}
            hitSlop={8}
            isIconOnly
          >
            <Icon icon={EllipsisVerticalIcon} size={18} />
          </Button>
        </Card.Footer>

      </Card>
    </PressableFeedback>
  );
}
