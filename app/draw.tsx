import { useRef, useState } from "react";
import { View, Alert } from "react-native";
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setIsEraser(false);
  };

  const handleToggleEraser = () => {
    setIsEraser((prev) => !prev);
  };

  const handleUndo = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    canvasRef.current?.undo();
  };

  const handleClear = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    canvasRef.current?.clear();
  };

  const handleSave = async () => {
    // Hindre dobbel-lagring ved raske trykk
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
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Tilbake-knapp */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          zIndex: 10,
        }}
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
