import '@/global.css';

import { useEffect } from "react";

import { cleanupOrphanedImagesIfNeeded } from "@/lib/utils";
import { db } from "@/server/db";
import migrations from '@/server/db/migrations/migrations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { SQLiteProvider } from 'expo-sqlite';

import { HeroUINativeProvider } from 'heroui-native/provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { JsStack, jsStackScreenOptions } from "@/lib/navigation/js-stack";
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
  useDrizzleStudio(db.$client)

  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName="digi-list.db">

        <GestureHandlerRootView className="flex-1">
          <KeyboardProvider>
            <HeroUINativeProvider>

              <MigrationsGuard>
                <StatusBar style="auto" />

                <JsStack screenOptions={jsStackScreenOptions}>
                  <JsStack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <JsStack.Screen name="list/[id]/run" />
                  <JsStack.Screen name="list/[id]/edit/index" options={{ title: "Bearbeiten" }} />
                  <JsStack.Screen name="list/[id]/edit/add-item" options={{ title: "Produkt hinzufügen" }} />
                  <JsStack.Screen name="list/[id]/edit/item/[itemId]" options={{ title: "Produkt bearbeiten" }} />
                </JsStack>

              </MigrationsGuard>

            </HeroUINativeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>

      </SQLiteProvider>
    </QueryClientProvider>
  );
}
