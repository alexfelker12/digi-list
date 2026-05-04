import { ItemFormSheet } from "@/components/item-form-sheet";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsOptions } from "@/lib/list-queries";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View } from "react-native";


export default function ListOverviewScreen() {

  return (
    <ScreenLayout title="Einkaufslisten">
      <ItemFormSheet />

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
          <View key={item.id} className="border border-border p-2 rounded-md bg-surface-secondary">
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}