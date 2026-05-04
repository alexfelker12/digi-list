import { Text } from '@/components/text';
import { useFieldContext } from '@/lib/form';
import { TextInput, View } from 'react-native';


interface NumberFieldProps {
  label: string;
  placeholder?: string;
}
export function NumberFieldComponent({ label, placeholder }: NumberFieldProps) {
  const field = useFieldContext<number | null>();

  return (
    <View className="mb-3">
      <Text className="text-sm text-muted mb-1">{label}</Text>
      <TextInput
        className="bg-muted/20 text-foreground border border-border rounded-lg px-3 py-2"
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
        value={field.state.value?.toString() ?? ''}
        onChangeText={(v) => {
          const parsed = parseFloat(v);
          field.handleChange(isNaN(parsed) ? null : parsed);
        }}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors.length > 0 && (
        <Text className="text-danger text-xs mt-1">
          {field.state.meta.errors[0]?.toString()}
        </Text>
      )}
    </View>
  );
}
