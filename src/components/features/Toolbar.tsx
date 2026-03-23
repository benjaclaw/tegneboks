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

  const dotSize = size === penSizes.thin ? 8 : size === penSizes.medium ? 14 : 22;

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
}: ToolbarProps) {
  return (
    <View style={styles.container}>
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
          />
        ))}
      </ScrollView>

      {/* Verktøy-rad */}
      <View style={styles.toolRow}>
        {/* Penntykkelse */}
        {[penSizes.thin, penSizes.medium, penSizes.thick].map((size) => (
          <StrokeSizeButton
            key={size}
            size={size}
            selected={selectedStrokeWidth === size}
            onPress={() => onStrokeWidthChange(size)}
          />
        ))}

        {/* Separator */}
        <View style={styles.separator} />

        <IconButton
          icon={Eraser}
          onPress={onToggleEraser}
          selected={isEraser}
          accessibilityLabel="Viskelær"
        />

        <IconButton
          icon={Undo2}
          onPress={onUndo}
          accessibilityLabel="Angre"
        />

        <IconButton
          icon={Plus}
          onPress={onClear}
          accessibilityLabel="Ny tegning"
        />

        <IconButton
          icon={Download}
          onPress={onSave}
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
    backgroundColor: colors.toolbar,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingBottom: 24,
    paddingTop: 12,
  },
  colorScroll: {
    marginBottom: 12,
  },
  colorScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
  },
  toolRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  separator: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  strokeButton: {
    width: 60,
    height: 60,
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
