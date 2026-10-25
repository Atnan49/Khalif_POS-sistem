export type UserRole = 'pemilik' | 'admin' | 'kasir';

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number; // Tersembunyi untuk Kasir & Admin via RLS
  stock: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  costPrice: number;
  qty: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  cashierName: string;
  cashierId: string;
  items: SaleItem[];
  total: number;
  cashReceived: number;
  change: number;
  status: 'paid' | 'void';
  voidReason?: string;
  voidAt?: string;
  paymentMethod?: 'tunai' | 'qris' | 'transfer' | 'hutang';
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  originalInvoice: string;
  date: string;
  productName: string;
  qty: number;
  refundAmount: number;
  reason: 'rusak_pabrik' | 'salah_beli' | 'cacat_kemasan' | 'tukar_barang';
  cashierName: string;
  status: 'selesai' | 'ditolak';
}

export interface CustomerDebt {
  id: string;
  customerName: string;
  phone: string;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  lastTransactionDate: string;
  dueDate: string;
  status: 'belum_lunas' | 'lunas';
  notes: string;
}

export interface CashMovement {
  id: string;
  type: 'masuk' | 'keluar';
  category: 'modal_awal' | 'penjualan' | 'operasional' | 'setor_pemilik' | 'lainnya';
  amount: number;
  description: string;
  cashierName: string;
  timestamp: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  receiptFooter: string;
  printerPaper: '58mm' | '80mm';
  autoBeep: boolean;
  autoVibrate: boolean;
}

export type ScanMode = 'camera' | 'laser';

// 9 Halaman Wajib sesuai referensi navigasi Kasir Khalif
export type ViewTab =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'returns'
  | 'customer_debt'
  | 'cash_balance'
  | 'reports'
  | 'store_settings'
  | 'user_management';
