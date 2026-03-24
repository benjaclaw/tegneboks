import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Directory, Paths } from "expo-file-system";

const DRAWINGS_KEY = "tegneboks_drawings";
const DRAWINGS_DIR = new Directory(Paths.document, "drawings");
const MAX_DRAWINGS = 50;

export interface SavedDrawing {
  id: string;
  /** file:// URI to the PNG image */
  imagePath: string;
  createdAt: number;
}

/** Legacy format — only used during migration */
interface LegacySavedDrawing {
  id: string;
  imageBase64: string;
  createdAt: number;
}

interface StoredMetadataList {
  drawings: SavedDrawing[];
}

interface LegacyStoredDrawingList {
  drawings: LegacySavedDrawing[];
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

function isValidMetadataList(data: unknown): data is StoredMetadataList {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.drawings)) return false;
  return obj.drawings.every(
    (d: unknown) =>
      d !== null &&
      typeof d === "object" &&
      typeof (d as Record<string, unknown>).id === "string" &&
      typeof (d as Record<string, unknown>).imagePath === "string" &&
      typeof (d as Record<string, unknown>).createdAt === "number"
  );
}

function isLegacyDrawingList(data: unknown): data is LegacyStoredDrawingList {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.drawings)) return false;
  return (
    obj.drawings.length > 0 &&
    obj.drawings.every(
      (d: unknown) =>
        d !== null &&
        typeof d === "object" &&
        typeof (d as Record<string, unknown>).id === "string" &&
        typeof (d as Record<string, unknown>).imageBase64 === "string" &&
        typeof (d as Record<string, unknown>).createdAt === "number"
    )
  );
}

function ensureDrawingsDir(): void {
  if (!DRAWINGS_DIR.exists) {
    DRAWINGS_DIR.create({ intermediates: true });
  }
}

function getDrawingFile(id: string): File {
  return new File(DRAWINGS_DIR, `${id}.png`);
}

let migrationDone = false;

/**
 * Migrer fra gammel AsyncStorage-format (base64 inline) til filsystem.
 * Kjøres én gang ved oppstart.
 */
async function migrateIfNeeded(): Promise<void> {
  if (migrationDone) return;
  migrationDone = true;

  try {
    const raw = await AsyncStorage.getItem(DRAWINGS_KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);

    // Allerede i nytt format?
    if (isValidMetadataList(parsed)) return;

    // Gammelt format med base64?
    if (!isLegacyDrawingList(parsed)) {
      await AsyncStorage.removeItem(DRAWINGS_KEY);
      return;
    }

    console.log(`Migrating ${parsed.drawings.length} drawings to file system...`);
    ensureDrawingsDir();

    const migrated: SavedDrawing[] = [];
    for (const legacy of parsed.drawings) {
      try {
        const file = getDrawingFile(legacy.id);
        file.create({ intermediates: true, overwrite: true });
        file.write(legacy.imageBase64, { encoding: "base64" });
        migrated.push({
          id: legacy.id,
          imagePath: file.uri,
          createdAt: legacy.createdAt,
        });
      } catch (error) {
        console.warn(`Failed to migrate drawing ${legacy.id}:`, error);
      }
    }

    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: migrated } satisfies StoredMetadataList)
    );
    console.log(`Migration complete: ${migrated.length} drawings migrated.`);
  } catch (error) {
    console.warn("Migration failed:", error);
  }
}

export async function getDrawings(): Promise<SavedDrawing[]> {
  await migrateIfNeeded();
  try {
    const data = await AsyncStorage.getItem(DRAWINGS_KEY);
    if (!data) return [];

    const parsed: unknown = JSON.parse(data);
    if (!isValidMetadataList(parsed)) {
      console.warn("Corrupt drawing metadata, resetting");
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

export async function saveDrawing(imageBase64: string): Promise<SavedDrawing> {
  ensureDrawingsDir();

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const file = getDrawingFile(id);
  file.create({ intermediates: true, overwrite: true });
  file.write(imageBase64, { encoding: "base64" });

  const drawing: SavedDrawing = {
    id,
    imagePath: file.uri,
    createdAt: Date.now(),
  };

  await withWriteLock(async () => {
    const existing = await getDrawings();
    existing.unshift(drawing);
    const limited = existing.slice(0, MAX_DRAWINGS);

    // Slett filer for tegninger som ble kuttet
    const removed = existing.slice(MAX_DRAWINGS);
    for (const r of removed) {
      try {
        const f = new File(r.imagePath);
        if (f.exists) f.delete();
      } catch {
        // Ignore
      }
    }

    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: limited } satisfies StoredMetadataList)
    );
  });

  return drawing;
}

export async function updateDrawing(id: string, imageBase64: string): Promise<void> {
  await withWriteLock(async () => {
    const drawings = await getDrawings();
    const existing = drawings.find((d) => d.id === id);

    if (existing) {
      // Overskriv eksisterende fil
      const file = new File(existing.imagePath);
      file.create({ intermediates: true, overwrite: true });
      file.write(imageBase64, { encoding: "base64" });
      const updated = drawings.map((d) =>
        d.id === id ? { ...d, createdAt: Date.now() } : d
      );
      await AsyncStorage.setItem(
        DRAWINGS_KEY,
        JSON.stringify({ drawings: updated } satisfies StoredMetadataList)
      );
    } else {
      // Tegning finnes ikke lenger — lagre som ny
      ensureDrawingsDir();
      const file = getDrawingFile(id);
      file.create({ intermediates: true, overwrite: true });
      file.write(imageBase64, { encoding: "base64" });
      drawings.unshift({ id, imagePath: file.uri, createdAt: Date.now() });
      await AsyncStorage.setItem(
        DRAWINGS_KEY,
        JSON.stringify({ drawings } satisfies StoredMetadataList)
      );
    }
  });
}

export async function deleteDrawing(id: string): Promise<void> {
  await withWriteLock(async () => {
    const drawings = await getDrawings();
    const toDelete = drawings.find((d) => d.id === id);

    if (toDelete) {
      try {
        const file = new File(toDelete.imagePath);
        if (file.exists) file.delete();
      } catch {
        // Ignore file deletion errors
      }
    }

    const filtered = drawings.filter((d) => d.id !== id);
    await AsyncStorage.setItem(
      DRAWINGS_KEY,
      JSON.stringify({ drawings: filtered } satisfies StoredMetadataList)
    );
  });
}

export async function getDrawingById(
  id: string
): Promise<SavedDrawing | undefined> {
  const drawings = await getDrawings();
  return drawings.find((d) => d.id === id);
}
