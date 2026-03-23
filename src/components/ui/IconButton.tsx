import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "../../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  selected?: boolean;
  size?: "md" | "lg";
  iconColor?: string;
  backgroundColor?: string;
  accessibilityLabel: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  selected = false,
  size = "md",
  iconColor,
  backgroundColor,
  accessibilityLabel,
}: IconButtonProps) {
  const scale = useSharedValue(1);

  const dimensions = size === "lg" ? 72 : 60;
  const iconSize = size === "lg" ? 36 : 28;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const bg = backgroundColor ?? (selected ? colors.primary : colors.surface);
  const ic = iconColor ?? (selected ? "#FFFFFF" : colors.text);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        animatedStyle,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: 9999,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      <Icon size={iconSize} color={ic} strokeWidth={2.5} />
    </AnimatedPressable>
  );
}
