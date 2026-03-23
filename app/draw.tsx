import { useRef, useState, useCallback } from "react";
import { View, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Skia } from "@shopify/react-native-skia";
import {
  DrawingCanvas,
  type DrawingCanvasRef,
} from "../src/components/features/DrawingCanvas";
import { Toolbar } from "../src/components/features/Toolbar";
import { IconButton } from "../src/components/ui/IconButton";
import { saveDrawing, getDrawingById } from "../src/services/storageService";
import { colors, drawingColors, penSizes } from "../src/theme";

export default function DrawScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const insets = useSafeAreaInsets();

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
    const snapshot = canvasRef.current?.getSnapshot();
    if (!snapshot) return;

    const encoded = snapshot.encodeToBase64();
    await saveDrawing(encoded);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
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
