import { ItemFormSheet } from "@/components/items/item-form-sheet";
import { ProductItem } from "@/components/items/product-item";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsOptions, createItemMutationOptions } from "@/lib/list-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";


// TODO: create list with items & list functionality (core of app)
// TODO: make edit screen maybe?

export default function ListOverviewScreen() {
  const { mutateAsync, isPending } = useMutation(createItemMutationOptions());

  return (
    <ScreenLayout title="Einkaufslisten">
      <ItemFormSheet
        onSubmit={async (values) => {
          await mutateAsync(values)
        }}
      />

      <ItemsListing />
    </ScreenLayout>
  );
}

function ItemsListing() {
  const { data, isPending } = useQuery(allItemsOptions())

  return (
    <View className="flex-1 gap-2">
      <Text>Momenate Items</Text>

      <View className="flex-col gap-2">
        {isPending ? (
          <ActivityIndicator size="large" className="text-accent" />
        ) : data && data.map((item) => (
          <ProductItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
