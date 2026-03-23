import { useRef, useState, useCallback } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  DrawingCanvas,
  type DrawingCanvasRef,
} from "../src/components/features/DrawingCanvas";
import { Toolbar } from "../src/components/features/Toolbar";
import { IconButton } from "../src/components/ui/IconButton";
import { saveDrawing } from "../src/services/storageService";
import { colors, drawingColors, penSizes } from "../src/theme";

export default function DrawScreen() {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const insets = useSafeAreaInsets();
  const isSavingRef = useRef(false);

  const [selectedColor, setSelectedColor] = useState<string>(drawingColors[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(penSizes.medium);
  const [isEraser, setIsEraser] = useState(false);

  const activeColor = isEraser ? "#FFFFFF" : selectedColor;

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    setIsEraser(false);
  }, []);

  const handleToggleEraser = useCallback(() => {
    setIsEraser((prev) => !prev);
  }, []);

  const handleUndo = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    canvasRef.current?.undo();
  }, []);

  const handleClear = useCallback(() => {
    Alert.alert(
      "Ny tegning",
      "Er du sikker? Alt du har tegnet blir borte.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ja, start på nytt",
          style: "destructive",
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            canvasRef.current?.clear();
          },
        },
      ]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const snapshot = canvasRef.current?.getSnapshot();
      if (!snapshot) {
        isSavingRef.current = false;
        return;
      }

      const encoded = snapshot.encodeToBase64();
      if (!encoded) {
        Alert.alert("Feil", "Kunne ikke lagre tegningen. Prøv igjen.");
        isSavingRef.current = false;
        return;
      }

      await saveDrawing(encoded);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.warn("Save failed:", error);
      Alert.alert("Feil", "Kunne ikke lagre tegningen. Prøv igjen.");
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.container}>
      {/* Tilbake-knapp */}
      <View
        style={[
          styles.backButton,
          { top: insets.top + 8 },
        ]}
      >
        <IconButton
          icon={ArrowLeft}
          onPress={handleBack}
          accessibilityLabel="Tilbake"
        />
      </View>

      {/* Tegneflate */}
      <DrawingCanvas
        ref={canvasRef}
        color={activeColor}
        strokeWidth={strokeWidth}
      />

      {/* Verktøylinje */}
      <Toolbar
        selectedColor={selectedColor}
        selectedStrokeWidth={strokeWidth}
        onColorChange={handleColorChange}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onClear={handleClear}
        onSave={() => void handleSave()}
        isEraser={isEraser}
        onToggleEraser={handleToggleEraser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
});
