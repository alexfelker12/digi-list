import { HapticTab } from "@/components/haptic-tab";
import { Icon } from "@/components/icon";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { DownloadIcon, NotebookTextIcon, TablePropertiesIcon } from "lucide-react-native";
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
          tabBarIcon: ({ color }) => <Icon icon={NotebookTextIcon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produkte',
          tabBarIcon: ({ color }) => <Icon icon={TablePropertiesIcon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Transfer',
          tabBarIcon: ({ color }) => <Icon icon={DownloadIcon} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
