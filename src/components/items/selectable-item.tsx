import { getDisplayUri } from "@/lib/utils";
import { useItemSelect } from "@/screens/context/select-item-context";
import { ItemWithUriArray } from "@/server/db";
import { Image } from "expo-image";
import { Card, PressableFeedback } from "heroui-native";


type ItemTestProps = {
  item: ItemWithUriArray
}
export function SelectableItem({ item }: ItemTestProps) {
  const { handleSelect } = useItemSelect()

  const uris = item.imageUris.length > 0 ? item.imageUris : ["react-logo"];
  return (
    <PressableFeedback
      className="overflow-auto"
      onPress={() => handleSelect(item)}
    >
      <Card className="flex-row gap-2">
        <PressableFeedback.Highlight />

        <Card.Header className="flex-1 aspect-square">
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
        </Card.Header>

        <Card.Body className="flex-4 gap-0">
          <Card.Title className="pr-20 text-lg" numberOfLines={1}>{item.name}</Card.Title>
        </Card.Body>

        <Card.Footer className="absolute top-4 right-4 flex-row gap-1.5">

        </Card.Footer>

      </Card>
    </PressableFeedback>
  );
}

