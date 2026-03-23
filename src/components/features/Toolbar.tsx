import { useEffect, useCallback, memo } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Undo2, Eraser, Plus, Download } from "lucide-react-native";
import { IconButton } from "../ui/IconButton";
import { ColorCircle } from "../ui/ColorCircle";
import { colors, drawingColors, penSizes } from "../../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ToolbarProps {
  selectedColor: string;
  selectedStrokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onSave: () => void;
  isEraser: boolean;
  onToggleEraser: () => void;
  bottomInset?: number;
}

function StrokeSizeButton({
  size,
  selected,
  onPress,
}: {
  size: number;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.15 : 1, {
      damping: 12,
      stiffness: 200,
    });
  }, [selected, scale]);

  const dotSize = size === penSizes.thin ? 6 : size === penSizes.medium ? 12 : 20;

  return (
    <AnimatedPressable
      onPress={handlePress}
      accessibilityLabel={`Penntykkelse ${size}`}
      accessibilityRole="button"
      style={[
        animatedStyle,
        styles.strokeButton,
        {
          backgroundColor: selected ? colors.toolbar : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.strokeDot,
          {
            width: dotSize,
            height: dotSize,
          },
        ]}
      />
    </AnimatedPressable>
  );
}

export const Toolbar = memo(function Toolbar({
  selectedColor,
  selectedStrokeWidth,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onClear,
  onSave,
  isEraser,
  onToggleEraser,
  bottomInset = 0,
}: ToolbarProps) {
  return (
    <View style={[styles.container, { marginBottom: 8 }]}>
      {/* Fargevelger */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorScrollContent}
        style={styles.colorScroll}
      >
        {drawingColors.map((c) => (
          <ColorCircle
            key={c}
            color={c}
            selected={!isEraser && selectedColor === c}
            onPress={() => onColorChange(c)}
            size="sm"
          />
        ))}
      </ScrollView>

      {/* Verktøy-rad */}
      <View style={styles.toolRow}>
        {[penSizes.thin, penSizes.medium, penSizes.thick].map((size) => (
          <StrokeSizeButton
            key={size}
            size={size}
            selected={selectedStrokeWidth === size}
            onPress={() => onStrokeWidthChange(size)}
          />
        ))}

        <View style={styles.separator} />

        <IconButton
          icon={Eraser}
          onPress={onToggleEraser}
          selected={isEraser}
          size="sm"
          accessibilityLabel="Viskelær"
        />
        <IconButton
          icon={Undo2}
          onPress={onUndo}
          size="sm"
          accessibilityLabel="Angre"
        />
        <IconButton
          icon={Plus}
          onPress={onClear}
          size="sm"
          accessibilityLabel="Ny tegning"
        />
        <IconButton
          icon={Download}
          onPress={onSave}
          size="sm"
          backgroundColor={colors.primary}
          iconColor="#FFFFFF"
          accessibilityLabel="Lagre tegning"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 360,
  },
  colorScroll: {
    marginBottom: 10,
  },
  colorScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: "center",
  },
  toolRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  strokeButton: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  strokeDot: {
    borderRadius: 9999,
    backgroundColor: colors.text,
  },
});
