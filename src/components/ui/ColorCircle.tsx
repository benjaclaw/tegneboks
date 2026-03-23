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
}

export const ColorCircle = memo(function ColorCircle({
  color,
  selected,
  onPress,
}: ColorCircleProps) {
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
        styles.circle,
        {
          backgroundColor: color,
          borderColor: selected ? "#2C2C2C" : "#FFFFFF",
          shadowColor: selected ? color : "transparent",
          shadowOpacity: selected ? 0.4 : 0,
          elevation: selected ? 4 : 0,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  circle: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});
