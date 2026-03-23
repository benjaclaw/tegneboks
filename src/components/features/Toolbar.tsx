import { View, ScrollView, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Undo2,
  Eraser,
  Pencil,
  Plus,
  Download,
  Circle,
} from "lucide-react-native";
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

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  scale.value = withSpring(selected ? 1.15 : 1, {
    damping: 12,
    stiffness: 200,
  });

  // Visuell størrelse: tynn=8, medium=14, tykk=22
  const dotSize = size === penSizes.thin ? 8 : size === penSizes.medium ? 14 : 22;

  return (
    <AnimatedPressable
      onPress={handlePress}
      accessibilityLabel={`Penntykkelse ${size}`}
      accessibilityRole="button"
      style={[
        animatedStyle,
        {
          width: 60,
          height: 60,
          borderRadius: 9999,
          backgroundColor: selected ? colors.toolbar : colors.surface,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 9999,
          backgroundColor: colors.text,
        }}
      />
    </AnimatedPressable>
  );
}

export function Toolbar({
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
    <View
      style={{
        backgroundColor: colors.toolbar,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        paddingBottom: 24,
        paddingTop: 12,
      }}
    >
      {/* Fargevelger */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 10,
          alignItems: "center",
        }}
        style={{ marginBottom: 12 }}
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
        }}
      >
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
        <View
          style={{
            width: 2,
            height: 40,
            backgroundColor: colors.border,
            marginHorizontal: 4,
          }}
        />

        {/* Viskelær */}
        <IconButton
          icon={Eraser}
          onPress={onToggleEraser}
          selected={isEraser}
          accessibilityLabel="Viskelær"
        />

        {/* Angre */}
        <IconButton
          icon={Undo2}
          onPress={onUndo}
          accessibilityLabel="Angre"
        />

        {/* Ny tegning */}
        <IconButton
          icon={Plus}
          onPress={onClear}
          accessibilityLabel="Ny tegning"
        />

        {/* Lagre */}
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
}
