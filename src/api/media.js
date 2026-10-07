import { ApiError } from "./client.js";

export function validateMediaFile(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new ApiError("UNSUPPORTED_MEDIA_TYPE");
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new ApiError("MEDIA_TOO_LARGE");
}

function putFile(url, file, headers, onProgress, signal) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const finish = (error) => {
      signal?.removeEventListener("abort", abort);
      error ? reject(error) : resolve();
    };
    xhr.open("PUT", url);
    xhr.timeout = 120000;
    Object.entries(headers).forEach(([key, value]) =>
      xhr.setRequestHeader(key, value),
    );
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () =>
      finish(
        xhr.status >= 200 && xhr.status < 300
          ? null
          : new ApiError("MEDIA_UPLOAD_FAILED"),
      );
    xhr.onerror = xhr.ontimeout = () =>
      finish(new ApiError("MEDIA_UPLOAD_FAILED"));
    xhr.onabort = () =>
      finish(new DOMException("Upload cancelled", "AbortError"));
    if (signal?.aborted) {
      finish(new DOMException("Upload cancelled", "AbortError"));
      return;
    }
    signal?.addEventListener("abort", abort, { once: true });
    xhr.send(file);
  });
}

// Accepts File or Blob (with filename): future Drive pickers use this same pipeline.
export async function uploadMedia(
  file,
  {
    api,
    purpose = "product",
    source = "device",
    filename = file.name || "image",
    onProgress,
    signal,
    put = putFile,
  },
) {
  validateMediaFile(file);
  let session;
  try {
    session = await api.request("/media/uploads", {
      method: "POST",
      signal,
      body: {
        filename,
        content_type: file.type,
        size: file.size,
        purpose,
        source,
      },
    });
    await put(session.upload_url, file, session.headers, onProgress, signal);
    return await api.request(`/media/uploads/${session.upload_id}/complete`, {
      method: "POST",
      signal,
    });
  } catch (error) {
    if (session)
      await api
        .request(`/media/${session.upload_id}`, { method: "DELETE" })
        .catch(() => {});
    throw error;
  }
}
