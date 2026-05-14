import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { RunItem } from "@/components/items/run-item";
import { CheckedCount } from "@/components/run-list/checked-count";
import { ScreenLayout } from "@/components/screen-layout";
import { listItemsQueryOptions } from "@/lib/queries/list-item-queries";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";


export default function RunListScreen() {
  const { id, listName } = useLocalSearchParams<
    "/list/[id]/edit",
    { listName: string }
  >()
  const listId = +id

  const { data, isPending } = useQuery({
    ...listItemsQueryOptions(listId),
    staleTime: 1000
  })

  return (
    <ScreenLayout title={listName ?? "Einkaufsliste"} showBack className="pb-0">
      <View className="flex-1 gap-4">

        <View className="flex-row items-center gap-4">
          <CheckedCount listId={listId} />

          {/* // TODO: reset list button */}
        </View>

        <View className="flex-1 -mx-1">
          <FlatList
            data={data}
            keyExtractor={(list) => String(list.id)}
            renderItem={({ item }) => (
              <RunItem
                item={item}
              // onPress={() => console.log(item.id)}
              />
            )}
            ListEmptyComponent={isPending ? (
              <ActivityIndicator size="large" className="text-accent" />
            ) : (
              <EmptyListIndicator message="Einkaufsliste hat keine Produkte" />
            )}
            contentContainerClassName="gap-2 px-1 pb-20"
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
