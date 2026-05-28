import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { PAYMENT_METHOD_ICONS } from '../types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function DashboardPage() {
  const { transactions, addTransaction } = useTransactions()
  const { paymentMethods } = usePaymentMethods()
  const [showAdd, setShowAdd] = useState(false)

  const thisMonth = format(new Date(), 'yyyy-MM')
  const monthTx = transactions.filter(t => t.date.startsWith(thisMonth))

  const income = monthTx.filter(t => t.type === 'income' && !t.is_charge).reduce((s, t) => s + t.amount, 0)
  const expense = monthTx.filter(t => t.type === 'expense' && !t.is_charge).reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const fmtYen = (n: number) => '¥' + Math.round(n).toLocaleString('ja-JP')

  const recentTx = transactions.slice(0, 8)

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* 月次サマリ */}
      <div className="mb-1">
        <p className="text-ink-500 text-xs mb-3">
          {format(new Date(), 'yyyy年M月', { locale: ja })}
        </p>
        <p className={`text-4xl font-semibold font-mono ${balance >= 0 ? 'text-sage-300' : 'text-coral-300'}`}>
          {balance >= 0 ? '+' : ''}{fmtYen(balance)}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-ink-500 text-xs">収入</p>
            <p className="text-sage-400 font-mono font-medium">{fmtYen(income)}</p>
          </div>
          <div className="w-px bg-ink-800" />
          <div>
            <p className="text-ink-500 text-xs">支出</p>
            <p className="text-coral-300 font-mono font-medium">{fmtYen(expense)}</p>
          </div>
        </div>
      </div>

      {/* 収支バー */}
      {(income > 0 || expense > 0) && (
        <div className="mt-4 h-2 bg-ink-800 rounded-full overflow-hidden flex">
          {income > 0 && (
            <div
              className="h-full bg-sage-400 rounded-full"
              style={{ width: `${Math.round((income / (income + expense)) * 100)}%` }}
            />
          )}
        </div>
      )}

      {/* 追加ボタン */}
      <button
        onClick={() => setShowAdd(true)}
        className="w-full mt-5 flex items-center justify-center gap-2 border border-ink-700 hover:border-ink-500 rounded-2xl py-3 text-ink-400 hover:text-ink-200 text-sm transition-all"
      >
        <Plus className="w-4 h-4" />
        取引を追加
      </button>

      {/* 直近の取引 */}
      <div className="mt-6">
        <p className="text-ink-500 text-xs font-medium mb-3">直近の取引</p>
        {recentTx.length === 0 ? (
          <div className="text-center py-10 text-ink-600 text-sm">取引がまだありません</div>
        ) : (
          <div className="space-y-1">
            {recentTx.map(tx => {
              const pm = paymentMethods.find(p => p.id === tx.payment_method_id)
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-ink-800">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={pm ? { background: pm.color + '22' } : { background: '#2a2820' }}
                  >
                    {pm ? PAYMENT_METHOD_ICONS[pm.type] : '💴'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-100 text-sm truncate">{tx.note}</p>
                    <p className="text-ink-600 text-xs">
                      {tx.category}
                      {tx.is_charge && ' · チャージ'}
                      {pm && ` · ${pm.name}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-mono font-medium ${
                      tx.is_charge ? 'text-amber-200' : tx.type === 'income' ? 'text-sage-400' : 'text-coral-300'
                    }`}>
                      {tx.is_charge ? '⚡' : tx.type === 'income' ? '+' : '-'}{fmtYen(tx.amount)}
                    </p>
                    <p className="text-ink-700 text-xs">{tx.date.slice(5)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddTransactionModal
          paymentMethods={paymentMethods}
          onAdd={addTransaction as any}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
