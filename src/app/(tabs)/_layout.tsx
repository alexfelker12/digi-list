import { Stack } from "expo-router";
import { SQLiteProvider } from 'expo-sqlite';
import { Text } from "react-native";

import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { db } from "@/server/db";
import migrations from '@/server/db/migrations/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import '@/global.css'; // TODO: check if is importet correctly, else use ../../global.css


function MigrationsGuard({ children }: { children: React.ReactNode }) {
  // useMigrations braucht die expo db-Instanz direkt
  const { success, error } = useMigrations(db, migrations);
  if (!success && !error) return <Text>Wird geladen…</Text>;
  if (error) return <Text>DB Fehler: {error.message}</Text>;
  return <>{children}</>;
}

const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName="digi-list.db">
        <MigrationsGuard>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HeroUINativeProvider>
              <Stack />
            </HeroUINativeProvider>
          </GestureHandlerRootView>
        </MigrationsGuard>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
