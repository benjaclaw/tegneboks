import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAWINGS_KEY = "tegneboks_drawings";
const MAX_DRAWINGS = 50;
// AsyncStorage har en ~6MB grense på Android. Én full-screen tegning kan
// være 200KB-1MB i base64. Med MAX_DRAWINGS=50 og snitt 500KB = ~25MB
// som er over grensen. Vi bør egentlig bruke filsystem for bilder,
// men for MVP holder dette med en safeguard.
const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5MB safeguard

export interface SavedDrawing {
  id: string;
  imageBase64: string;
  createdAt: number;
}

interface StoredDrawingList {
  drawings: SavedDrawing[];
}

// Enkel mutex for å forhindre samtidige skrive-operasjoner
let writeLock: Promise<void> = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const current = writeLock;
  let resolve: () => void;
  writeLock = new Promise<void>((r) => {
    resolve = r;
  });
  return current.then(fn).finally(() => resolve());
}

function isValidDrawingList(data: unknown): data is StoredDrawingList {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.drawings)) return false;
  return obj.drawings.every(
    (d: unknown) =>
      d !== null &&
      typeof d === "object" &&
      typeof (d as Record<string, unknown>).id === "string" &&
      typeof (d as Record<string, unknown>).imageBase64 === "string" &&
      typeof (d as Record<string, unknown>).createdAt === "number"
  );
}

export async function saveDrawing(imageBase64: string): Promise<SavedDrawing> {
  const drawing: SavedDrawing = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageBase64,
    createdAt: Date.now(),
  };

  await withWriteLock(async () => {
    const existing = await getDrawings();
    existing.unshift(drawing);

    let limited = existing.slice(0, MAX_DRAWINGS);

    // Sjekk total størrelse og fjern eldste til vi er under grensen
    let serialized = JSON.stringify({ drawings: limited });
    while (serialized.length > MAX_STORAGE_BYTES && limited.length > 1) {
      limited = limited.slice(0, -1);
      serialized = JSON.stringify({ drawings: limited });
    }

    await AsyncStorage.setItem(DRAWINGS_KEY, serialized);
  });

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
    try {
      await AsyncStorage.removeItem(DRAWINGS_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
}

export async function deleteDrawing(id: string): Promise<void> {
  await withWriteLock(async () => {
    const drawings = await getDrawings();
    const filtered = drawings.filter((d) => d.id !== id);

    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: filtered } satisfies StoredDrawingList)
    );
  });
}

export async function updateDrawing(id: string, imageBase64: string): Promise<void> {
  await withWriteLock(async () => {
    const drawings = await getDrawings();
    const updated = drawings.map((d) =>
      d.id === id ? { ...d, imageBase64, createdAt: Date.now() } : d
    );

    let serialized = JSON.stringify({ drawings: updated });
    // Safeguard
    while (serialized.length > MAX_STORAGE_BYTES && updated.length > 1) {
      updated.pop();
      serialized = JSON.stringify({ drawings: updated });
    }

    await AsyncStorage.setItem(DRAWINGS_KEY, serialized);
  });
}

export async function getDrawingById(
  id: string
): Promise<SavedDrawing | undefined> {
  const drawings = await getDrawings();
  return drawings.find((d) => d.id === id);
}
