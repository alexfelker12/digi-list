import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { CheckedCount } from "@/components/run-list/checked-count";
import { ResetList } from "@/components/run-list/reset-list";
import { RunItem } from "@/components/run-list/run-item";
import { ScreenLayout } from "@/components/screen-layout";
import { listItemsQueryOptions } from "@/lib/queries/list-item-queries";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ListItemsProvider } from "./context/list-items-context";


export default function RunListScreen() {
  const { id, listName } = useLocalSearchParams<
    "/list/[id]/edit",
    { listName: string }
  >()
  const listId = +id

  const { data, isPending } = useQuery(listItemsQueryOptions(listId))

  return (
    <ScreenLayout title={listName ?? "Einkaufsliste"} showBack className="pb-0">
      <View className="flex-1 gap-4">

        <ListItemsProvider value={{ listId, listName }}>
          <View className="flex-row items-center justify-between gap-4">
            <CheckedCount />
            <ResetList />
          </View>

          <View className="flex-1 -mx-1">
            <FlatList
              data={data}
              keyExtractor={(list) => String(list.id)}
              renderItem={({ item }) => <RunItem item={item} />}
              ListEmptyComponent={isPending ? (
                <ActivityIndicator size="large" className="text-accent" />
              ) : (
                <EmptyListIndicator message={`${listName} hat noch keine Produkte`} />
              )}
              contentContainerClassName="gap-2 px-1 pb-20"
            />
          </View>
        </ListItemsProvider>

      </View>
    </ScreenLayout>
  );
}
