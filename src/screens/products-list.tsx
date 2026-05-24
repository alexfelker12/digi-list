import { Icon } from "@/components/icon";
import { ItemFormSheet } from "@/components/items/item-form-sheet";
import { ProductsListing } from "@/components/items/product-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsQueryOptions, createItemMutationOptions } from "@/lib/queries/item-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Separator } from "heroui-native";
import { CirclePlusIcon } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";


export default function ProductsListScreen() {
  const [isOpen, setIsOpen] = useState(false)

  const { data, isPending } = useQuery(allItemsQueryOptions())
  const { mutateAsync: createItem } = useMutation(createItemMutationOptions())

  return (
    <ScreenLayout title="Produkte" className="pb-0">

      <View className="flex-row items-center justify-between">

        <Text className="text-muted italic">
          {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Produkt" : "Produkte"}
        </Text>

        <Button variant="secondary" className="h-10" onPress={() => setIsOpen(true)}>
          <Icon icon={CirclePlusIcon} />
          <Button.Label>Erstellen</Button.Label>
        </Button>

      </View>

      <ItemFormSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={async (values) => {
          await createItem(values)
        }}
      />
      <Separator />

      <ProductsListing
        data={data}
        isPending={isPending}
        className="pb-4"
      />

    </ScreenLayout>
  );
}
