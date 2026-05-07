import { fieldContext, formContext } from "@/lib/form";
import { ItemFormInput, itemInsertSchema, type ItemFormValues } from '@/server/db/schema';
import { createFormHook } from "@tanstack/react-form";
import { Button } from 'heroui-native/button';
import { Separator } from "heroui-native/separator";
import { ScrollView, View } from 'react-native';

import { ImageFieldComponent } from "../form/image-field";
import { NumberFieldComponent } from "../form/number-field";
import { TextFieldComponent } from "../form/text-field";
import { UnitFieldComponent } from "../form/unit-field";


const defaultValues: ItemFormInput = {
  name: "",
  quantity: null,
  unit: null,
  notes: null,
  imageUris: [],
};

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField: TextFieldComponent,
    NumberField: NumberFieldComponent,
    UnitField: UnitFieldComponent,
    ImageField: ImageFieldComponent,
  },
  formComponents: {},
  fieldContext,
  formContext,
});

export interface ItemFormProps {
  item?: ItemFormValues;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}
export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const form = useAppForm({
    defaultValues: item ?? defaultValues,
    validators: {
      onSubmit: itemInsertSchema,
      onChange: itemInsertSchema,
    },
    onSubmit: async ({ value }) => {
      //* zod validation ensures quantity and unit are valid (not null)
      await onSubmit(value as ItemFormValues);
      form.reset(item ? value : defaultValues)
    },
  });

  return (
    <View className="gap-4">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-1 flex-col gap-4 p-0.5 pb-0.75"
      >
        <form.AppField name="name">
          {(field) => <field.TextField label="Name *" placeholder="z.B. Milch" />}
        </form.AppField>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <form.AppField name="quantity">
              {(field) => <field.NumberField label="Menge" placeholder="z.B. 2" />}
            </form.AppField>
          </View>
          <View className="flex-1">
            <form.AppField name="unit">
              {(field) => <field.UnitField label="Einheit" />}
            </form.AppField>
          </View>
        </View>

        <form.AppField name="imageUris">
          {(field) => <field.ImageField />}
        </form.AppField>

        <form.AppField name="notes">
          {(field) => (
            <field.TextField label="Notizen" placeholder="Optional" multiline />
          )}
        </form.AppField>
      </ScrollView>

      <Separator />

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            onPress={form.handleSubmit}
            isDisabled={!canSubmit || isSubmitting}
          >
            <Button.Label>
              {item ? 'Änderungen speichern' : 'Produkt anlegen'}
            </Button.Label>
          </Button>
        )}
      </form.Subscribe>
    </View>
  );
}