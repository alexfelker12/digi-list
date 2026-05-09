import '@/global.css';

import { cleanupOrphanedImagesIfNeeded } from "@/lib/utils";
import { db } from "@/server/db";
import migrations from '@/server/db/migrations/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from "react";

import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ErrorScreen } from "@/components/error-screen";
import { LoadingScreen } from "@/components/loading-screen";


function MigrationsGuard({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations)

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(cleanupOrphanedImagesIfNeeded, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

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
                  <Stack.Screen name="list/[id]/run" />
                  <Stack.Screen name="list/[id]/edit" options={{ title: "Bearbeiten" }} />
                  <Stack.Screen name="list/[id]/edit/[itemId]" options={{ title: "Produkt bearbeiten" }} />
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
