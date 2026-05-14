import { useAppForm } from "@/lib/form";
import { itemInsertSchema, type ItemFormValues } from '@/server/db/schema';
import { Separator } from "heroui-native/separator";
import { ScrollView, View } from 'react-native';


const defaultValues: ItemFormValues = {
  name: "",
  imageUris: [],
}

export interface ItemFormProps {
  item?: ItemFormValues
  onSubmit: (values: ItemFormValues) => Promise<void>
}
export function ItemForm({ item, onSubmit }: ItemFormProps) {
  const form = useAppForm({
    defaultValues: item ?? defaultValues,
    validators: {
      onSubmit: itemInsertSchema,
      onChange: itemInsertSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset(item ? value : defaultValues)
    },
  })

  return (
    <View className="flex-1 gap-4">
      {/* give this view flex-1 when save button should be at the bottom when scrolling */}
      {/* flex-1 altough forces save button to be at the bottom of the tab. */}
      {/* // TODO (maybe): find a way to let save button "grow" with content and cap at bottom of tab */}
      <View className="-mx-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-4 px-1"
        >
          <form.AppField name="name">
            {(field) => <field.TextField label="Name *" placeholder="z.B. Milch" />}
          </form.AppField>
          <form.AppField name="imageUris">
            {(field) => <field.ImageField />}
          </form.AppField>
        </ScrollView>
      </View>

      <Separator />

      <form.AppForm>
        <form.SubmitButton label={item ? 'Änderungen speichern' : 'Produkt anlegen'} />
      </form.AppForm>
    </View>
  );
}
