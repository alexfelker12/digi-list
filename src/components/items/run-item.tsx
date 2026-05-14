import { queryKeys } from "@/lib/queries/_helper";
import { toggleCheckedListItemMutationOptions } from "@/lib/queries/list-item-queries";
import { ListItemWithItem, unitMap } from "@/server/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Checkbox, Dialog, PressableFeedback } from "heroui-native";
import { useState } from "react";
import { GestureResponderEvent, Keyboard, View } from "react-native";
import { StrikethroughText } from "../animated-strikethorugh-text";
import { Icon } from "../icon";
import { Text } from "../text";


type BaseProps = { item: ListItemWithItem }
type RunItemProps = BaseProps & {
  onPress?: (event: GestureResponderEvent) => void
}
export function RunItem({ item, onPress }: RunItemProps) {
  const [isChecked, setIsChecked] = useState(item.checked ?? false)
  const purchaseAmount = getPurchaseAmount(item)

  const qc = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    ...toggleCheckedListItemMutationOptions(item.id),
    onSuccess: () => {
      // TODO: currently invalidating 2 queries for each toggled check. Maybe optimize
      qc.invalidateQueries({ queryKey: queryKeys.checkedCount(item.listId) })
      qc.invalidateQueries({ queryKey: queryKeys.listItems(item.listId) })
    },
  })

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={(event) => {
        if (isPending) return
        onPress?.(event)

        setIsChecked(prev => !prev)
        // use inverse, since isChecked is not yet set to true at this point of execution
        mutateAsync({ checked: !isChecked })
      }}
    // isDisabled={state here}
    >
      <Card className="flex-row justify-between items-center gap-3">
        <PressableFeedback.Highlight />

        <Checkbox
          isSelected={isChecked}
          onSelectedChange={setIsChecked}
        />

        <Card.Body className="flex-1">
          <Card.Title
          // TODO: without animation 
          // className={cn(
          //   "leading-tight text-accent",
          //   isChecked && "line-through text-muted/75"
          // )}
          >
            <StrikethroughText isChecked={isChecked} className="leading-tight text-lg">
              {item.item.name}
            </StrikethroughText>
          </Card.Title>
          <Card.Description className="leading-snug">{purchaseAmount}</Card.Description>
        </Card.Body>

        <Card.Footer>
          <RunItemContext item={item} />
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}

type RunItemContextProps = BaseProps
function RunItemContext({ item }: RunItemContextProps) {
  const [isOpen, setIsOpen] = useState(false)
  const purchaseAmount = getPurchaseAmount(item)

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="tertiary" size="sm" hitSlop={8}>
          <Icon name="information-circle" size={20} />
          <Button.Label>Info</Button.Label>
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
          className="gap-4"
          onStartShouldSetResponder={() => {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss()
              return true
            }
            return false
          }}
        >
          <Dialog.Close variant="ghost" className="absolute top-1.5 right-1.5" />

          <View className="gap-1">
            <Dialog.Title className="leading-none text-accent">{item.item.name}</Dialog.Title>
            <Dialog.Description className="leading-snug">{purchaseAmount}</Dialog.Description>
          </View>

          <View>
            <Text>{item.item.imageUris}</Text>
            <Text>{item.notes}</Text>
            {/* hier dann content, bilder etc... */}
          </View>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const getPurchaseAmount = ({ quantity, unit }: BaseProps["item"]) => `${quantity} ${unit && unitMap[unit]}`
