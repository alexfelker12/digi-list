import {
  TabList as CustomTabList,
  Tabs as CustomTabs,
  TabSlot as CustomTabSlot,
  TabTrigger as CustomTabTrigger,
  TabTriggerSlotProps
} from 'expo-router/ui';
import { useThemeColor } from 'heroui-native';
import { Tabs } from "heroui-native/tabs";
import { DownloadIcon, LucideIcon, NotebookTextIcon, TablePropertiesIcon } from "lucide-react-native";
import { Ref, useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { Icon } from "../icon";


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

      {/* Visual tab bar using HeroUI, with TabTriggers outside TabList */}
      <Tabs
        className="absolute bottom-0 left-0 right-0 p-2 pb-safe bg-linear-to-t from-background via-background/50 to-background/0"
        value={value}
        onValueChange={setValue}
      >
        <View className="pb-2">
          <Tabs.List>
            <Tabs.Indicator
              animation={{
                translateX: { type: "timing", config: { duration: ANIMATION_DURATION } },
              }}
            />

            <CustomTabTrigger name="home" asChild>
              <SyncedTabsTrigger
                icon={NotebookTextIcon}
                label="Einkaufslisten"
                value="1"
                onFocusChange={setValue}
              />
            </CustomTabTrigger>

            <Tabs.Separator
              betweenValues={['1', '2']}
              animation={{
                opacity: { timingConfig: { duration: ANIMATION_DURATION } }
              }}
            />

            <CustomTabTrigger name="products" asChild>
              <SyncedTabsTrigger
                icon={TablePropertiesIcon}
                label="Produkte"
                value="2"
                onFocusChange={setValue}
              />
            </CustomTabTrigger>

            <Tabs.Separator
              betweenValues={['2', '3']}
              animation={{
                opacity: { timingConfig: { duration: ANIMATION_DURATION } }
              }}
            />

            <CustomTabTrigger name="transfer" asChild>
              <SyncedTabsTrigger
                icon={DownloadIcon}
                label="Transfer"
                value="3"
                onFocusChange={setValue}
              />
            </CustomTabTrigger>

          </Tabs.List>
        </View>
      </Tabs>

    </CustomTabs>
  );
}

type SyncedTabsTriggerProps = TabTriggerSlotProps & {
  value: string
  label: string
  icon: LucideIcon
  onFocusChange: (value: string) => void
  ref?: Ref<View>
};
export function SyncedTabsTrigger({
  label,
  value,
  icon,
  isFocused,
  onFocusChange,
  ...props
}: SyncedTabsTriggerProps) {
  const [muted, foreground] = useThemeColor(["muted", "foreground"]);
  const focusAnimation = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    if (isFocused) onFocusChange(value);
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false, // color interpolation requires false
    }).start();
  }, [isFocused]);

  const textColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [muted, foreground],
  });

  return (
    <Tabs.Trigger className="flex-1" value={value} {...props}>
      <View className="flex-1 flex-col gap-0.5 items-center">
        <Icon icon={icon} className="text-muted" size={24} />
        <Animated.View style={{ opacity: focusAnimation, position: "absolute" }}>
          <Icon icon={icon} className="text-accent" size={24} />
        </Animated.View>
        <Animated.Text className="text-sm" style={{ color: textColor }} numberOfLines={1}>
          {label}
        </Animated.Text>
      </View>
    </Tabs.Trigger>
  );
}
