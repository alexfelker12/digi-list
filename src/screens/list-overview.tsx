import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { ListItem } from "@/components/lists/list-item";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allListsQueryOptions, createListMutationOptions } from "@/lib/list-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Separator } from "heroui-native";
import { ActivityIndicator, View } from "react-native";


// TODO: create list with items & list functionality (core of app)
// TODO: make edit screen maybe?
export default function ListOverviewScreen() {
  return (
    <ScreenLayout title="Einkaufslisten">
      <ListsListing />
    </ScreenLayout>
  );
}


function ListsListing() {
  const { data, isPending } = useQuery(allListsQueryOptions())
  const router = useRouter()

  const mutationOptions = createListMutationOptions()
  const mutationOptionsOnSuccess = mutationOptions.onSuccess
  const { mutateAsync } = useMutation({
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptionsOnSuccess?.(...args)

      // navigate to list details
      handleNavigation(args[0].id)
    }
  })

  const handleNavigation = (listId: number) => {
    router.push({ pathname: "/list/[id]", params: { id: listId } })
  }

  return (
    <View className="flex-1 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg">
          {data?.length ?? 0} {data?.length === 1 ? "Eintrag" : "Einträge"}
        </Text>

        <ListFormDialog
          onSubmit={async (values) => {
            await mutateAsync(values)
          }}
        />
      </View>

      <Separator />

      <View className="flex-1 flex-col gap-2 pb-1">
        {isPending && <ActivityIndicator size="large" className="text-accent" />}

        {data && data.map((list) => (
          <ListItem key={list.id} list={list} onPress={() => handleNavigation(list.id)} />
        ))}
      </View>
    </View>
  );
}

// import { ProductItem } from "@/components/items/product-item";
// import { Text } from "@/components/text";
// import { allItemsOptions } from "@/lib/list-queries";
// import { useQuery } from "@tanstack/react-query";
// import { ActivityIndicator, View } from "react-native";

// function ItemsListing() {
//   const { data, isPending } = useQuery(allItemsOptions())

//   return (
//     <View className="flex-1 gap-2">
//       <Text>Momenate Items</Text>

//       <View className="flex-col gap-2">
//         {isPending ? (
//           <ActivityIndicator size="large" className="text-accent" />
//         ) : data && data.map((item) => (
//           <ProductItem key={item.id} item={item} />
//         ))}
//       </View>
//     </View>
//   );
// }
