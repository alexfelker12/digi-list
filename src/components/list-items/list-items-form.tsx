import { FloatingBottomContent } from "@/components/screen-layout";
import { addItemAtom } from "@/lib/atoms/add-item-atom";
import { useAppForm } from "@/lib/form";
import { getDisplayUri } from "@/lib/utils";
import { listItemEditSchema, ListItemEditValues, ListItemInsert, ListItemsFormValues, listItemsInsertSchema, Unit, unitMap } from "@/server/db/schema";
import { Image } from "expo-image";
import { router } from "expo-router";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { useAtom } from "jotai";
import { PlusIcon, Trash2Icon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { GestureResponderEvent, Keyboard, Pressable, View } from "react-native";
import ReorderableList, {
  ReorderableListRenderItemInfo, ReorderableListReorderEvent,
  reorderItems, useIsActive, useReorderableDrag
} from "react-native-reorderable-list";
import { cn } from "tailwind-variants";
import { EmptyListIndicator } from "../empty-list-indicator";
import { Icon } from "../icon";
import { ImagePlaceholder } from "../image/image-placeholder";
import { ImageViewerModal } from "../image/image-viewer-modal";


// ─── Helpers ──────────────────────────────────────────────────────────────────
function assignSortOrders(items: ListItemInsert[]): ListItemInsert[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }))
}

// ─── DraggableRow ─────────────────────────────────────────────────────────────
type RowProps = {
  item: ListItemInsert
  onPress: (event: GestureResponderEvent) => void
  onRemove: () => void
}
function DraggableRow({ item: listItem, onPress, onRemove }: RowProps) {
  const { item, quantity, unit } = listItem
  const [viewerVisible, setViewerVisible] = useState(false)

  const drag = useReorderableDrag()
  const isActive = useIsActive()
  const hasImageUris = item.imageUris && item.imageUris.length > 0

  return (
    // padding-bottom for correct height calculation when sorting by dragging
    <View className="pb-2 overflow-visible">
      <Card className={cn("flex-row gap-2 items-center", isActive && "opacity-80")} asChild>
        <Pressable onPress={onPress} onLongPress={drag} delayLongPress={350}>
          <Card.Header className="h-10 aspect-square">
            {hasImageUris ? (
              <Pressable
                onPress={() => setViewerVisible(true)}
                className="size-full"
              >
                <Image
                  source={{ uri: getDisplayUri(item.imageUris?.[0] ?? "") }}
                  style={{ flex: 1, borderRadius: 8 }}
                  contentFit="cover"
                  contentPosition="center"
                  transition={50}
                />
              </Pressable>
            ) : (
              <ImagePlaceholder />
            )}

            {/* fullscreen image viewer */}
            {hasImageUris && viewerVisible && <ImageViewerModal
              uris={item.imageUris ?? []}
              visible={viewerVisible}
              onClose={() => setViewerVisible(false)}
            />}
          </Card.Header>

          <Card.Body className="flex-1">
            <Card.Title className="leading-tight">{item.name}</Card.Title>
            <Card.Description className="leading-snug">
              {quantity} {unit && unitMap[unit]}
            </Card.Description>
          </Card.Body>

          <Card.Footer className="justify-center">
            <Button variant="danger-soft" onPress={onRemove} className="h-10" isIconOnly>
              <Icon icon={Trash2Icon} className="text-danger-soft-foreground" />
            </Button>
          </Card.Footer>

        </Pressable>
      </Card>
    </View>
  );
}

// ─── EditSheet ───────────────────────────────────────────────────────────────
type EditSheetProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingItem: ListItemInsert | null
  onSubmit: (values: ListItemEditValues) => void
}
function EditSheet({ isOpen, onOpenChange, editingItem, onSubmit }: EditSheetProps) {
  const form = useAppForm({
    defaultValues: {
      quantity: editingItem?.quantity ?? null as unknown as number,
      unit: editingItem?.unit ?? null as unknown as Unit,
      notes: editingItem?.notes ?? null,
    },
    validators: {
      onSubmit: listItemEditSchema,
      onChange: listItemEditSchema,
    },
    onSubmit: ({ value }) => {
      if (Keyboard.isVisible()) Keyboard.dismiss()
      onSubmit(value)
    },
  })

  // reset form when a new item is opened
  useEffect(() => {
    if (editingItem) {
      form.reset({
        quantity: editingItem.quantity ?? null,
        unit: editingItem.unit ?? null,
        notes: editingItem.notes ?? null,
      })
    }
  }, [editingItem])

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay onPress={() => Keyboard.dismiss()} />
        <BottomSheet.Content
          contentContainerClassName="p-4 pt-0 gap-4"
          keyboardBlurBehavior="restore"
          enableBlurKeyboardOnGesture
        >
          <View className="gap-1">
            <BottomSheet.Title className="leading-[1.2] pr-6 text-accent" numberOfLines={1}>
              {editingItem?.item?.name}
            </BottomSheet.Title>
            <BottomSheet.Description className="leading-snug">
              Passe hier die Menge und Einheit an
            </BottomSheet.Description>
          </View>

          <View className="gap-4">
            <View className="gap-3 flex-row">
              <View className="flex-1">
                <form.AppField
                  name="quantity"
                  children={(field) => <field.NumberField label="Menge *" />}
                />
              </View>
              <View className="flex-1">
                <form.AppField
                  name="unit"
                  children={(field) => <field.UnitField label="Einheit *" />}
                />
              </View>
            </View>

            <form.AppField
              name="notes"
              children={(field) => <field.TextField label="Notizen" multiline />}
            />

            <form.AppForm>
              <form.SubmitButton label="Speichern" />
            </form.AppForm>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
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
  const [addItemState, setAddItem] = useAtom(addItemAtom)

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

  // react to item selected on add-list-item screen
  useEffect(() => {
    if (addItemState.status !== "selected") return
    setAddItem({ status: "idle" })

    const listItems = form.getFieldValue("listItems")
    const existingListItem = listItems.find((listItem) => listItem.item.id === addItemState.item.id)

    if (existingListItem) {
      // if selecting item which already is in list, set it as editingItem to open its edit form
      setEditingItem(existingListItem)
    } else {
      // else create a new list item
      setEditingItem({
        item: addItemState.item,
        sortOrder: listItems.length,
        listId,
        itemId: addItemState.item.id,
        notes: null,
        quantity: null as unknown as number,
        unit: null as unknown as Unit,
      })
    }

    setTimeout(() => setIsOpen(true), 250)
  }, [addItemState])

  const openEditSheet = (item: ListItemInsert) => {
    setEditingItem(item)
    setIsOpen(true)
  }

  return (
    <View className="flex-1 gap-4">
      <form.AppField name="listItems" mode="array">
        {(field) => (
          <View className="-mx-4">
            <ReorderableList
              data={field.state.value}
              keyExtractor={(listItem) => String(listItem.item.id)}
              onReorder={({ from, to }: ReorderableListReorderEvent) => {
                const sorted = assignSortOrders(reorderItems(field.state.value, from, to));
                field.handleChange(sorted);
              }}
              renderItem={({ item, index }: ReorderableListRenderItemInfo<ListItemInsert>) => (
                <DraggableRow
                  item={item}
                  onPress={() => openEditSheet(item)}
                  onRemove={() => {
                    const next = assignSortOrders(field.state.value.filter((_, i) => i !== index));
                    field.handleChange(next);
                  }}
                />
              )}
              ListEmptyComponent={
                <EmptyListIndicator message="Diese Einkaufsliste hat noch keine Produkte" />
              }
              contentContainerClassName="pt-px px-4 pb-24 overflow-x-auto gap-0"
              cellAnimations={{ overflow: "visible" }}
            />
          </View>
        )}
      </form.AppField>

      {/* bottom-sheet lives outside field render scope */}
      <EditSheet
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setEditingItem(null)
        }}
        editingItem={editingItem}
        onSubmit={(values) => {
          // under normal circumstances editingItem has a sortOrder set
          if (!editingItem || typeof editingItem.sortOrder === "undefined") return

          const isNew = editingItem.sortOrder === form.getFieldValue("listItems").length

          if (isNew) {
            form.pushFieldValue("listItems",
              { ...editingItem!, ...values }
            )
          } else {
            form.replaceFieldValue("listItems", editingItem.sortOrder,
              { ...editingItem!, ...values }
            )
          }
          setIsOpen(false)
          setEditingItem(null)
        }}
      />

      <FloatingBottomContent className="via-background/80">
        <View className="flex-row items-center justify-between gap-2 pb-4">
          <View className="flex-1">
            <Button
              variant="tertiary"
              className="pl-3"
              onPress={() => {
                setAddItem({ status: "pending" })
                router.push("/list/[id]/edit/add-item")
              }}
            >
              <Icon icon={PlusIcon} />
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
  );
}
