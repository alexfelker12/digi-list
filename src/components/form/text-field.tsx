import { useFieldContext } from "@/lib/form/form-context";
import { FieldError, Input, Label, TextField } from "heroui-native";


interface TextFieldProps {
  label: string;
  placeholder?: string;
  multiline?: boolean;
}
export function TextFieldComponent({ label, placeholder, multiline }: TextFieldProps) {
  const field = useFieldContext<string>();

  // create invalid state and error message
  const meta = field.state.meta
  const isInvalid = !meta.isValid && meta.isTouched
  const errorMessage = meta.errors[0]?.message.toString()

  return (
    <TextField isInvalid={isInvalid} className="gap-0.5">
      <Label className="text-sm text-muted">{label}</Label>

      <Input
        className="text-base py-2.5 dark:border dark:border-border dark:focus:border-accent"
        placeholder={placeholder}
        value={field.state.value ?? ''}
        onChangeText={field.handleChange}
        onBlur={field.handleBlur}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />

      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
