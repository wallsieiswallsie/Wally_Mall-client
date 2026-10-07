const messages = {
  INVALID_CREDENTIALS: "Email atau password tidak cocok.",
  VALIDATION_ERROR: "Periksa kembali isian formulir.",
  RESOURCE_CONFLICT: "Data sudah terdaftar atau bertentangan dengan data lain.",
  FORBIDDEN: "Akun ini tidak memiliki akses.",
  ORIGIN_NOT_ALLOWED:
    "Alamat client belum diizinkan dalam CORS_ORIGINS server.",
  UNAUTHORIZED: "Sesi berakhir. Silakan masuk kembali.",
  INSUFFICIENT_STOCK: "Stok tidak mencukupi. Perbarui keranjang.",
  PRODUCT_UNAVAILABLE: "Produk sedang tidak tersedia.",
  NOT_FOUND: "Data tidak ditemukan atau sudah dihapus.",
  CATEGORY_NAME_TAKEN: "Nama kategori sudah digunakan.",
  CATEGORY_IN_USE:
    "Kategori sudah dipakai sehingga tidak dapat dihapus. Nonaktifkan kategori sebagai gantinya.",
  CATEGORY_UNAVAILABLE:
    "Kategori yang dipilih sudah tidak tersedia. Muat ulang halaman lalu pilih kategori lain.",
};

export class ApiError extends Error {
  constructor(code, status = 0, requestId) {
    super(messages[code] || `Permintaan gagal (${code}).`);
    Object.assign(this, { code, status, requestId });
  }
}

// Access token lives in memory; only the rotating refresh token survives a tab reload.
export function createApi({
  baseUrl = "/api/v1",
  fetchImpl = globalThis.fetch,
  storage,
  onUnauthorized = () => {},
} = {}) {
  const base = baseUrl.replace(/\/+$/, "");
  let accessToken = null;
  const saved = (method, ...args) => {
    try {
      return storage?.[method](...args);
    } catch {
      return null;
    }
  };
  let refreshToken = saved("getItem", "wally-refresh-token") || null;
  let refreshPending;
  let generation = 0;
  function clear() {
    generation++;
    accessToken = refreshToken = null;
    saved("removeItem", "wally-refresh-token");
  }
  function remember(data) {
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    saved("setItem", "wally-refresh-token", refreshToken);
    return data.user;
  }
  async function send(path, { method = "GET", body, signal } = {}, token) {
    let response;
    try {
      response = await fetchImpl(`${base}${path}`, {
        method,
        signal,
        headers: {
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch (error) {
      if (error.name === "AbortError") throw error;
      throw new Error(
        "Server tidak dapat dihubungi. Periksa koneksi dan konfigurasi API.",
      );
    }
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new ApiError(
        data?.error?.code || `HTTP_${response.status}`,
        response.status,
        data?.error?.request_id,
      );
    if (!data || !Object.hasOwn(data, "data"))
      throw new ApiError("INVALID_API_RESPONSE", response.status);
    return data.data;
  }
  async function refresh() {
    if (!refreshToken) {
      onUnauthorized();
      throw new ApiError("UNAUTHORIZED", 401);
    }
    if (!refreshPending) {
      const epoch = generation;
      refreshPending = send("/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
      })
        .then((data) => {
          if (epoch !== generation) throw new ApiError("UNAUTHORIZED", 401);
          remember(data);
        })
        .catch((error) => {
          if (
            epoch === generation &&
            (error.status === 401 || error.code === "VALIDATION_ERROR")
          ) {
            clear();
            onUnauthorized();
          }
          throw error;
        })
        .finally(() => {
          refreshPending = null;
        });
    }
    return refreshPending;
  }
  async function request(path, options = {}) {
    const epoch = generation;
    const authenticated = options.auth !== false;
    if (authenticated && !accessToken) await refresh();
    if (authenticated && epoch !== generation)
      throw new ApiError("UNAUTHORIZED", 401);
    const token = authenticated ? accessToken : null;
    try {
      const data = await send(path, options, token);
      if (authenticated && epoch !== generation)
        throw new ApiError("UNAUTHORIZED", 401);
      return data;
    } catch (error) {
      if (!authenticated || error.status !== 401) throw error;
      if (epoch !== generation) throw error;
      // Concurrent 401 responses must not rotate a token more than once.
      if (token === accessToken) await refresh();
      if (epoch !== generation || !accessToken)
        throw new ApiError("UNAUTHORIZED", 401);
      try {
        const data = await send(path, options, accessToken);
        if (epoch !== generation) throw new ApiError("UNAUTHORIZED", 401);
        return data;
      } catch (retryError) {
        if (retryError.status === 401 && epoch === generation) {
          clear();
          onUnauthorized();
        }
        throw retryError;
      }
    }
  }
  return {
    request,
    async authenticate(register, body) {
      const data = await send(register ? "/auth/register" : "/auth/login", {
        method: "POST",
        body,
      });
      generation++;
      return remember(data);
    },
    async restore() {
      return refreshToken ? request("/users/me") : null;
    },
    async logout() {
      await request("/auth/logout", { method: "POST" });
      clear();
    },
  };
}
