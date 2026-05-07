import { db, items, parseImageUris } from "@/server/db";
import { Directory, File, Paths } from 'expo-file-system';
import { getItemAsync, setItemAsync } from 'expo-secure-store';


const IMAGES_DIR_NAME = 'images';
const CLEANUP_KEY = 'last_cleanup_at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Relativer Dateiname → absoluter URI (für Anzeige)
export function resolveImageUri(filename: string): string {
  return new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`).uri;
}

// Kamerabild ins App-Verzeichnis kopieren → gibt relativen Dateinamen zurück
export async function saveImageToAppStorage(uri: string): Promise<string> {
  const dir = new Directory(Paths.document, IMAGES_DIR_NAME);
  if (!dir.exists) dir.create();

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const source = new File(uri);
  const dest = new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`);
  source.copy(dest);

  return filename; // ← nur Dateiname in DB speichern
}

// App-eigenes Bild löschen (nur relative Dateinamen)
export function deleteImageFromAppStorage(filename: string): void {
  const file = new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`);
  if (file.exists) file.delete();
}

async function cleanupOrphanedImages(): Promise<void> {
  const dir = new Directory(Paths.document, IMAGES_DIR_NAME);
  if (!dir.exists) return;

  // Alle Dateien im App-Bildordner
  const files = dir.list();
  const filenames = files
    .filter(f => f instanceof File)
    .map(f => (f as File).name);

  // Alle noch referenzierten Dateinamen aus der DB
  const allItems = await db.select({ imageUris: items.imageUris }).from(items);
  const referencedFilenames = new Set(
    allItems.flatMap(i => parseImageUris(i.imageUris))
  );

  // Nur löschen was nicht mehr referenziert wird
  for (const filename of filenames) {
    if (!referencedFilenames.has(filename)) {
      deleteImageFromAppStorage(filename);
    }
  }
}

export async function cleanupOrphanedImagesIfNeeded(): Promise<void> {
  const last = await getItemAsync(CLEANUP_KEY);
  const lastTs = last ? parseInt(last) : 0;
  if (Date.now() - lastTs < ONE_DAY_MS) return;

  await cleanupOrphanedImages();
  await setItemAsync(CLEANUP_KEY, Date.now().toString());
}

export function getDisplayUri(uriOrFilename: string): string {
  // Galerie-Bilder starten mit file:// oder content://
  // App-eigene Bilder sind nur ein Dateiname
  return uriOrFilename.startsWith('file://') || uriOrFilename.startsWith('content://')
    ? uriOrFilename
    : resolveImageUri(uriOrFilename);
}
