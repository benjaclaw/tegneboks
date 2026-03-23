import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAWINGS_KEY = "tegneboks_drawings";
const MAX_DRAWINGS = 50;

export interface SavedDrawing {
  id: string;
  imageBase64: string;
  createdAt: number;
}

interface StoredDrawingList {
  drawings: SavedDrawing[];
}

function isValidDrawingList(data: unknown): data is StoredDrawingList {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.drawings);
}

export async function saveDrawing(imageBase64: string): Promise<SavedDrawing> {
  const drawing: SavedDrawing = {
    id: Date.now().toString(),
    imageBase64,
    createdAt: Date.now(),
  };

  try {
    const existing = await getDrawings();
    existing.unshift(drawing);

    // Begrens antall lagrede tegninger for å unngå OOM
    const limited = existing.slice(0, MAX_DRAWINGS);

    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: limited } satisfies StoredDrawingList)
    );
  } catch (error) {
    console.warn("Failed to save drawing:", error);
    throw error;
  }

  return drawing;
}

export async function getDrawings(): Promise<SavedDrawing[]> {
  try {
    const data = await AsyncStorage.getItem(DRAWINGS_KEY);
    if (!data) return [];

    const parsed: unknown = JSON.parse(data);
    if (!isValidDrawingList(parsed)) {
      console.warn("Corrupt drawing data, resetting");
      await AsyncStorage.removeItem(DRAWINGS_KEY);
      return [];
    }

    return parsed.drawings;
  } catch (error) {
    console.warn("Failed to read drawings:", error);
    // Ved korrupt data, slett og start fra scratch
    try {
      await AsyncStorage.removeItem(DRAWINGS_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

export async function deleteDrawing(id: string): Promise<void> {
  try {
    const drawings = await getDrawings();
    const filtered = drawings.filter((d) => d.id !== id);

    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: filtered } satisfies StoredDrawingList)
    );
  } catch (error) {
    console.warn("Failed to delete drawing:", error);
    throw error;
  }
}

export async function getDrawingById(
  id: string
): Promise<SavedDrawing | undefined> {
  const drawings = await getDrawings();
  return drawings.find((d) => d.id === id);
}
