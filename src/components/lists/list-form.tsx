import { fieldContext, formContext } from "@/lib/form";
import { ListFormInput, listInsertSchema, type ListFormValues } from '@/server/db/schema';
import { createFormHook } from "@tanstack/react-form";
import { Button } from 'heroui-native/button';
import { Separator } from "heroui-native/separator";
import { View } from 'react-native';
import { TextFieldComponent } from "../form/text-field";


const defaultValues: ListFormInput = { name: "Einkauf" };

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField: TextFieldComponent,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export interface ListFormProps {
  list?: ListFormValues;
  onSubmit: (values: ListFormValues) => Promise<void>;
}
export function ListForm({ list, onSubmit }: ListFormProps) {
  const form = useAppForm({
    defaultValues: list ?? defaultValues,
    validators: {
      onSubmit: listInsertSchema,
      onChange: listInsertSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      form.reset(list ? value : defaultValues)
    },
  });

  return (
    <View className="h-fit gap-4">
      <View className="h-20">
        <form.AppField name="name">
          {(field) => <field.TextField label="Name *" placeholder="Wocheneinkauf" />}
        </form.AppField>
      </View>

      <Separator />

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            onPress={form.handleSubmit}
            isDisabled={!canSubmit || isSubmitting}
          >
            <Button.Label>
              {list ? 'Änderungen speichern' : 'Liste erstellen'}
            </Button.Label>
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}
