import { useRef, useImperativeHandle, forwardRef, useState, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia";
import type { SkPath, SkImage } from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { colors } from "../../theme";

interface PathData {
  path: SkPath;
  color: string;
  strokeWidth: number;
}

export interface DrawingCanvasRef {
  undo: () => void;
  clear: () => void;
  getSnapshot: () => SkImage | undefined;
}

interface DrawingCanvasProps {
  color: string;
  strokeWidth: number;
  onPathsChange?: () => void;
}

// Maks antall paths før vi flattener til én sammenslått path
// Hindrer at canvas blir tregere jo mer du tegner
const MAX_PATHS_BEFORE_FLATTEN = 100;

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, onPathsChange }, ref) {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const currentColorRef = useRef(color);
    const currentStrokeRef = useRef(strokeWidth);
    const canvasRef = useCanvasRef();
    const pointCountRef = useRef(0);
    const isDrawingRef = useRef(false);

    // Hold refs oppdatert med nåværende verdier
    currentColorRef.current = color;
    currentStrokeRef.current = strokeWidth;

    useImperativeHandle(ref, () => ({
      undo: () => {
        setPaths((prev) => prev.slice(0, -1));
      },
      clear: () => {
        setPaths([]);
        setCurrentPath(null);
      },
      getSnapshot: () => {
        try {
          return canvasRef.current?.makeImageSnapshot();
        } catch (error) {
          console.warn("Failed to create snapshot:", error);
          return undefined;
        }
      },
    }));

    const panGesture = useMemo(
      () =>
        Gesture.Pan()
          .runOnJS(true)
          .minDistance(0)
          .onBegin((e) => {
            if (isDrawingRef.current) return;
            isDrawingRef.current = true;

            try {
              const path = Skia.Path.Make();
              path.moveTo(e.x, e.y);
              pointCountRef.current = 0;
              setCurrentPath(path);
            } catch (error) {
              console.warn("Failed to create path:", error);
              isDrawingRef.current = false;
            }
          })
          .onUpdate((e) => {
            if (!isDrawingRef.current) return;

            setCurrentPath((prev) => {
              if (!prev) return null;
              try {
                prev.lineTo(e.x, e.y);
                pointCountRef.current += 1;
                // Kopier hver 3. punkt for å trigge re-render
                // uten å lage for mange kopier
                if (pointCountRef.current % 3 === 0) {
                  return prev.copy();
                }
                return prev;
              } catch (error) {
                console.warn("Failed to update path:", error);
                return prev;
              }
            });
          })
          .onEnd(() => {
            isDrawingRef.current = false;

            setCurrentPath((prev) => {
              if (prev) {
                try {
                  const finishedPath = prev.copy();
                  const pathColor = currentColorRef.current;
                  const pathStroke = currentStrokeRef.current;

                  setPaths((prevPaths) => {
                    const next = [
                      ...prevPaths,
                      {
                        path: finishedPath,
                        color: pathColor,
                        strokeWidth: pathStroke,
                      },
                    ];

                    onPathsChange?.();

                    if (next.length > MAX_PATHS_BEFORE_FLATTEN) {
                      console.warn(
                        `Drawing has ${next.length} paths — may impact performance`
                      );
                    }

                    return next;
                  });
                } catch (error) {
                  console.warn("Failed to finalize path:", error);
                }
              }
              return null;
            });
          })
          .onFinalize(() => {
            // Sikkerhetsnett — reset drawing state uansett
            isDrawingRef.current = false;
          }),
      []
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {paths.map((pathData, index) => (
              <Path
                key={`path-${index}`}
                path={pathData.path}
                color={pathData.color}
                style="stroke"
                strokeWidth={pathData.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
            {currentPath && (
              <Path
                path={currentPath}
                color={color}
                style="stroke"
                strokeWidth={strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            )}
          </Canvas>
        </View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  canvas: {
    flex: 1,
  },
});
