import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// The worker loads this via dynamic import(), which requires the ESM build
// (the UMD build isn't a valid ES module and fails with "failed to import
// ffmpeg-core.js").
const CORE_BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

// Videos at or under this size already upload quickly — compressing them
// would just add wait time (downloading the ~25MB wasm core, then encoding)
// for little to no benefit.
const COMPRESSION_THRESHOLD_BYTES = 8 * 1024 * 1024;

let ffmpegSingleton: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

// Loads (and caches) the ffmpeg.wasm core lazily, only once per browser
// session, the first time a video actually needs compressing.
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton) return ffmpegSingleton;
  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegSingleton = ffmpeg;
      return ffmpeg;
    })();
  }
  return loadPromise;
}

export function shouldCompress(file: File): boolean {
  return file.size > COMPRESSION_THRESHOLD_BYTES;
}

/**
 * Re-encodes a video entirely in the browser (capped at 1280px wide, CRF 28)
 * to shrink large phone-camera uploads before they ever leave the device.
 * Falls back to the original file untouched if compression fails for any
 * reason — this is an optimization, not a requirement for upload to work.
 */
export async function compressVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  try {
    const ffmpeg = await getFFmpeg();
    const extension = file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4";
    const inputName = `input${extension}`;
    const outputName = "output.mp4";

    const onFFmpegProgress = ({ progress }: { progress: number }) => {
      onProgress?.(Math.min(99, Math.round(Math.max(0, progress) * 100)));
    };
    ffmpeg.on("progress", onFFmpegProgress);

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vcodec",
        "libx264",
        "-crf",
        "28",
        "-preset",
        "veryfast",
        "-vf",
        "scale='min(1280,iw)':-2",
        "-b:a",
        "128k",
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName);
      onProgress?.(100);

      // readFile only returns a string when an explicit text encoding was
      // requested — we didn't ask for one, so this is always binary.
      if (typeof data === "string") return file;

      const blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });
      const compressed = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4",
        { type: "video/mp4" }
      );

      // A failed/garbled encode can come back tiny or empty — better to
      // upload the original than a broken file. Also skip the compressed
      // version if it didn't meaningfully shrink the file (an already
      // well-compressed source re-encoded at the same settings can come
      // back close to its original size) — not worth the extra generation
      // loss for little to no size benefit.
      if (compressed.size === 0 || compressed.size > file.size * 0.9) return file;
      return compressed;
    } finally {
      ffmpeg.off("progress", onFFmpegProgress);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    }
  } catch (err) {
    console.warn("Video compression failed, uploading original file instead:", err);
    return file;
  }
}
