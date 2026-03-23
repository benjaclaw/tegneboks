import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAWINGS_KEY = "tegneboks_drawings";

export interface SavedDrawing {
  id: string;
  imageBase64: string;
  createdAt: number;
}

interface StoredDrawingList {
  drawings: SavedDrawing[];
}

export async function saveDrawing(imageBase64: string): Promise<SavedDrawing> {
  const drawing: SavedDrawing = {
    id: Date.now().toString(),
    imageBase64,
    createdAt: Date.now(),
  };

  const existing = await getDrawings();
  existing.unshift(drawing);

  await AsyncStorage.setItem(
    DRAWINGS_KEY,
    JSON.stringify({ drawings: existing } satisfies StoredDrawingList)
  );

  return drawing;
}

export async function getDrawings(): Promise<SavedDrawing[]> {
  const data = await AsyncStorage.getItem(DRAWINGS_KEY);
  if (!data) return [];

  const parsed = JSON.parse(data) as StoredDrawingList;
  return parsed.drawings;
}

export async function deleteDrawing(id: string): Promise<void> {
  const drawings = await getDrawings();
  const filtered = drawings.filter((d) => d.id !== id);

  await AsyncStorage.setItem(
    DRAWINGS_KEY,
    JSON.stringify({ drawings: filtered } satisfies StoredDrawingList)
  );
}

export async function getDrawingById(
  id: string
): Promise<SavedDrawing | undefined> {
  const drawings = await getDrawings();
  return drawings.find((d) => d.id === id);
}
