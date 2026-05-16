import { ItemForm } from "@/components/items/item-form";
import { ProductsListing } from "@/components/items/product-listing";
import { ScreenLayout } from "@/components/screen-layout";
import { useSelectItem } from "@/hooks/use-select-item";
import { parseItem, queryKeys } from "@/lib/queries/_helper";
import { allItemsQueryOptions, createItemMutationOptions } from "@/lib/queries/item-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "heroui-native";
import { useState } from "react";
import { HandleSelectProvider, useHandleSelect } from "./context/handle-select-context";


export default function AddListItemScreen() {
  const [activeTab, setActiveTab] = useState("existing")
  const handleSelect = useSelectItem()

  return (
    <ScreenLayout title="Produkt hinzufügen" showBack>

      <HandleSelectProvider value={{ handleSelect }}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 pb-2"
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
      </HandleSelectProvider>

    </ScreenLayout>
  );
}


function ListItemExistingContent() {
  const { data, isPending } = useQuery(allItemsQueryOptions())
  const { handleSelect } = useHandleSelect()

  return (
    <ProductsListing
      data={data}
      isPending={isPending}
      onPress={(item) => handleSelect(item)}
    />
  );
}

function ListItemNewContent() {
  const qc = useQueryClient()
  const { mutateAsync } = useMutation({
    ...createItemMutationOptions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.items() })
  })
  const { handleSelect } = useHandleSelect()

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
