import { useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import { View } from "react-native";
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
  onPathsChange?: (count: number) => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  function DrawingCanvas({ color, strokeWidth, onPathsChange }, ref) {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [currentPath, setCurrentPath] = useState<SkPath | null>(null);
    const currentColorRef = useRef(color);
    const currentStrokeRef = useRef(strokeWidth);
    const canvasRef = useCanvasRef();
    const pointCountRef = useRef(0);

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
        setCurrentPath(null);
        onPathsChange?.(0);
      },
      getSnapshot: () => {
        return canvasRef.current?.makeImageSnapshot();
      },
    }));

    const panGesture = Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((e) => {
        const path = Skia.Path.Make();
        path.moveTo(e.x, e.y);
        pointCountRef.current = 0;
        setCurrentPath(path);
      })
      .onUpdate((e) => {
        setCurrentPath((prev) => {
          if (!prev) return null;
          prev.lineTo(e.x, e.y);
          pointCountRef.current += 1;
          // Return a copy every 3 points to trigger re-render without
          // excessive copies. Skia renders the mutated path even without
          // copy, but React needs a new reference to schedule a render.
          if (pointCountRef.current % 3 === 0) {
            return prev.copy();
          }
          return prev;
        });
      })
      .onEnd(() => {
        setCurrentPath((prev) => {
          if (prev) {
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
              onPathsChange?.(next.length);
              return next;
            });
          }
          return null;
        });
      });

    return (
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
