import { ItemFormSheet } from "@/components/items/item-form-sheet";
import { ProductsListing } from "@/components/items/product-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsQueryOptions, createItemMutationOptions } from "@/lib/queries/item-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Separator } from "heroui-native";
import { View } from "react-native";


export default function ProductsListScreen() {
  const { data, isPending } = useQuery(allItemsQueryOptions())

  const { mutateAsync: createItem } = useMutation(createItemMutationOptions())

  return (
    <ScreenLayout title="Produkte">
      <View className="flex-1 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted italic">
            {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Produkt" : "Produkte"}
          </Text>

          <ItemFormSheet
            onSubmit={async (values) => {
              await createItem(values)
            }}
          />
        </View>

        <Separator />

        <ProductsListing
          data={data}
          isPending={isPending}
        />
      </View>
    </ScreenLayout>
  );
}
