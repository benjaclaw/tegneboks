import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";

/**
 * Save a base64-encoded PNG to the device camera roll.
 */
export async function saveToCameraRoll(base64: string): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Trenger tilgang til kamerarullen for å lagre bildet.");
  }

  const file = new File(Paths.cache, `tegning-${Date.now()}.png`);
  file.create();
  file.write(base64, { encoding: "base64" });

  await MediaLibrary.saveToLibraryAsync(file.uri);

  file.delete();
}

/**
 * Share a base64-encoded PNG via the native share sheet.
 */
export async function shareDrawing(base64: string): Promise<void> {
  const file = new File(Paths.cache, `tegning-${Date.now()}.png`);
  file.create();
  file.write(base64, { encoding: "base64" });

  await Sharing.shareAsync(file.uri, {
    mimeType: "image/png",
    dialogTitle: "Del tegning",
  });

  file.delete();
}
