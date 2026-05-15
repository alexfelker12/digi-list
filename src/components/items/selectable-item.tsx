import { getDisplayUri } from "@/lib/utils";
import { useItemSelect } from "@/screens/context/select-item-context";
import { ItemWithUriArray } from "@/server/db";
import { Image } from "expo-image";
import { Card, PressableFeedback } from "heroui-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { ImageViewerModal } from "../image/image-viewer-modal";


type ItemTestProps = {
  item: ItemWithUriArray
}
export function SelectableItem({ item }: ItemTestProps) {
  const { handleSelect } = useItemSelect()
  const [viewerVisible, setViewerVisible] = useState(false);

  const uris = item.imageUris.length > 0 ? item.imageUris : ["react-logo"];
  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={() => handleSelect(item)}
    >
      <Card className="flex-row gap-2">
        <PressableFeedback.Highlight />

        <Card.Header className="flex-1 aspect-square">
          <Pressable
            onPress={() => setViewerVisible(true)}
            className="size-full"
          >
            <Image
              source={{ uri: getDisplayUri(uris[0]) }}
              style={{ flex: 1, borderRadius: 8 }}
              contentFit="cover"
              contentPosition="center"
              transition={50}

              {...(item.imageUris.length === 0 && {
                width: 100,
                height: 100
              })}
            />
          </Pressable>

          <ImageViewerModal
            uris={uris}
            visible={viewerVisible}
            onClose={() => setViewerVisible(false)}
          />
        </Card.Header>

        <Card.Body className="flex-4 gap-0">
          <Card.Title className="pr-20 text-lg" numberOfLines={1}>{item.name}</Card.Title>
          {/* // TODO: more information here? */}
        </Card.Body>

        <Card.Footer className="absolute top-4 right-4 flex-row gap-1.5">
          {/* // TODO: add nav to edit screen here for now */}
        </Card.Footer>

      </Card>
    </PressableFeedback>
  );
}

