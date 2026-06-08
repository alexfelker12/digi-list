import { getDisplayUri } from "@/lib/utils";
import { ItemWithUriArray } from "@/server/db";
import { Image } from "expo-image";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { EllipsisVerticalIcon } from "lucide-react-native";
import { useState } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import { Icon } from "../icon";
import { ImagePlaceholder } from "../image/image-placeholder";
import { ImageViewerModal } from "../image/image-viewer-modal";


type ItemTestProps = {
  item: ItemWithUriArray
  openMenu: (list: ItemWithUriArray) => void
  onPress?: (item: ItemWithUriArray, event: GestureResponderEvent) => void
}
export function ProductItem({ item, openMenu, onPress }: ItemTestProps) {
  const { imageUris, name } = item
  const [viewerVisible, setViewerVisible] = useState(false)
  const hasImageUris = imageUris.length > 0

  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={(event) => onPress?.(item, event)}
    >
      <Card className="flex-row gap-3">
        <PressableFeedback.Highlight />

        <Card.Header className="h-10 aspect-square">
          {hasImageUris ? (
            <Pressable
              onPress={() => setViewerVisible(true)}
              className="size-full"
            >
              <Image
                source={{ uri: getDisplayUri(imageUris[0]) }}
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
            uris={imageUris}
            visible={viewerVisible}
            onClose={() => setViewerVisible(false)}
          />}
        </Card.Header>

        <Card.Body className="flex-1 gap-0">
          <Card.Title className="text-lg leading-[1.2]" numberOfLines={1}>{name}</Card.Title>
          {/* // TODO: more information here? */}
        </Card.Body>

        <Card.Footer className="flex-row gap-1.5">
          <Button
            variant="outline"
            className="h-10"
            onPress={() => openMenu(item)}
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
