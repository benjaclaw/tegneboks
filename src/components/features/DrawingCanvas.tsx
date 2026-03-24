import { useRef, useImperativeHandle, forwardRef, useState, useMemo, useEffect } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Image as SkiaImage,
} from "@shopify/react-native-skia";
import type { SkPath, SkImage } from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { File as ExpoFile } from "expo-file-system";
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
  backgroundUri?: string; // file path to PNG background
}

const MAX_PATHS_BEFORE_FLATTEN = 100;

/**
 * Dekoder en base64-streng til et Skia SkImage.
 */
function decodeBase64Image(base64: string): SkImage | null {
  try {
    const data = Skia.Data.fromBase64(base64);
    return Skia.Image.MakeImageFromEncoded(data);
  } catch (error) {
    console.warn("Failed to decode base64 image:", error);
    return null;
  }
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, onPathsChange, backgroundUri }, ref) {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [bgSkImage, setBgSkImage] = useState<SkImage | null>(null);
    const currentColorRef = useRef(color);
    const currentStrokeRef = useRef(strokeWidth);
    const canvasRef = useCanvasRef();
    const pointCountRef = useRef(0);
    const isDrawingRef = useRef(false);

    currentColorRef.current = color;
    currentStrokeRef.current = strokeWidth;

    // Last bakgrunnsbilde fra fil
    useEffect(() => {
      if (!backgroundUri) {
        setBgSkImage(null);
        return;
      }

      let cancelled = false;

      (async () => {
        try {
          const file = new ExpoFile(backgroundUri);
          const base64 = await file.base64();
          if (!cancelled) {
            const img = decodeBase64Image(base64);
            setBgSkImage(img);
          }
        } catch (error) {
          console.warn("Failed to load background image:", error);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [backgroundUri]);

    const handleLayout = (e: LayoutChangeEvent) => {
      setCanvasSize({
        width: e.nativeEvent.layout.width,
        height: e.nativeEvent.layout.height,
      });
    };

    /** Flatten all paths into a background image to prevent performance degradation */
    const flattenPaths = () => {
      try {
        const snapshot = canvasRef.current?.makeImageSnapshot();
        if (snapshot) {
          for (const p of paths) {
            try { p.path.reset(); } catch { /* ignore */ }
          }
          setPaths([]);
          setBgSkImage(snapshot);
        }
      } catch (error) {
        console.warn("Failed to flatten paths:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      undo: () => {
        setPaths((prev) => {
          if (prev.length === 0) return prev;
          const removed = prev[prev.length - 1];
          try { removed.path.reset(); } catch { /* ignore */ }
          return prev.slice(0, -1);
        });
      },
      clear: () => {
        for (const p of paths) {
          try { p.path.reset(); } catch { /* ignore */ }
        }
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
                  const copy = prev.copy();
                  prev.reset(); // Free the original after copying
                  return copy;
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
                  prev.reset(); // Free the original
                  const pathColor = currentColorRef.current;
                  const pathStroke = currentStrokeRef.current;
                  setPaths((prevPaths) => {
                    const next = [
                      ...prevPaths,
                      { path: finishedPath, color: pathColor, strokeWidth: pathStroke },
                    ];
                    onPathsChange?.();
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

    // Auto-flatten when path count exceeds threshold
    useEffect(() => {
      if (paths.length > MAX_PATHS_BEFORE_FLATTEN) {
        flattenPaths();
      }
    }, [paths.length]);

    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.container} onLayout={handleLayout}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {bgSkImage && canvasSize.width > 0 && (
              <SkiaImage
                image={bgSkImage}
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
