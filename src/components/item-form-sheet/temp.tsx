import { UNITS } from '@/server/db/schema';
import { FieldError, Input, Label, Select, TextField } from "heroui-native";
import {
  View
} from 'react-native';


export function ItemFormSheet({ item }: ItemFormSheetProps) {

  return (
    <TextField isRequired className="gap-1">
      <Label className="text-sm">Menge</Label>

      <View className="flex-row w-full gap-2 flex-1">
        <Input
          placeholder="z.B. 2"
          keyboardType="decimal-pad"
          value={form.quantity}
          onChangeText={v => set('quantity', v)}
        />

        <Select value={form.unit} onValueChange={(unit) => {
          // TODO: implement select
        }}>
          <Select.Trigger>
            <Select.Value placeholder="Einheit" />
            <Select.TriggerIndicator />
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content presentation="popover">
              <Select.ListLabel>Einheit</Select.ListLabel>
              {UNITS.map(u => (
                <Select.Item key={u} value={u} label={u}>
                  <Select.ItemLabel />
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Portal>
        </Select>
      </View>

      <FieldError>Bitte Menge angeben</FieldError>
    </TextField>
  );
}
