import test from "node:test";
import assert from "node:assert/strict";
import { uploadMedia, validateMediaFile } from "../src/api/media.js";
test("shared uploader sends File/Blob then completes and returns server asset", async () => {
  const file = new Blob(["image"], { type: "image/png" });
  const calls = [];
  const asset = {
    id: "asset",
    public_url: "https://storage.googleapis.com/wallymall-media-prod/test.png",
  };
  const api = {
    request: async (path, options) => {
      calls.push(path);
      if (path === "/media/uploads") {
        assert.equal(options.body.source, "google_drive");
        return {
          upload_id: "asset",
          upload_url: "https://put.test",
          headers: { "Content-Type": file.type },
        };
      }
      return asset;
    },
  };
  assert.equal(
    await uploadMedia(file, {
      api,
      source: "google_drive",
      put: async (url, body) => {
        assert.equal(body, file);
        calls.push("PUT");
      },
    }),
    asset,
  );
  assert.deepEqual(calls, [
    "/media/uploads",
    "PUT",
    "/media/uploads/asset/complete",
  ]);
});
test("upload failure never completes; session is marked for cleanup", async () => {
  const calls = [];
  const api = {
    request: async (path) => {
      calls.push(path);
      return {
        upload_id: "asset",
        upload_url: "https://put.test",
        headers: {},
      };
    },
  };
  await assert.rejects(
    uploadMedia(new Blob(["x"], { type: "image/png" }), {
      api,
      put: async () => {
        throw new Error("network");
      },
    }),
    /network/,
  );
  assert.deepEqual(calls, ["/media/uploads", "/media/asset"]);
  assert.throws(() => validateMediaFile({ type: "image/svg+xml", size: 10 }), {
    code: "UNSUPPORTED_MEDIA_TYPE",
  });
  assert.throws(() => validateMediaFile({ type: "image/png", size: 5242881 }), {
    code: "MEDIA_TOO_LARGE",
  });
});
