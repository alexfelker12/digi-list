import { Text } from '@/components/text';
import { useFieldContext } from '@/lib/form';
import { UNITS, type Unit } from '@/server/db/schema';
import { Pressable, View } from 'react-native';


export function UnitFieldComponent() {
  const field = useFieldContext<Unit | null>();

  return (
    <View className="mb-3">
      <Text className="text-sm text-muted mb-1">Einheit</Text>
      <View className="flex-row flex-wrap gap-2">
        {UNITS.map((u) => {
          const active = field.state.value === u;
          return (
            <Pressable
              key={u}
              onPress={() => field.handleChange(active ? null : u)}
              className={`px-3 py-1 rounded-full border ${active ? 'bg-accent border-accent' : 'bg-muted/20 border-border'
                }`}
            >
              <Text className={`text-sm ${active ? 'text-accent-foreground' : 'text-foreground'}`}>
                {u}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
