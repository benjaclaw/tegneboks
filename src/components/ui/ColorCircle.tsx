import { Pressable } from "react-native";
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

export function ColorCircle({ color, selected, onPress }: ColorCircleProps) {
  const scale = useSharedValue(selected ? 1.2 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(selected ? 1.2 : 1, {
      damping: 12,
      stiffness: 200,
    });
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Oppdater scale når selected endres
  scale.value = withSpring(selected ? 1.2 : 1, {
    damping: 12,
    stiffness: 200,
  });

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
          width: 48,
          height: 48,
          borderRadius: 9999,
          backgroundColor: color,
          borderWidth: 3,
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
}
