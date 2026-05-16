import { queryKeys } from "@/lib/queries/_helper";
import { toggleCheckedListItemMutationOptions } from "@/lib/queries/run-list-queries";
import { getDisplayUri } from "@/lib/utils";
import { useRunListItem } from "@/screens/context/run-list-item-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { BottomSheet, Button, Card, Checkbox, PressableFeedback, Separator } from "heroui-native";
import { InfoIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { GestureResponderEvent, Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { StrikethroughText } from "@/components/animated-strikethorugh-text";
import { Icon } from "@/components/icon";
import { ImageViewerModal } from "@/components/image/image-viewer-modal";
import { Text } from "@/components/text";


type RunItemProps = {
  onPress?: (event: GestureResponderEvent) => void
}
export function RunItem({ onPress }: RunItemProps) {
  const { listItem, purchaseAmount } = useRunListItem()
  const { checked, id, listId, item, notes } = listItem
  const [isChecked, setIsChecked] = useState(checked)

  // has notes and/or images
  const hasMoreContext = !!notes || item.imageUris.length > 0

  useEffect(() => {
    // if items are refetched on page revisit or reset list explicitly set since useState arg doesn't set properly
    setIsChecked(checked)
  }, [listItem])

  const qc = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    ...toggleCheckedListItemMutationOptions(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.checkedCount(listId) })
      qc.invalidateQueries({
        queryKey: queryKeys.listItems(listId),
        refetchType: "none" // do not trigger refetch, checkbox state perfectly reflects state
      })
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
          <Card.Title>
            <StrikethroughText isChecked={isChecked} className="leading-tight text-lg">
              {item.name}
            </StrikethroughText>
          </Card.Title>
          <Card.Description className="leading-snug">{purchaseAmount}</Card.Description>
        </Card.Body>

        {hasMoreContext && (
          <Card.Footer>
            <RunItemContext />
          </Card.Footer>
        )}
      </Card>
    </PressableFeedback>
  );
}

function RunItemContext() {
  const { listItem: { notes, item: { name, imageUris } }, purchaseAmount } = useRunListItem()
  const hasImageUris = imageUris.length > 0
  const hasMultipleImages = imageUris.length > 1

  const [isOpen, setIsOpen] = useState(false)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const { width } = useWindowDimensions()
  const paddingAwareSize = width
    - 40 // p-5 -> 2x 20px padding left and right
    - (hasMultipleImages ? 100 : 0) // multiple images should be smaller to indicate horizontal scrolling

  return (
    <>
      <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen}>
        <BottomSheet.Trigger asChild>
          <Button variant="tertiary" size="sm" hitSlop={8}>
            <Icon icon={InfoIcon} />
            <Button.Label>Info</Button.Label>
          </Button>
        </BottomSheet.Trigger>

        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content
            activeOffsetY={[-10, 10]}
            failOffsetX={[-15, 15]}
            contentContainerClassName="pt-1 gap-4"
          >

            {/* name, amount and notes */}
            <View className="gap-1">
              <BottomSheet.Title className="leading-[1.2] text-accent">{name}</BottomSheet.Title>
              <BottomSheet.Description className="leading-snug">{purchaseAmount}</BottomSheet.Description>
            </View>

            {notes && <>
              <Separator />
              <Text className="text-foreground/75 text-base">{notes}</Text>
            </>}

            {/* images with horizontal scroll, use image viewer modal on press */}
            {hasImageUris && <>
              <Separator />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                {imageUris.map((uri, i) => (
                  <Pressable
                    key={`${uri}-${i}`}
                    onPress={() => {
                      setViewerIndex(i)
                      setViewerVisible(true)
                    }}
                    className="rounded-xl overflow-hidden"
                  >
                    <Image
                      source={{ uri: getDisplayUri(uri) }}
                      style={{ width: paddingAwareSize, height: paddingAwareSize }}
                      contentFit="cover"
                      className="rounded-xl"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </>}

          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>

      {/* fullscreen image viewer */}
      {hasImageUris && <ImageViewerModal
        visible={viewerVisible}
        uris={imageUris}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />}
    </>
  );
}
