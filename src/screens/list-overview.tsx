import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { ListFormDialog } from "@/components/lists/list-form-dialog";
import { ItemList } from "@/components/lists/list-item";
import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { allListsQueryOptions, createListMutationOptions } from "@/lib/queries/list-queries";
import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Separator } from "heroui-native";
import { ActivityIndicator, View } from "react-native";


export default function ListOverviewScreen() {
  return (
    <ScreenLayout title="Einkaufslisten">
      <ListsListing />
    </ScreenLayout>
  );
}

function ListsListing() {
  const { data, isPending } = useQuery(allListsQueryOptions())
  const { mutateAsync: createList } = useMutation(createListMutationOptions())

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-muted italic">
          {data ? (data.length || "Keine") : 0} {data?.length === 1 ? "Eintrag" : "Einträge"}
        </Text>

        <ListFormDialog
          onSubmit={async (values) => {
            await createList(values, {
              // navigate to list details
              onSuccess: ({ id, name: listName }) => {
                router.push({ pathname: "/list/[id]/edit", params: { id, listName } })
              },
            })
          }}
        />
      </View>

      <Separator />

      <View className="flex-1 -mx-1">
        <FlashList
          data={data}
          keyExtractor={(list) => String(list.id)}
          renderItem={({ item: list }) => (
            <ItemList list={list} />
          )}
          ListEmptyComponent={isPending ? (
            <ActivityIndicator size="large" className="text-accent" />
          ) : (
            <EmptyListIndicator message="Noch keine Einkaufslisten erstellt" />
          )}
          contentContainerClassName="gap-2 px-1 pb-20"
        />
      </View>
    </View>
  );
}
