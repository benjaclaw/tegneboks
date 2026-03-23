import { useCallback, useState } from "react";
import { Alert, Image, Pressable, View, StyleSheet } from "react-native";
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
  const [imageError, setImageError] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handleLongPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
  }, [rotation, onDelete]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={500}
      accessibilityLabel="Lagret tegning"
      accessibilityRole="button"
      style={[animatedStyle, styles.card]}
    >
      {imageError ? (
        <View style={styles.errorPlaceholder} />
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  image: {
    width: "100%",
    height: "100%",
  },
  errorPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background,
  },
});
