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

import { ErrorScreen } from "@/components/error-screen";
import { LoadingScreen } from "@/components/loading-screen";
// import { useEffect, useState } from "react";


function MigrationsGuard({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations)

  // // — Mock: delay & error —
  // const [mockReady, setMockReady] = useState(false);
  // const mockError = false; // auf true setzen um ErrorScreen zu testen

  // useEffect(() => {
  //   const timer = setTimeout(() => setMockReady(true), 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  // if (mockError) return <ErrorScreen message="Mock: Datenbank konnte nicht migriert werden." />;
  // if (!mockReady) return <LoadingScreen />;
  // // — Ende Mock —

  if (!success && !error) return <LoadingScreen />
  if (error) return <ErrorScreen message={error.message} />

  return <>{children}</>
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
