import { Text } from '@/components/text';
import { useFieldContext } from '@/lib/form';
import { TextInput, View } from 'react-native';


interface TextFieldProps {
  label: string;
  placeholder?: string;
  multiline?: boolean;
}
export function TextFieldComponent({ label, placeholder, multiline }: TextFieldProps) {
  const field = useFieldContext<string>();

  return (
    <View className="mb-3">
      <Text className="text-sm text-muted mb-1">{label}</Text>
      <TextInput
        className="bg-muted/20 text-foreground border border-border rounded-lg px-3 py-2"
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={field.state.value ?? ''}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {field.state.meta.errors.length > 0 && (
        <Text className="text-danger text-xs mt-1">
          {field.state.meta.errors[0]?.toString()}
        </Text>
      )}
    </View>
  );
}
