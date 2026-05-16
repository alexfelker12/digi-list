import { Icon } from "@/components/icon";
import {
  TabList as CustomTabList,
  Tabs as CustomTabs,
  TabSlot as CustomTabSlot,
  TabTrigger as CustomTabTrigger,
  TabTriggerSlotProps
} from 'expo-router/ui';
import { Separator, useThemeColor } from 'heroui-native';
import { DownloadIcon, LucideIcon, NotebookTextIcon, TablePropertiesIcon } from "lucide-react-native";
import { Ref, useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";


const ANIMATION_DURATION = 150
export function CustomTabsLayout() {
  const [value, setValue] = useState("1")

  return (
    <CustomTabs>
      <CustomTabSlot />

      {/* Hidden TabList — just defines routes, no UI */}
      <CustomTabList className="hidden">
        <CustomTabTrigger name="home" href="/" />
        <CustomTabTrigger name="products" href="/(tabs)/products" />
        <CustomTabTrigger name="transfer" href="/(tabs)/transfer" />
      </CustomTabList>

      <View
        className="pb-safe border-t border-border bg-white dark:bg-black"
        style={{ elevation: 4 }}
      >
        <View className="flex-row p-2">
          <CustomTabTrigger name="home" asChild>
            <SyncedTabsTrigger
              icon={NotebookTextIcon}
              label="Einkaufslisten"
            />
          </CustomTabTrigger>

          <Separator orientation="vertical" className="bg-muted/25" />

          <CustomTabTrigger name="products" asChild>
            <SyncedTabsTrigger
              icon={TablePropertiesIcon}
              label="Produkte"
            />
          </CustomTabTrigger>

          <Separator orientation="vertical" className="bg-muted/25" />

          <CustomTabTrigger name="transfer" asChild>
            <SyncedTabsTrigger
              icon={DownloadIcon}
              label="Transfer"
            />
          </CustomTabTrigger>
        </View>
      </View>

    </CustomTabs>
  );
}

type SyncedTabsTriggerProps = TabTriggerSlotProps & {
  label: string
  icon: LucideIcon
  ref?: Ref<View>
}
export function SyncedTabsTrigger({
  label,
  icon,
  isFocused,
  ...props
}: SyncedTabsTriggerProps) {
  const [muted, foreground] = useThemeColor(["muted", "foreground"])
  const focusAnimation = useRef(new Animated.Value(isFocused ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false, // color interpolation requires false
    }).start()
  }, [isFocused])

  const textColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [muted, foreground],
  })

  return (
    <Pressable className="flex-1" {...props}>
      <View className="flex-1 flex-col gap-0.5 items-center">

        <Icon icon={icon} className="text-muted" size={24} />
        <Animated.View style={{ opacity: focusAnimation, position: "absolute" }}>
          <Icon icon={icon} className="text-accent" size={24} />
        </Animated.View>

        <Animated.Text className="text-xs" style={{ color: textColor }} numberOfLines={1}>
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}
