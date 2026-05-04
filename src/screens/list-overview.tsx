import { ItemForm } from "@/components/item-form";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsOptions, createItemMutationOptions } from "@/lib/list-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";


export default function ListOverviewScreen() {
  const { mutateAsync, isPending } = useMutation(createItemMutationOptions());

  return (
    <ScreenLayout title="Einkaufslisten">
      <ItemForm
        onSubmit={async (values) => {
          mutateAsync(values)
        }}
      />

      <ItemsListing />
    </ScreenLayout>
  );
}


function ItemsListing() {
  const { data, isPending } = useQuery(allItemsOptions())

  if (isPending) return <ActivityIndicator size="large" className="text-accent" />

  return (
    <View className="flex-1 gap-2">
      <Text>Momenate Items</Text>

      <View className="flex-col gap-2">
        {data && data.map((item) => (
          <View key={item.id} className="border border-border p-2 rounded-md bg-surface-secondary flex-row gap-2">
            <Text>{item.name} - {item.quantity} {item.unit} - {item.notes}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}