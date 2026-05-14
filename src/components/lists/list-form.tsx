import { useAppForm } from "@/lib/form";
import { listInsertSchema, type ListFormValues } from '@/server/db/schema';
import { SQLiteRunResult } from "expo-sqlite";
import { Separator } from "heroui-native/separator";
import { View } from 'react-native';


const defaultValues: ListFormValues = { name: "Einkauf" };

export interface ListFormProps {
  list?: ListFormValues;
  onSubmit: (values: ListFormValues) => Promise<SQLiteRunResult | void>;
}
export function ListForm({ list, onSubmit }: ListFormProps) {
  const form = useAppForm({
    defaultValues: list ?? defaultValues,
    validators: {
      onSubmit: listInsertSchema,
      onChange: listInsertSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
      form.reset(list ? value : defaultValues)
    },
  });

  return (
    <View className="gap-4">
      <form.AppField name="name">
        {(field) => <field.TextField label="Name *" placeholder="Wocheneinkauf" />}
      </form.AppField>

      <Separator />

      <form.AppForm>
        <form.SubmitButton label={list ? 'Speichern' : 'Liste erstellen'} />
      </form.AppForm>
    </View>
  );
}
