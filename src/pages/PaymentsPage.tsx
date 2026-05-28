import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useTransactions } from '../hooks/useTransactions'
import { PaymentMethodCard } from '../components/PaymentMethodCard'
import { AddPaymentMethodModal } from '../components/AddPaymentMethodModal'
import { PAYMENT_METHOD_LABELS } from '../types'
import { format } from 'date-fns'

export default function PaymentsPage() {
  const { paymentMethods, loading, addPaymentMethod, deletePaymentMethod, getUnpaidBalance, getEmoneyBalance } =
    usePaymentMethods()
  const { transactions } = useTransactions()
  const [showAdd, setShowAdd] = useState(false)

  const thisMonth = format(new Date(), 'yyyy-MM')

  // 支払い方法ごとの今月支出
  const monthlyExpense = (pmId: string) =>
    transactions
      .filter(t => t.payment_method_id === pmId && t.type === 'expense' && !t.is_charge && t.date.startsWith(thisMonth))
      .reduce((sum, t) => sum + t.amount, 0)

  // クレジットカードの次回引落日を計算
  const nextPaymentDate = (closingDay: number | null, paymentDay: number | null) => {
    if (!closingDay || !paymentDay) return null
    const now = new Date()
    const base = now.getDate() <= closingDay ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return new Date(base.getFullYear(), base.getMonth(), paymentDay)
  }

  const fmtYen = (n: number) => '¥' + Math.round(n).toLocaleString('ja-JP')
  const fmtDate = (d: Date) => format(d, 'M月d日')

  // 総未払い残高
  const totalUnpaid = paymentMethods
    .filter(pm => pm.type === 'credit')
    .reduce((sum, pm) => sum + (getUnpaidBalance(pm, transactions) ?? 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ink-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ink-50 text-xl font-semibold">支払い方法</h1>
          <p className="text-ink-500 text-xs mt-0.5">{paymentMethods.length}件登録済み</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-sage-500 hover:bg-sage-400 text-ink-900 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {/* クレジット合計アラート */}
      {totalUnpaid > 0 && (
        <div className="flex items-start gap-3 bg-coral-400/10 border border-coral-400/30 rounded-2xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 text-coral-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-coral-300 text-sm font-medium">クレジット当月合計</p>
            <p className="text-coral-200 text-xl font-semibold font-mono mt-0.5">{fmtYen(totalUnpaid)}</p>
            <p className="text-coral-400 text-xs mt-1">すべてのカードの未引落残高の合計です</p>
          </div>
        </div>
      )}

      {/* 支払い方法一覧 */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-ink-400 text-sm mb-1">支払い方法がまだありません</p>
          <p className="text-ink-600 text-xs">クレジットカードや電子マネーを登録しましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* グループ: クレジット */}
          {paymentMethods.filter(pm => pm.type === 'credit').length > 0 && (
            <section>
              <p className="text-ink-600 text-xs font-medium mb-2 px-1">💳 クレジットカード</p>
              <div className="space-y-2">
                {paymentMethods.filter(pm => pm.type === 'credit').map(pm => {
                  const unpaid = getUnpaidBalance(pm, transactions)
                  const nextDate = nextPaymentDate(pm.closing_day, pm.payment_day)
                  return (
                    <div key={pm.id}>
                      <PaymentMethodCard
                        method={pm}
                        unpaidBalance={unpaid}
                        totalExpense={monthlyExpense(pm.id)}
                        onDelete={() => {
                          if (confirm(`「${pm.name}」を削除しますか？`)) deletePaymentMethod(pm.id)
                        }}
                      />
                      {nextDate && unpaid != null && unpaid > 0 && (
                        <p className="text-ink-600 text-xs px-2 mt-1">
                          次回引落: {fmtDate(nextDate)} — {fmtYen(unpaid)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* グループ: 電子マネー / QR */}
          {paymentMethods.filter(pm => pm.type === 'emoney' || pm.type === 'qr').length > 0 && (
            <section className="mt-4">
              <p className="text-ink-600 text-xs font-medium mb-2 px-1">📱 電子マネー / QR決済</p>
              <div className="space-y-2">
                {paymentMethods.filter(pm => pm.type === 'emoney' || pm.type === 'qr').map(pm => (
                  <PaymentMethodCard
                    key={pm.id}
                    method={pm}
                    currentBalance={getEmoneyBalance(pm, transactions)}
                    totalExpense={monthlyExpense(pm.id)}
                    onDelete={() => {
                      if (confirm(`「${pm.name}」を削除しますか？`)) deletePaymentMethod(pm.id)
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* グループ: その他 */}
          {paymentMethods.filter(pm => ['cash', 'debit', 'bank_transfer'].includes(pm.type)).length > 0 && (
            <section className="mt-4">
              <p className="text-ink-600 text-xs font-medium mb-2 px-1">💴 現金 / その他</p>
              <div className="space-y-2">
                {paymentMethods.filter(pm => ['cash', 'debit', 'bank_transfer'].includes(pm.type)).map(pm => (
                  <PaymentMethodCard
                    key={pm.id}
                    method={pm}
                    totalExpense={monthlyExpense(pm.id)}
                    onDelete={() => {
                      if (confirm(`「${pm.name}」を削除しますか？`)) deletePaymentMethod(pm.id)
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showAdd && (
        <AddPaymentMethodModal
          onAdd={addPaymentMethod as any}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
