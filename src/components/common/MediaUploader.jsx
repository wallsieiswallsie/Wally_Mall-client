import { useEffect, useRef, useState } from "react";
import { mediaDeletePath, uploadMedia, validateMediaFile } from "../../api/media.js";

export default function MediaUploader({
  api,
  value,
  onChange,
  disabled = false,
}) {
  const [error, setError] = useState("");
  const current = useRef(value);
  const alive = useRef(true);
  current.current = value;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      current.current.forEach((item) => {
        item.controller?.abort();
        URL.revokeObjectURL(item.preview);
      });
    };
  }, []);
  function update(id, changes) {
    if (!alive.current) return;
    current.current = current.current.map((item) =>
      item.id === id ? { ...item, ...changes } : item,
    );
    onChange(current.current);
  }
  async function upload(item) {
    const controller = new AbortController();
    update(item.id, {
      status: "uploading",
      progress: 0,
      error: "",
      controller,
    });
    try {
      const asset = await uploadMedia(item.file, {
        api,
        signal: controller.signal,
        onProgress: (progress) => update(item.id, { progress }),
      });
      if (!alive.current) return;
      update(item.id, { status: "uploaded", asset });
    } catch (e) {
      if (e.name !== "AbortError")
        update(item.id, { status: "failed", error: e.message });
    }
  }
  function select(files) {
    if (disabled) return;
    setError("");
    const selected = Array.from(files);
    if (current.current.length + selected.length > 10) {
      setError("Maksimal 10 foto.");
      return;
    }
    try {
      selected.forEach(validateMediaFile);
    } catch (e) {
      setError(e.message);
      return;
    }
    const added = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "uploading",
      progress: 0,
    }));
    current.current = [...current.current, ...added];
    onChange(current.current);
    added.forEach(upload);
  }
  async function remove(item) {
    setError("");
    update(item.id, { status: "removing" });
    try {
      if (item.asset)
        await api.request(mediaDeletePath(item.asset.id), { method: "DELETE" });
      item.controller?.abort();
      URL.revokeObjectURL(item.preview);
      current.current = current.current.filter((x) => x.id !== item.id);
      onChange(current.current);
    } catch (e) {
      update(item.id, { status: item.status });
      setError(e.message);
    }
  }
  return (
    <fieldset disabled={disabled} className="media-uploader">
      <legend>Foto Produk</legend>
      <label
        className="media-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          select(e.dataTransfer.files);
        }}
      >
        Drag &amp; drop foto di sini atau pilih dari device
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            select(e.target.files);
            e.target.value = "";
          }}
        />
        <small>JPEG, PNG, WebP · maksimal 5 MB per foto · 10 foto</small>
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="media-previews">
        {value.map((item) => (
          <div key={item.id}>
            <img
              src={item.preview}
              alt={item.file.name}
              width="120"
              height="120"
            />
            <p>{item.file.name}</p>
            <p role="status">
              {item.status === "removing"
                ? "Menghapus foto…"
                : item.status === "uploaded"
                  ? "Upload berhasil ✓"
                  : item.status === "failed"
                    ? item.error
                    : `Mengunggah ${item.progress}%${item.progress === 100 ? " — memverifikasi foto" : ""}`}
            </p>
            {item.status === "uploading" && (
              <progress
                value={item.progress}
                max="100"
                aria-label={`Upload ${item.file.name}`}
              />
            )}
            {item.status === "failed" && (
              <button type="button" onClick={() => upload(item)}>
                Coba lagi
              </button>
            )}
            <button
              type="button"
              disabled={
                ["uploading", "removing"].includes(item.status) || disabled
              }
              onClick={() => remove(item)}
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
