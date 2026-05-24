import { db, items, ListItem, parseImageUris, unitMap } from "@/server/db";
import { Directory, File, Paths } from 'expo-file-system';
import { getItemAsync, setItemAsync } from 'expo-secure-store';


const IMAGES_DIR_NAME = 'images';
const CLEANUP_KEY = 'last_cleanup_at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function resolveImageUri(filename: string): string {
  return new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`).uri;
}

export function getDisplayUri(uriOrFilename: string): string {
  return uriOrFilename.startsWith('file://') || uriOrFilename.startsWith('content://')
    ? uriOrFilename
    : resolveImageUri(uriOrFilename);
}

function ensureImagesDir() {
  const dir = new Directory(Paths.document, IMAGES_DIR_NAME);
  if (!dir.exists) dir.create();
}

export async function saveImageToAppStorage(uri: string): Promise<string> {
  ensureImagesDir();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  new File(uri).copy(new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`));
  return filename;
}

export function deleteImageFromAppStorage(filename: string): void {
  // only delete app storage images
  if (filename.startsWith('file://') || filename.startsWith('content://')) return;
  const file = new File(Paths.document, `${IMAGES_DIR_NAME}/${filename}`);
  if (file.exists) file.delete();
}

// returns filenames that were saved successfully
export async function persistImages(uris: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    uris.map((uri) => {
      if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
        return Promise.resolve(uri);
      }
      return saveImageToAppStorage(uri);
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => r.value);
}

// images diff in case of updating an item
export function diffImageUris(
  previous: string[],
  next: string[]
): { added: string[]; removed: string[] } {
  return {
    added: next.filter((uri) => !previous.includes(uri)),
    removed: previous.filter((uri) => !next.includes(uri)),
  };
}


async function cleanupOrphanedImages(): Promise<void> {
  const dir = new Directory(Paths.document, IMAGES_DIR_NAME)
  if (!dir.exists) return

  // all images from app storage
  const files = dir.list()
  const filenames = files
    .filter(f => f instanceof File)
    .map(f => (f as File).name)

  // all referencing images from db
  const allItems = await db.select({ imageUris: items.imageUris }).from(items)
  const referencedFilenames = new Set(
    allItems.flatMap(i => parseImageUris(i.imageUris))
  )

  // delete all files which are not referenced
  for (const filename of filenames) {
    if (!referencedFilenames.has(filename)) {
      deleteImageFromAppStorage(filename)
    }
  }
}

export async function cleanupOrphanedImagesIfNeeded(): Promise<void> {
  const last = await getItemAsync(CLEANUP_KEY)
  const lastTs = last ? parseInt(last) : 0
  if (Date.now() - lastTs < ONE_DAY_MS) return

  await cleanupOrphanedImages()
  await setItemAsync(CLEANUP_KEY, Date.now().toString())
}

export function getPurchaseAmount({ quantity, unit }: Pick<ListItem, "quantity" | "unit">) {
  return `${quantity} ${unit && unitMap[unit]}`
}
