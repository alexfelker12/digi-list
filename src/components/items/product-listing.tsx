import { EmptyListIndicator } from "@/components/empty-list-indicator";
import { ParsedItem } from "@/lib/queries/_helper";
import { ItemWithUriArray } from "@/server/db";
import { cn } from "heroui-native";
import { ActivityIndicator, FlatList, GestureResponderEvent, View } from "react-native";
import { ProductItem } from "./product-item";


type ProductsListingProps = {
  data: ParsedItem[] | undefined
  isPending?: boolean
  className?: string
  onPress?: (item: ItemWithUriArray, event: GestureResponderEvent) => void
}
export function ProductsListing({ data, isPending, className, onPress }: ProductsListingProps) {
  return (
    <View className="flex-1 -mx-1">
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductItem item={item} onPress={onPress} />
        )}
        ListEmptyComponent={isPending ? (
          <ActivityIndicator size="large" className="text-accent" />
        ) : (
          <EmptyListIndicator message="Noch keine Produkte erstellt" />
        )}
        contentContainerClassName={cn("gap-2 px-1 pb-1", className)}
      />
    </View>
  );
}
