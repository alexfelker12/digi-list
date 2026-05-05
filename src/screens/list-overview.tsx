import { ItemFormSheet } from "@/components/item-form-sheet";
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
        //* mock item
        // item={{
        //   name: "Test",
        //   quantity: 3,
        //   unit: "l",
        //   imageUris: [
        //     "file:///data/user/0/host.exp.exponent/cache/ImagePicker/d25f4e29-81db-4f8f-a570-d537d751cf26.jpeg"
        //   ],
        //   notes: "Irgendwas ja",
        //   sortOrder: 0,
        // }}
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
          <View key={item.id} className="border border-border p-2 rounded-md bg-surface-secondary flex-row gap-2">
            <Text>{item.name} - {item.quantity} {item.unit} - {item.notes}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
