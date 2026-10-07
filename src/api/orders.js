// Seller has a paginated list endpoint, but no /seller/orders/:id detail route.
export async function findSellerOrder(api, id, signal) {
  for (let offset = 0; offset <= 10000; offset += 100) {
    const rows = await api.request(
      `/seller/orders?limit=100&offset=${offset}`,
      { signal },
    );
    const order = rows.find((row) => row.id === id);
    if (order) return order;
    if (rows.length < 100)
      throw new Error(
        "Pesanan tidak ditemukan atau tidak tersedia untuk akun ini.",
      );
  }
  throw new Error(
    "Pesanan berada di luar batas penelusuran API. Gunakan daftar pesanan dengan filter tanggal.",
  );
}
