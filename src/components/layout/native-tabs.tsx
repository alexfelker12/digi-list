import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';


export default function NativeTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Einkaufslisten</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="receive">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Senden</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="send">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Empfangen</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
