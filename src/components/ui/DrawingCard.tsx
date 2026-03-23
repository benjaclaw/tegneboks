import { Alert, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "../../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DrawingCardProps {
  imageUri: string;
  onPress: () => void;
  onDelete: () => void;
}

export function DrawingCard({
  imageUri,
  onPress,
  onDelete,
}: DrawingCardProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleLongPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Shake-animasjon
    rotation.value = withSequence(
      withTiming(2, { duration: 80 }),
      withTiming(-2, { duration: 80 }),
      withTiming(2, { duration: 80 }),
      withTiming(-2, { duration: 80 }),
      withTiming(0, { duration: 80 })
    );

    Alert.alert("", "Slette denne tegningen?", [
      { text: "Nei", style: "cancel" },
      {
        text: "Ja",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={500}
      accessibilityLabel="Lagret tegning"
      accessibilityRole="button"
      style={[
        animatedStyle,
        {
          aspectRatio: 1,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
          overflow: "hidden",
        },
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </AnimatedPressable>
  );
}
