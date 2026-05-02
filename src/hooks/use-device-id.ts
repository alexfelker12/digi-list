import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';


const KEY = 'digi_list_device_id';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('Unbekanntes Gerät');

  useEffect(() => {
    async function init() {
      let id = await SecureStore.getItemAsync(KEY);
      if (!id) {
        id = Crypto.randomUUID();
        await SecureStore.setItemAsync(KEY, id);
      }
      setDeviceId(id);
      setDeviceName(Device.deviceName ?? 'Unbekanntes Gerät');
    }
    init();
  }, []);

  return { deviceId, deviceName };
}
