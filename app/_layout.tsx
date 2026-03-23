import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeIn } from "react-native-reanimated";
import { Pencil } from "lucide-react-native";
import { colors } from "../src/theme";

// Hold splash synlig til vi er klare
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignorer feil — noen miljøer støtter ikke dette
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  useEffect(() => {
    // Skjul splash når fonter er lastet eller feilet
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignorer feil
      });
    }
  }, [fontsLoaded, fontError]);

  // Vis appen selv om fonter feiler — bruk systemfont som fallback
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Pencil size={48} color={colors.primary} strokeWidth={2.5} />
        </Animated.View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
