export function paymentAction(payment, now = Date.now()) {
  if (payment.reconciliation_required) return { canResume: false, label: 'Periksa pembayaran', message: 'Pembayaran sedang diperiksa. Jangan membuat pembayaran baru; hubungi dukungan bila status belum berubah.' };
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

export function hostedCheckoutUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !['xen.to', 'checkout.xendit.co'].includes(url.hostname)) throw new Error('Tautan pembayaran tidak valid');
  return url.href;
}
