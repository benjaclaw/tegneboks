import { useCallback, useState } from "react";
import { Alert, Image, Pressable, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Trash2 } from "lucide-react-native";
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
  const [imageError, setImageError] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handleDelete = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Slett tegning", "Er du sikker på at du vil slette denne tegningen?", [
      { text: "Avbryt", style: "cancel" },
      { text: "Slett", style: "destructive", onPress: onDelete },
    ]);
  }, [onDelete]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
      {/* Slett-knapp i hjørnet */}
      <Pressable
        onPress={handleDelete}
        style={styles.deleteButton}
        accessibilityLabel="Slett tegning"
        accessibilityRole="button"
        hitSlop={8}
      >
        <Trash2 size={16} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
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
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
