import { PaymentMethod, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS } from '../types'
import { CreditCard, Trash2, ChevronRight } from 'lucide-react'

interface Props {
  method: PaymentMethod
  unpaidBalance?: number | null
  currentBalance?: number
  totalExpense?: number
  onClick?: () => void
  onDelete?: () => void
}

export function PaymentMethodCard({
  method,
  unpaidBalance,
  currentBalance,
  totalExpense = 0,
  onClick,
  onDelete,
}: Props) {
  const icon = PAYMENT_METHOD_ICONS[method.type]
  const label = PAYMENT_METHOD_LABELS[method.type]

  const fmtYen = (n: number) =>
    '¥' + Math.round(n).toLocaleString('ja-JP')

  const usageRate =
    method.type === 'credit' && method.credit_limit && unpaidBalance != null
      ? Math.min((unpaidBalance / method.credit_limit) * 100, 100)
      : null

  return (
    <div
      className="bg-ink-800 border border-ink-700 rounded-2xl p-4 cursor-pointer hover:border-ink-500 transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: method.color + '22', border: `1px solid ${method.color}44` }}
          >
            <span role="img" aria-label={label}>{icon}</span>
          </div>
          <div>
            <p className="text-ink-50 font-medium text-sm">{method.name}</p>
            <p className="text-ink-500 text-xs">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete() }}
              className="p-1.5 text-ink-600 hover:text-coral-300 transition-colors"
              aria-label="削除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-ink-600" />
        </div>
      </div>

      {/* Stats */}
      {method.type === 'credit' && (
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-ink-500 text-xs">当月未払い残高</span>
            <span className="text-coral-300 font-mono text-sm font-medium">
              {fmtYen(unpaidBalance ?? 0)}
            </span>
          </div>
          {usageRate !== null && (
            <>
              <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${usageRate}%`,
                    background: usageRate > 80 ? '#e5604d' : usageRate > 50 ? '#d4a017' : method.color,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-ink-600 text-xs">
                  限度額 {fmtYen(method.credit_limit!)}
                </span>
                <span className="text-ink-500 text-xs">{Math.round(usageRate)}%使用</span>
              </div>
            </>
          )}
          {(method.closing_day || method.payment_day) && (
            <div className="flex gap-3 mt-2">
              {method.closing_day && (
                <span className="text-ink-600 text-xs">締め日: {method.closing_day}日</span>
              )}
              {method.payment_day && (
                <span className="text-ink-600 text-xs">引落日: {method.payment_day}日</span>
              )}
            </div>
          )}
        </div>
      )}

      {(method.type === 'emoney' || method.type === 'qr') && (
        <div className="flex justify-between items-baseline">
          <span className="text-ink-500 text-xs">推定残高</span>
          <span
            className="font-mono text-sm font-medium"
            style={{ color: (currentBalance ?? 0) < 1000 ? '#e5604d' : '#72b163' }}
          >
            {fmtYen(currentBalance ?? 0)}
          </span>
        </div>
      )}

      {(method.type === 'cash' || method.type === 'bank_transfer' || method.type === 'debit') && (
        <div className="flex justify-between items-baseline">
          <span className="text-ink-500 text-xs">今月の支出</span>
          <span className="text-ink-300 font-mono text-sm font-medium">{fmtYen(totalExpense)}</span>
        </div>
      )}
    </div>
  )
}
