import '@/global.css';

import { cleanupOrphanedImagesIfNeeded } from "@/lib/utils";
import { db } from "@/server/db";
import migrations from '@/server/db/migrations/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from "react";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";

import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ErrorScreen } from "@/components/error-screen";
import { LoadingScreen } from "@/components/loading-screen";


function MigrationsGuard({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations)

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(cleanupOrphanedImagesIfNeeded, 2000)
      return () => clearTimeout(timeout)
    }
  }, [success]);

  if (!success && !error) return <LoadingScreen />
  if (error) return <ErrorScreen message={error.message} />

  return <>{children}</>
}

const queryClient = new QueryClient();
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName="digi-list.db">
        <MigrationsGuard>

          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <GestureHandlerRootView className="flex-1">
              {/* <KeyboardProvider> */}
              <HeroUINativeProvider>

                <StatusBar style="auto" />
                <Stack screenOptions={{
                  headerShown: false,
                  animation: "ios_from_right",
                  gestureEnabled: true
                }}>
                  <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
                  <Stack.Screen name="list/[id]/run" />
                  <Stack.Screen name="list/[id]/edit/index" options={{ title: "Bearbeiten" }} />
                  <Stack.Screen name="list/[id]/edit/add-item" options={{ title: "Produkt hinzufügen" }} />
                  <Stack.Screen name="list/[id]/edit/item/[itemId]" options={{ title: "Produkt bearbeiten" }} />
                </Stack>

              </HeroUINativeProvider>
              {/* </KeyboardProvider> */}
            </GestureHandlerRootView>
          </ThemeProvider>

        </MigrationsGuard>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
