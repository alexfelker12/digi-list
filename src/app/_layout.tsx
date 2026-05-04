import '@/global.css';

import { db } from "@/server/db";
import migrations from '@/server/db/migrations/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider } from 'expo-sqlite';

import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";


// TODO - priority LOW: make loading prettier/more visible
function MigrationsGuard({ children }: { children: React.ReactNode }) {
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

          <GestureHandlerRootView className="flex-1">
            <KeyboardProvider>
              <HeroUINativeProvider>

                <Stack screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "transparent" }
                }}>
                  <Stack.Screen name="(tabs)" />
                </Stack>
                <StatusBar style="auto" />

              </HeroUINativeProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>

        </MigrationsGuard>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
