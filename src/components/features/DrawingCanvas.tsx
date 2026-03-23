import { useCallback, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { View, LayoutChangeEvent } from "react-native";
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
  GestureHandlerRootView,
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
  onPathsChange?: (count: number) => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, onPathsChange }, ref) {
    const [paths, setPaths] = useState<PathData[]>([]);
    const currentPathRef = useRef<SkPath | null>(null);
    const currentColorRef = useRef(color);
    const currentStrokeRef = useRef(strokeWidth);
    const canvasRef = useCanvasRef();
    const [, setRenderTick] = useState(0);

    // Hold refs oppdatert med nåværende verdier
    currentColorRef.current = color;
    currentStrokeRef.current = strokeWidth;

    useImperativeHandle(ref, () => ({
      undo: () => {
        setPaths((prev) => {
          const next = prev.slice(0, -1);
          onPathsChange?.(next.length);
          return next;
        });
      },
      clear: () => {
        setPaths([]);
        onPathsChange?.(0);
      },
      getSnapshot: () => {
        return canvasRef.current?.makeImageSnapshot();
      },
    }));

    const panGesture = Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        const path = Skia.Path.Make();
        path.moveTo(e.x, e.y);
        currentPathRef.current = path;
        setRenderTick((t) => t + 1);
      })
      .onUpdate((e) => {
        if (currentPathRef.current) {
          currentPathRef.current.lineTo(e.x, e.y);
          setRenderTick((t) => t + 1);
        }
      })
      .onEnd(() => {
        if (currentPathRef.current) {
          const finishedPath = currentPathRef.current;
          const pathColor = currentColorRef.current;
          const pathStroke = currentStrokeRef.current;
          currentPathRef.current = null;

          setPaths((prev) => {
            const next = [
              ...prev,
              {
                path: finishedPath,
                color: pathColor,
                strokeWidth: pathStroke,
              },
            ];
            onPathsChange?.(next.length);
            return next;
          });
        }
      });

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <View style={{ flex: 1, backgroundColor: colors.canvas }}>
            <Canvas ref={canvasRef} style={{ flex: 1 }}>
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
              {currentPathRef.current && (
                <Path
                  path={currentPathRef.current}
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
      </GestureHandlerRootView>
    );
  }
);
