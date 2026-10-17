export function paymentAction(payment, now = Date.now()) {
  const status = payment.status === 'pending' && new Date(payment.expires_at).getTime() <= now
    ? 'expired' : payment.status;
  const messages = {
    pending: 'Lanjutkan pembayaran',
    expired: 'Pembayaran kedaluwarsa. Silakan kembali ke katalog untuk memesan lagi.',
    failed: 'Pembayaran gagal. Silakan kembali ke katalog untuk memesan lagi.',
    success: 'Pembayaran berhasil. Lihat perkembangan pesanan.',
    refunded: 'Pembayaran telah dikembalikan.',
    partially_refunded: 'Sebagian pembayaran telah dikembalikan.',
  };
  return { canResume: status === 'pending', label: status === 'pending' ? messages.pending : 'Lihat pembayaran', message: messages[status] ?? 'Periksa status pembayaran.' };
}
