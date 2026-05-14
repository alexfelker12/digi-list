import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { ItemForm } from "@/components/items/item-form";
import { SelectableItem } from "@/components/items/selectable-item";
import { ScreenLayout } from "@/components/screen-layout";
import { useSelectItem } from "@/hooks/use-select-item";
import { parseItem, queryKeys } from "@/lib/queries/_helper";
import { allItemsQueryOptions, createItemMutationOptions } from "@/lib/queries/item-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "heroui-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { ItemSelectProvider, useItemSelect } from "./context/select-item-context";


export default function AddListItemScreen() {
  const [activeTab, setActiveTab] = useState("existing")
  const handleSelect = useSelectItem()

  return (
    <ScreenLayout title="Produkt hinzufügen" showBack>

      <ItemSelectProvider value={{ handleSelect }}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1"
        >
          <Tabs.List>
            <Tabs.Indicator />
            <Tabs.Trigger value="existing" className="flex-1">
              <Tabs.Label>Alle Produkte</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="new" className="flex-1">
              <Tabs.Label>Neues Produkt</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="existing" className="flex-1">
            <ListItemExistingContent />
          </Tabs.Content>
          <Tabs.Content value="new" className="flex-1">
            <ListItemNewContent />
          </Tabs.Content>
        </Tabs>
      </ItemSelectProvider>

    </ScreenLayout>
  );
}


function ListItemExistingContent() {
  const { data, isPending } = useQuery(allItemsQueryOptions())

  return (
    <View className="flex-1 -mx-1">
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SelectableItem item={item} />
        )}
        ListEmptyComponent={isPending ? (
          <ActivityIndicator size="large" className="text-accent" />
        ) : (
          <EmptyListIndicator message="Noch keine Produkte erstellt" />
        )}
        contentContainerClassName="gap-2 px-1 pb-20"
      />
    </View>
  );
}

function ListItemNewContent() {
  const qc = useQueryClient()
  const { mutateAsync } = useMutation({
    ...createItemMutationOptions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items() })
  })
  const { handleSelect } = useItemSelect()

  return (
    <ItemForm
      onSubmit={async (values) => {
        await mutateAsync(values, {
          onSuccess: (newItem) => handleSelect(parseItem(newItem))
        })
      }}
    />
  );
}
