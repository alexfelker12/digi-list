import { queryKeys } from "@/lib/queries/_helper";
import { deleteItemMutationOptions, updateItemMutationOptions } from "@/lib/queries/item-queries";
import { getDisplayUri } from "@/lib/utils";
import { ItemWithUriArray } from "@/server/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Button, Card } from "heroui-native";
import { SquarePenIcon } from "lucide-react-native";
import { View } from "react-native";
import { DeleteDialog } from "../delete-dialog";
import { Icon } from "../icon";
import { ItemFormSheet } from "./item-form-sheet";


type ItemTestProps = {
  item: ItemWithUriArray
}
export function ProductItem({ item }: ItemTestProps) {
  const qc = useQueryClient()

  const { mutateAsync: updateItem } = useMutation({
    ...updateItemMutationOptions(item.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.items() });
      qc.invalidateQueries({ queryKey: queryKeys.item(item.id) });
    },
  })
  const { mutateAsync: deleteItem, isPending: deletePending } = useMutation({
    ...deleteItemMutationOptions(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items() }),
  })

  const uris = item.imageUris.length > 0 ? item.imageUris : ["react-logo"];

  return (
    <Card className="flex-row gap-2">
      <Card.Header className="flex-1 aspect-square">

        <Image
          source={{ uri: getDisplayUri(uris[0]) }}
          style={{ flex: 1, borderRadius: 8 }}
          contentFit="cover"
          contentPosition="center"
          transition={200}

          {...(item.imageUris.length === 0 && {
            width: 100,
            height: 100
          })}
        />

      </Card.Header>

      <Card.Body className="flex-3 gap-0">

        <Card.Title className="pr-20" numberOfLines={1}>{item.name}</Card.Title>

        <View className="flex-1 flex-col justify-end gap-2">
          {/* <View className="flex-row gap-1">
            <Text>{item.quantity}x</Text>
            <Text>{unitMap[item.unit]}</Text>
          </View> */}

          {/* <Text className="text-sm text-muted leading-tight">{item.notes}</Text> */}
        </View>

      </Card.Body>

      <Card.Footer className="absolute top-4 right-4 flex-row gap-1.5">

        <ItemFormSheet item={item}
          onSubmit={async (values) => {
            await updateItem(values)
          }}
        >
          <Button variant="outline" size="sm" isIconOnly>
            <Icon icon={SquarePenIcon} />
          </Button>
        </ItemFormSheet>

        <DeleteDialog
          name={item.name}
          actionPending={deletePending}
          onConfirm={deleteItem}
        />

      </Card.Footer>
    </Card>
  );
}

