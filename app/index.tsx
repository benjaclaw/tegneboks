import { useCallback, useState, useMemo } from "react";
import { View, FlatList, Pressable, Dimensions, Alert, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Plus, Pencil } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawingCard } from "../src/components/ui/DrawingCard";
import {
  getDrawings,
  deleteDrawing,
  type SavedDrawing,
} from "../src/services/storageService";
import { colors } from "../src/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GRID_GAP = 16;
const GRID_PADDING = 16;

function getCardWidth(): number {
  const { width } = Dimensions.get("window");
  return (width - GRID_PADDING * 2 - GRID_GAP) / 2;
}

function NewDrawingButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityLabel="Ny tegning"
      accessibilityRole="button"
      style={[animatedStyle, styles.newDrawingButton]}
    >
      <View style={styles.gradientBase} />
      <View style={styles.gradientOverlay} />
      <Plus size={36} color="#FFFFFF" strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

export default function HomeScreen() {
  const [drawings, setDrawings] = useState<SavedDrawing[]>([]);
  const insets = useSafeAreaInsets();
  const cardWidth = useMemo(() => getCardWidth(), []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      getDrawings()
        .then((data) => {
          if (!cancelled) setDrawings(data);
        })
        .catch((error) => {
          console.warn("Failed to load drawings:", error);
          if (!cancelled) setDrawings([]);
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteDrawing(id);
      setDrawings((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.warn("Failed to delete drawing:", error);
      Alert.alert("Feil", "Kunne ikke slette tegningen.");
    }
  }, []);

  const handleNewDrawing = useCallback(() => {
    router.push("/draw");
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SavedDrawing }) => (
      <View style={{ width: cardWidth }}>
        <DrawingCard
          imageUri={`data:image/png;base64,${item.imageBase64}`}
          onPress={() => router.push(`/draw?id=${item.id}`)}
          onDelete={() => void handleDelete(item.id)}
        />
      </View>
    ),
    [cardWidth, handleDelete]
  );

  const keyExtractor = useCallback((item: SavedDrawing) => item.id, []);

  const header = useMemo(
    () => <NewDrawingButton onPress={handleNewDrawing} />,
    [handleNewDrawing]
  );

  const emptyComponent = useMemo(
    () => (
      <Animated.View entering={FadeIn.duration(500)} style={styles.emptyState}>
        <Pencil size={64} color={colors.border} strokeWidth={2} />
      </Animated.View>
    ),
    []
  );

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 16 },
      ]}
    >
      <FlatList
        data={drawings}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 16 },
        ]}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={4}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyComponent}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  columnWrapper: {
    gap: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
  },
  listContent: {
    gap: GRID_GAP,
  },
  newDrawingButton: {
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: GRID_PADDING,
    marginBottom: GRID_GAP,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
  gradientBase: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  gradientOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "60%",
    backgroundColor: colors.secondary,
    opacity: 0.6,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
});
