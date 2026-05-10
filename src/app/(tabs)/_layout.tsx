import { Ionicons } from "@expo/vector-icons";
import { Ref, useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";

import {
  TabList as CustomTabList,
  Tabs as CustomTabs,
  TabSlot as CustomTabSlot,
  TabTrigger as CustomTabTrigger,
  TabTriggerSlotProps
} from 'expo-router/ui';
import { useThemeColor } from 'heroui-native';
import { Tabs } from "heroui-native/tabs";


const ANIMATION_DURATION = 150
export default function TabLayout() {
  const [value, setValue] = useState("1")

  return (
    <CustomTabs>
      <CustomTabSlot />

      {/* Hidden TabList — just defines routes, no UI */}
      <CustomTabList className="hidden">
        <CustomTabTrigger name="home" href="/" />
        <CustomTabTrigger name="send" href="/(tabs)/send" />
        <CustomTabTrigger name="receive" href="/(tabs)/receive" />
      </CustomTabList>

      {/* Visual tab bar using HeroUI, with TabTriggers outside TabList */}
      <Tabs
        className="absolute bottom-0 left-0 right-0 p-2 pb-safe bg-linear-to-t from-background via-background/50 to-background/0"
        value={value}
        onValueChange={setValue}
      >
        <Tabs.List>
          <Tabs.Indicator
            animation={{
              translateX: { type: "timing", config: { duration: ANIMATION_DURATION } },
            }}
          />

          <CustomTabTrigger name="home" asChild>
            <SyncedTabsTrigger
              icon="home"
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

          <CustomTabTrigger name="send" asChild>
            <SyncedTabsTrigger
              icon="paper-plane"
              label="Senden"
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

          <CustomTabTrigger name="receive" asChild>
            <SyncedTabsTrigger
              icon="download-outline"
              label="Empfangen"
              value="3"
              onFocusChange={setValue}
            />
          </CustomTabTrigger>

        </Tabs.List>
      </Tabs>

    </CustomTabs>
  );
}

type SyncedTabsTriggerProps = TabTriggerSlotProps & {
  value: string
  onFocusChange: (value: string) => void
  label: string
  icon: React.ComponentProps<typeof Ionicons>["name"]
  ref?: Ref<View>
};
export function SyncedTabsTrigger({
  icon,
  label,
  isFocused,
  value,
  onFocusChange,
  ...props
}: SyncedTabsTriggerProps) {
  const [accent, muted, foreground] = useThemeColor(["accent", "muted", "foreground"]);
  const focusAnimation = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    if (isFocused) onFocusChange(value);
    Animated.timing(focusAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false, // color interpolation requires false
    }).start();
  }, [isFocused]);

  const iconColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [muted, accent],
  });

  const textColor = focusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [muted, foreground],
  });

  return (
    <Tabs.Trigger className="flex-1" value={value} {...props}>
      <View className="flex-1 flex-col gap-0.5 items-center">
        <Animated.Text style={{ color: iconColor }}>
          <Ionicons name={icon} size={24} />
        </Animated.Text>
        <Animated.Text className="text-sm" style={{ color: textColor }} numberOfLines={1}>
          {label}
        </Animated.Text>
      </View>
    </Tabs.Trigger>
  );
}
