import { useRef, useState, useCallback, useEffect } from "react";
import { View, Alert, StyleSheet, Pressable, Modal, Text, FlatList, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Palette, Shapes, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import {
  DrawingCanvas,
  type DrawingCanvasRef,
} from "../src/components/features/DrawingCanvas";
import { ErrorBoundary } from "../src/components/features/ErrorBoundary";
import { Toolbar } from "../src/components/features/Toolbar";
import { IconButton } from "../src/components/ui/IconButton";
import { saveDrawing, updateDrawing, getDrawingById } from "../src/services/storageService";
import { getTemplates, renderTemplateToBase64, type Template } from "../src/services/templateService";
import { colors, drawingColors, penSizes } from "../src/theme";

export default function DrawScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const insets = useSafeAreaInsets();
  const isSavingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const { width: windowWidth } = useWindowDimensions();

  const [selectedColor, setSelectedColor] = useState<string>(drawingColors[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(penSizes.medium);
  const [isEraser, setIsEraser] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [backgroundUri, setBackgroundUri] = useState<string | undefined>();
  const [templateBase64, setTemplateBase64] = useState<string | undefined>();
  const [showTemplates, setShowTemplates] = useState(false);

  // Last lagret tegning hvis id er gitt
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    getDrawingById(id)
      .then((drawing) => {
        if (!cancelled && drawing) {
          setBackgroundUri(drawing.imagePath);
        }
      })
      .catch((error) => {
        console.warn("Failed to load drawing:", error);
      });

    return () => { cancelled = true; };
  }, [id]);

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
            setBackgroundUri(undefined);
            setTemplateBase64(undefined);
            hasDrawnRef.current = false;
          },
        },
      ]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    const doSave = async () => {
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

        // Oppdater eksisterende tegning eller lagre ny
        if (id) {
          await updateDrawing(id, encoded);
        } else {
          await saveDrawing(encoded);
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } catch (error) {
        console.warn("Save failed:", error);
        Alert.alert("Feil", "Kunne ikke lagre tegningen. Prøv igjen.");
      } finally {
        isSavingRef.current = false;
      }
    };

    void doSave();
  }, []);

  const handleBack = useCallback(() => {
    if (hasDrawnRef.current) {
      Alert.alert(
        "Lagre tegning?",
        "Du har en tegning som ikke er lagret.",
        [
          { text: "Forkast", style: "destructive", onPress: () => router.back() },
          { text: "Avbryt", style: "cancel" },
          { text: "Lagre", onPress: () => handleSave() },
        ]
      );
    } else {
      router.back();
    }
  }, [handleSave]);

  const handlePathsChange = useCallback(() => {
    hasDrawnRef.current = true;
  }, []);

  const toggleToolbar = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToolbarOpen((prev) => !prev);
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const base64 = renderTemplateToBase64(template, 800, 1200);
    setTemplateBase64(base64);
    setBackgroundUri(undefined);
    canvasRef.current?.clear();
    hasDrawnRef.current = false;
    setShowTemplates(false);
  }, []);

  const templates = getTemplates();
  const templateColumns = 3;
  const templateItemWidth = (windowWidth - 80) / templateColumns;

  return (
    <View style={styles.container}>
      {/* Tilbake-knapp */}
      <View style={[styles.topLeft, { top: insets.top + 8 }]}>
        <IconButton
          icon={ArrowLeft}
          onPress={handleBack}
          accessibilityLabel="Tilbake"
        />
      </View>

      {/* Maler-knapp */}
      <View style={[styles.topRight, { top: insets.top + 8 }]}>
        <IconButton
          icon={Shapes}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowTemplates(true);
          }}
          accessibilityLabel="Maler"
        />
      </View>

      {/* Tegneflate */}
      <ErrorBoundary onReset={() => router.back()}>
        <DrawingCanvas
          ref={canvasRef}
          color={activeColor}
          strokeWidth={strokeWidth}
          onPathsChange={handlePathsChange}
          backgroundUri={backgroundUri}
          backgroundBase64={templateBase64}
        />
      </ErrorBoundary>

      {/* FAB for verktøy */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}>
        {toolbarOpen && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <Toolbar
              selectedColor={selectedColor}
              selectedStrokeWidth={strokeWidth}
              onColorChange={handleColorChange}
              onStrokeWidthChange={setStrokeWidth}
              onUndo={handleUndo}
              onClear={handleClear}
              onSave={handleSave}
              isEraser={isEraser}
              onToggleEraser={handleToggleEraser}
              bottomInset={insets.bottom}
            />
          </Animated.View>
        )}

        {!toolbarOpen && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <Pressable
              onPress={toggleToolbar}
              style={[
                styles.fab,
                { backgroundColor: isEraser ? colors.text : selectedColor },
              ]}
              accessibilityLabel="Åpne verktøy"
              accessibilityRole="button"
            >
              <Palette size={28} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          </Animated.View>
        )}
      </View>

      {toolbarOpen && (
        <Pressable style={styles.overlay} onPress={toggleToolbar} />
      )}

      {/* Mal-velger modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplates(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Velg en mal</Text>
              <IconButton
                icon={X}
                onPress={() => setShowTemplates(false)}
                size="sm"
                accessibilityLabel="Lukk"
              />
            </View>
            <FlatList
              data={templates}
              numColumns={templateColumns}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.templateGrid}
              columnWrapperStyle={styles.templateRow}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectTemplate(item)}
                  style={[styles.templateItem, { width: templateItemWidth }]}
                  accessibilityLabel={`Mal: ${item.name}`}
                  accessibilityRole="button"
                >
                  <View style={[styles.templatePreview, { height: templateItemWidth * 1.2 }]}>
                    <Text style={styles.templateEmoji}>
                      {item.id === "house" ? "\u{1F3E0}" :
                       item.id === "flower" ? "\u{1F33B}" :
                       item.id === "car" ? "\u{1F697}" :
                       item.id === "butterfly" ? "\u{1F98B}" :
                       "\u{2B50}"}
                    </Text>
                  </View>
                  <Text style={styles.templateName}>{item.name}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topLeft: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  topRight: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    zIndex: 20,
    alignItems: "flex-end",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  templateGrid: {
    paddingHorizontal: 20,
  },
  templateRow: {
    gap: 12,
    marginBottom: 12,
  },
  templateItem: {
    alignItems: "center",
  },
  templatePreview: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  templateEmoji: {
    fontSize: 40,
  },
  templateName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
});
