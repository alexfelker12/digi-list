import { HapticTab } from "@/components/haptic-tab";
import { Icon } from "@/components/icon";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";
import { DownloadIcon, HouseIcon, SendIcon } from "lucide-react-native";
import { View } from "react-native";


export default function JsTabLayout() {
  const [accent] = useThemeColor(["accent"])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accent,
        tabBarBackground: () => (
          <View className="bg-background"></View>
        ),
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Einkaufslisten',
          tabBarIcon: ({ color }) => <Icon icon={HouseIcon} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="send"
        options={{
          title: 'Senden',
          tabBarIcon: ({ color }) => <Icon icon={SendIcon} size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: 'Empfangen',
          tabBarIcon: ({ color }) => <Icon icon={DownloadIcon} size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
