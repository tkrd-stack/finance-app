export type TransactionType = 'income' | 'expense'

// ── 支払い方法の種別 ──────────────────────────────
export type PaymentMethodType =
  | 'cash'          // 現金
  | 'credit'        // クレジットカード
  | 'debit'         // デビットカード
  | 'emoney'        // 電子マネー（Suica, PASMO, nanaco, etc.）
  | 'qr'            // QRコード決済（PayPay, LINE Pay, etc.）
  | 'bank_transfer' // 銀行振込

export interface PaymentMethod {
  id: string
  user_id: string
  name: string                    // 例: "楽天カード", "Suica", "PayPay"
  type: PaymentMethodType
  color: string                   // UI表示用カラー（hex）
  // クレジットカード専用
  closing_day: number | null      // 締め日（1〜31）
  payment_day: number | null      // 引落日（1〜31）
  credit_limit: number | null     // 利用限度額
  // 電子マネー/QR専用
  balance: number | null          // 現在残高
  created_at: string
}

// ── 取引 ─────────────────────────────────────────
export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category: string
  note: string
  amount: number
  date: string
  payment_method_id: string | null  // null = 未分類
  // 電子マネーチャージ記録用
  is_charge: boolean               // trueならチャージ取引（収入扱いにしない）
  created_at: string
}

// 支払い方法ごとの月次集計
export interface PaymentMethodSummary {
  payment_method: PaymentMethod
  total_expense: number
  total_income: number
  transaction_count: number
  // クレジット: 未引落残高
  unpaid_balance: number | null
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

// ── カテゴリ ──────────────────────────────────────
export const INCOME_CATEGORIES = [
  '給与', '副業', '投資', 'ボーナス', '年金', 'その他収入',
] as const

export const EXPENSE_CATEGORIES = [
  '食費', '住居費', '交通費', '光熱費', '通信費',
  '医療費', '娯楽費', '衣服・美容', '教育費', '日用品',
  '交際費', '保険', '貯蓄', 'その他支出',
] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// ── 支払い方法メタ情報 ────────────────────────────
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: '現金',
  credit: 'クレジットカード',
  debit: 'デビットカード',
  emoney: '電子マネー',
  qr: 'QRコード決済',
  bank_transfer: '銀行振込',
}

export const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, string> = {
  cash: '💴',
  credit: '💳',
  debit: '🏦',
  emoney: '🚃',
  qr: '📱',
  bank_transfer: '🏛️',
}

export const DEFAULT_PAYMENT_COLORS: Record<PaymentMethodType, string> = {
  cash: '#5e5a50',
  credit: '#4a9137',
  debit: '#185FA5',
  emoney: '#c73d29',
  qr: '#d4a017',
  bank_transfer: '#534AB7',
}
