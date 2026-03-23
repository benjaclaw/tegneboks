import { useEffect, useCallback, memo } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ColorCircleProps {
  color: string;
  selected: boolean;
  onPress: () => void;
  size?: "sm" | "md";
}

const SIZES = {
  sm: 36,
  md: 48,
} as const;

export const ColorCircle = memo(function ColorCircle({
  color,
  selected,
  onPress,
  size = "md",
}: ColorCircleProps) {
  const dimension = SIZES[size];
  const scale = useSharedValue(selected ? 1.2 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(selected ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
  }, [selected, scale]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(selected ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
  }, [selected, scale]);

  const handlePress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={`Farge ${color}`}
      accessibilityRole="button"
      style={[
        animatedStyle,
        {
          width: dimension,
          height: dimension,
          borderRadius: 9999,
          backgroundColor: color,
          borderWidth: size === "sm" ? 2 : 3,
          borderColor: selected ? "#2C2C2C" : "#FFFFFF",
          shadowColor: selected ? color : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.4 : 0,
          shadowRadius: 6,
          elevation: selected ? 4 : 0,
        },
      ]}
    />
  );
});
