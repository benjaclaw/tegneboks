import { useEffect, useCallback, memo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Undo2, Eraser, Plus, Download } from "lucide-react-native";
import { IconButton } from "../ui/IconButton";
import { ColorCircle } from "../ui/ColorCircle";
import { colors, colorGroups, penSizes } from "../../theme";

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

function ColorGroupTabs({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScrollContent}
      style={styles.tabScroll}
    >
      {colorGroups.map((group, index) => (
        <Pressable
          key={group.label}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(index);
          }}
          style={[
            styles.tab,
            activeIndex === index && styles.tabActive,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeIndex === index }}
        >
          <Text
            style={[
              styles.tabText,
              activeIndex === index && styles.tabTextActive,
            ]}
          >
            {group.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const activeGroup = colorGroups[activeGroupIndex];

  const colorCircles = activeGroup.colors.map((c) => (
    <ColorCircle
      key={c}
      color={c}
      selected={!isEraser && selectedColor === c}
      onPress={() => onColorChange(c)}
      size="sm"
    />
  ));

  const allColors = colorGroups.flatMap((g) => [...g.colors]);

  // Auto-switch to the group containing the selected color
  const handleColorChange = useCallback(
    (color: string) => {
      onColorChange(color);
    },
    [onColorChange],
  );

  const tools = (
    <>
      {[penSizes.thin, penSizes.medium, penSizes.thick].map((size) => (
        <StrokeSizeButton
          key={size}
          size={size}
          selected={selectedStrokeWidth === size}
          onPress={() => onStrokeWidthChange(size)}
        />
      ))}

      <View style={isLandscape ? styles.separatorLandscape : styles.separator} />

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
    </>
  );

  if (isLandscape) {
    return (
      <View style={[styles.container, styles.landscapeContainer, { marginBottom: 8 }]}>
        <View style={styles.landscapeRow}>
          {allColors.map((c) => (
            <ColorCircle
              key={c}
              color={c}
              selected={!isEraser && selectedColor === c}
              onPress={() => handleColorChange(c)}
              size="sm"
            />
          ))}
          <View style={styles.separatorLandscape} />
          {tools}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { marginBottom: 8 }]}>
      {/* Farge-gruppe tabs */}
      <ColorGroupTabs
        activeIndex={activeGroupIndex}
        onSelect={setActiveGroupIndex}
      />

      {/* Fargevelger */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorScrollContent}
        style={styles.colorScroll}
      >
        {colorCircles}
      </ScrollView>

      {/* Verktøy-rad */}
      <View style={styles.toolRow}>
        {tools}
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
  landscapeContainer: {
    maxWidth: 620,
    paddingHorizontal: 12,
  },
  landscapeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  separatorLandscape: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  tabScroll: {
    marginBottom: 6,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  tabTextActive: {
    color: "#FFFFFF",
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
