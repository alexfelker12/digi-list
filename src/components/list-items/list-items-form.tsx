import { FloatingBottomContent } from "@/components/screen-layout";
import { navCallbackAtom } from "@/lib/atoms/addItemAtom";
import { useAppForm, withForm } from "@/lib/form";
import {
  ItemWithUriArray, ListItemInsert, listItemSchema, ListItemsFormValues, listItemsInsertSchema, Unit,
  unitMap,
} from "@/server/db/schema";
import { ExpoRouter, router } from "expo-router";
import { Card, cn, Dialog } from "heroui-native";
import { Button } from "heroui-native/button";
import { useAtom } from "jotai";
import { useState } from "react";
import { GestureResponderEvent, Keyboard, Pressable, View } from "react-native";
import ReorderableList, {
  ReorderableListRenderItemInfo, ReorderableListReorderEvent, reorderItems, useIsActive, useReorderableDrag
} from "react-native-reorderable-list";
import { EmptyListIndicator } from "../empty-list-indicator";
import { Icon } from "../icon";


// ─── Helpers ─────────────────────────────────────────────────────────────────
function assignSortOrders(items: ListItemInsert[]): ListItemInsert[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }))
}

// ─── DraggableRow ─────────────────────────────────────────────────────────────
type RowProps = {
  item: ListItemInsert
  onPress: (event: GestureResponderEvent) => void
  onRemove: () => void
}
function DraggableRow({ item, onPress, onRemove }: RowProps) {
  const drag = useReorderableDrag()
  const isActive = useIsActive()

  return (
    // padding-bottom as gap, because gap causes weird overlapping in flatlist container
    <View className="pb-2 overflow-visible">
      <Card className={cn("flex-row gap-2 items-center", isActive && "opacity-80")} asChild>
        <Pressable onPress={onPress} onLongPress={drag}>

          <Card.Body className="flex-1">
            <Card.Title className="leading-tight">{item.item.name}</Card.Title>
            <Card.Description className="leading-snug">
              {item.quantity} {item.unit && unitMap[item.unit]}
            </Card.Description>
          </Card.Body>

          <Card.Footer className="justify-center">
            <Button variant="danger-soft" size="sm" onPress={onRemove} isIconOnly>
              <Icon name="trash" className="text-danger-soft-foreground" size={20} />
            </Button>
          </Card.Footer>
        </Pressable>
      </Card>
    </View>
  );
}

// ─── ListItemsForm ────────────────────────────────────────────────────────────
export interface ListItemFormProps {
  listId: number
  list: ListItemsFormValues
  onSubmit: (values: ListItemsFormValues) => Promise<void>
}
export function ListItemsForm({ listId, list, onSubmit }: ListItemFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ListItemInsert | null>(null)
  const [isNewItem, setIsNewItem] = useState(false)
  const [itemDraft, setItemDraft] = useState<ListItemInsert | null>(null)

  const form = useAppForm({
    defaultValues: list,
    validators: {
      onSubmit: listItemsInsertSchema,
      onChange: listItemsInsertSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset(value)
    },
  })

  // async return from other screen
  const [_, setCallback] = useAtom(navCallbackAtom);
  const pushAndWait = (path: ExpoRouter.__routes["href"]): Promise<ItemWithUriArray | null> => {
    return new Promise((resolve) => {
      setCallback(() => resolve)
      router.push(path)
    })
  }

  const openEditDialog = (item: ListItemInsert) => {
    setItemDraft(item)
    setEditingItem(item)
    setIsOpen(true)
  }

  return (
    <form.AppField name="listItems" mode="array">
      {(field) => (
        <View className="flex-1 gap-4">
          <View className="gap-2">
            <View className="-mx-4">
              <ReorderableList
                data={field.state.value}
                keyExtractor={(item, index) => `${index}-${item.id}`}
                onReorder={({ from, to }: ReorderableListReorderEvent) => {
                  const sorted = assignSortOrders(reorderItems(field.state.value, from, to));
                  field.handleChange(sorted);
                }}
                renderItem={({ item, index }: ReorderableListRenderItemInfo<ListItemInsert>) => (
                  <DraggableRow
                    item={item}
                    onPress={() => openEditDialog(item)}
                    onRemove={() => {
                      const next = assignSortOrders(field.state.value.filter((_, i) => i !== index));
                      field.handleChange(next);
                    }}
                  />
                )}
                ListEmptyComponent={
                  <EmptyListIndicator message="Diese Einkaufsliste hat noch keine Produkte" />
                }
                contentContainerClassName="pt-px px-4 pb-24 overflow-x-auto"
                cellAnimations={{ overflow: "visible" }}
              />
            </View>

            <Dialog
              isOpen={isOpen}
              onOpenChange={(open) => {
                if (!open) {
                  // edit dialog was dismissed...
                  if (isNewItem) {
                    // ... remove newly added item
                    field.removeValue(editingItem!.sortOrder!)
                  } else if (itemDraft !== null) {
                    // ... restore latest draft
                    field.replaceValue(editingItem!.sortOrder!, itemDraft)
                  }
                  setIsNewItem(false)
                  setEditingItem(null)
                  setItemDraft(null)
                }
                setIsOpen(open)
              }}
            >
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
                    <Dialog.Title
                      className="leading-none pr-6 text-accent"
                      numberOfLines={1}
                    >
                      {editingItem !== null && editingItem.item && `${editingItem.item.name}`}
                    </Dialog.Title>
                    <Dialog.Description className="leading-snug">
                      Passe hier die Menge und Einheit an
                    </Dialog.Description>
                  </View>

                  {editingItem !== null &&
                    typeof editingItem.sortOrder !== "undefined" && (
                      <ListItemEditFields
                        form={form}
                        index={editingItem.sortOrder}
                        buttonLabel={isNewItem ? "Hinzufügen" : "Speichern"}
                        onConfirm={() => {
                          setItemDraft(null)
                          setIsNewItem(false)
                          setIsOpen(false)
                        }}
                      />
                    )}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          </View>

          <FloatingBottomContent className="via-background/80">
            <View className="flex-row items-center justify-between gap-3 pb-4">

              <View className="flex-1">
                <Button
                  variant="tertiary"
                  className="pl-3"
                  onPress={async () => {
                    const item = await pushAndWait("/list/[id]/edit/add-item");
                    if (item) {
                      const listItem: ListItemInsert = {
                        item,
                        sortOrder: field.state.value.length,
                        listId,
                        itemId: item.id,
                        notes: null,
                        // initial value null, validation later ensures data is valid
                        quantity: null as unknown as number,
                        unit: null as unknown as Unit,
                      }
                      field.pushValue(listItem)
                      setEditingItem(listItem)
                      setIsNewItem(true)
                      setIsOpen(true)
                    }
                  }}
                >
                  <Icon name="add" size={20} />
                  <Button.Label>Hinzufügen</Button.Label>
                </Button>
              </View>

              <View className="flex-1">
                <form.AppForm>
                  <form.SubmitButton label="Speichern" />
                </form.AppForm>
              </View>

            </View>
          </FloatingBottomContent>
        </View>
      )}
    </form.AppField>
  );
}

// ─── ListItemEditFields ───────────────────────────────────────────────────────
const ListItemEditFields = withForm({
  defaultValues: { listItems: [] } as ListItemsFormValues,
  validators: {
    onChange: listItemsInsertSchema,
  },
  props: {
    index: 0 as number,
    buttonLabel: "" as string,
    onConfirm: () => { },
  },
  render: function Render({ form, index, buttonLabel, onConfirm }) {
    return (
      <View className="gap-4">
        <View className="gap-3 flex-row">
          <View className="flex-1">
            <form.AppField
              name={`listItems[${index}].quantity`}
              children={(field) => <field.NumberField label="Menge *" />}
            />
          </View>
          <View className="flex-1">
            <form.AppField
              name={`listItems[${index}].unit`}
              children={(field) => <field.UnitField label="Einheit *" />}
            />
          </View>
        </View>

        <form.AppField
          name={`listItems[${index}].notes`}
          children={(field) => <field.TextField label="Notizen" />}
        />

        <form.Subscribe
          selector={(state) => ({
            quantity: state.values.listItems[index]?.quantity,
            unit: state.values.listItems[index]?.unit,
          })}
        >
          {({ quantity, unit }) => {
            const { success: isUnitValid } = listItemSchema.shape.unit.safeParse(unit)
            const { success: isQuantityValid } = listItemSchema.shape.quantity.safeParse(quantity)
            const isValid = isUnitValid && isQuantityValid

            return (
              <Button
                variant="secondary"
                onPress={onConfirm}
                isDisabled={!isValid}
              >
                <Button.Label>{buttonLabel}</Button.Label>
              </Button>
            );
          }}
        </form.Subscribe>
      </View>
    );
  },
})
