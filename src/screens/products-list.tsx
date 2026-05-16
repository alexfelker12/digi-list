import { ProductsListing } from "@/components/items/product-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allItemsQueryOptions } from "@/lib/queries/item-queries";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "heroui-native";
import { View } from "react-native";


export default function ProductsListScreen() {
  const { data, isPending } = useQuery(allItemsQueryOptions())

  // const qc = useQueryClient()
  // const { mutateAsync: createList } = useMutation({
  //   ...createListMutationOptions(),
  //   onSuccess: qc.invalidateQueries({ queryKey: queryKeys.items() })
  // })

  return (
    <ScreenLayout title="Produkte">
      <View className="flex-1 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted italic">
            {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Produkt" : "Produkte"}
          </Text>

          {/* <ListFormDialog
            onSubmit={async (values) => {
              await createList(values, {
                // navigate to list details
                onSuccess: (data) => {
                  navigateToEdit(data.id, data.name)
                },
              })
            }}
          /> */}
        </View>

        <Separator />

        {/* // TODO: refactor bottom tabs for easier display of lists in tab screens */}
        <ProductsListing
          data={data}
          isPending={isPending}
          className="pb-20"
        />
      </View>
    </ScreenLayout>
  );
}
