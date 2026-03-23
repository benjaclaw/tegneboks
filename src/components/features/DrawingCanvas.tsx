import { useRef, useImperativeHandle, forwardRef, useState, useMemo, useEffect } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Image as SkiaImage,
  useImage,
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
  backgroundImage?: string; // base64 data URI
}

const MAX_PATHS_BEFORE_FLATTEN = 100;

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, onPathsChange, backgroundImage }, ref) {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const currentColorRef = useRef(color);
    const currentStrokeRef = useRef(strokeWidth);
    const canvasRef = useCanvasRef();
    const pointCountRef = useRef(0);
    const isDrawingRef = useRef(false);

    // Last bakgrunnsbilde som Skia Image (rendres inne i Canvas → inkluderes i snapshot)
    const bgImage = useImage(backgroundImage ?? null);

    currentColorRef.current = color;
    currentStrokeRef.current = strokeWidth;

    const handleLayout = (e: LayoutChangeEvent) => {
      setCanvasSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    };

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
                      { path: finishedPath, color: pathColor, strokeWidth: pathStroke },
                    ];
                    onPathsChange?.();
                    if (next.length > MAX_PATHS_BEFORE_FLATTEN) {
                      console.warn(`Drawing has ${next.length} paths`);
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
            isDrawingRef.current = false;
          }),
      []
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.container} onLayout={handleLayout}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {/* Bakgrunnsbilde rendret i Skia → inkluderes i snapshot */}
            {bgImage && canvasSize.width > 0 && (
              <SkiaImage
                image={bgImage}
                x={0}
                y={0}
                width={canvasSize.width}
                height={canvasSize.height}
                fit="contain"
              />
            )}
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
