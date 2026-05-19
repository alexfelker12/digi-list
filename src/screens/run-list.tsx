import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { CheckedCount } from "@/components/run-list/checked-count";
import { ResetList } from "@/components/run-list/reset-list";
import { RunItem } from "@/components/run-list/run-item";
import { ScreenLayout } from "@/components/screen-layout";
import { listItemsQueryOptions } from "@/lib/queries/list-item-queries";
import { getPurchaseAmount } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Separator } from "heroui-native";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ListItemsProvider } from "./context/list-items-context";
import { RunListItemProvider } from "./context/run-list-item-context";


export default function RunListScreen() {
  const { id, listName } = useLocalSearchParams<
    "/list/[id]/edit",
    { listName: string }
  >()
  const listId = +id

  const { data, isPending } = useQuery({
    ...listItemsQueryOptions(listId),
    refetchOnMount: true
  })

  //* count checked items
  const checkedItemsCount = data?.filter(({ checked }) => checked).length ?? 0
  const totalItemsCount = data?.length ?? 0
  return (
    <ScreenLayout title={listName ?? "Einkaufsliste"} showBack>
      <ListItemsProvider
        value={{ listId, listName, checkedItemsCount, totalItemsCount, isPending }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <CheckedCount />
          <ResetList />
        </View>

        <Separator />

        <View className="flex-1 -mx-1">
          <FlatList
            data={data}
            keyExtractor={(list) => String(list.id)}
            renderItem={({ item: listItem }) => {
              const { quantity, unit } = listItem
              const purchaseAmount = getPurchaseAmount({ quantity, unit })
              return (
                <RunListItemProvider value={{ listItem, purchaseAmount }}>
                  <RunItem />
                </RunListItemProvider>
              )
            }}
            ListEmptyComponent={isPending ? (
              <ActivityIndicator size="large" className="text-accent" />
            ) : (
              <EmptyListIndicator message={`${listName} hat noch keine Produkte`} />
            )}
            contentContainerClassName="gap-2 px-1 pb-2"
          />
        </View>
      </ListItemsProvider>
    </ScreenLayout>
  );
}
