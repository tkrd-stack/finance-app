import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { PAYMENT_METHOD_ICONS } from '../types'
import { format } from 'date-fns'

export default function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions()
  const { paymentMethods } = usePaymentMethods()
  const [showAdd, setShowAdd] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterPM, setFilterPM] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('')

  const fmtYen = (n: number) => '¥' + Math.round(n).toLocaleString('ja-JP')

  // 月の一覧
  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse()

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterPM !== 'all' && t.payment_method_id !== filterPM) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    return true
  })

  // 日付でグループ化
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, t) => {
    ;(acc[t.date] = acc[t.date] || []).push(t)
    return acc
  }, {})

  const sortedDates = Object.keys(groups).sort().reverse()

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-ink-50 text-xl font-semibold">取引一覧</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="w-8 h-8 flex items-center justify-center bg-ink-800 hover:bg-ink-700 border border-ink-700 rounded-xl transition-colors"
          aria-label="追加"
        >
          <Plus className="w-4 h-4 text-ink-300" />
        </button>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          className="bg-ink-800 border border-ink-700 rounded-xl px-3 py-1.5 text-ink-300 text-xs focus:outline-none flex-shrink-0"
        >
          <option value="all">すべて</option>
          <option value="income">収入</option>
          <option value="expense">支出</option>
        </select>
        <select
          value={filterPM}
          onChange={e => setFilterPM(e.target.value)}
          className="bg-ink-800 border border-ink-700 rounded-xl px-3 py-1.5 text-ink-300 text-xs focus:outline-none flex-shrink-0"
        >
          <option value="all">全支払い方法</option>
          <option value="">未分類</option>
          {paymentMethods.map(pm => (
            <option key={pm.id} value={pm.id}>
              {PAYMENT_METHOD_ICONS[pm.type]} {pm.name}
            </option>
          ))}
        </select>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="bg-ink-800 border border-ink-700 rounded-xl px-3 py-1.5 text-ink-300 text-xs focus:outline-none flex-shrink-0"
        >
          <option value="">全期間</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* 件数 */}
      <p className="text-ink-600 text-xs mb-3">{filtered.length}件</p>

      {/* 取引リスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-600 text-sm">取引がありません</div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map(date => {
            const dayTx = groups[date]
            const dayTotal = dayTx.reduce((s, t) => s + (t.type === 'expense' && !t.is_charge ? -t.amount : t.is_charge ? 0 : t.amount), 0)
            return (
              <div key={date}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <p className="text-ink-500 text-xs">{date.slice(5).replace('-', '月')}日</p>
                  <p className={`text-xs font-mono ${dayTotal >= 0 ? 'text-sage-500' : 'text-coral-400'}`}>
                    {dayTotal >= 0 ? '+' : ''}{fmtYen(dayTotal)}
                  </p>
                </div>
                <div className="space-y-1">
                  {dayTx.map(tx => {
                    const pm = paymentMethods.find(p => p.id === tx.payment_method_id)
                    return (
                      <div key={tx.id} className="flex items-center gap-3 bg-ink-800 rounded-xl px-3 py-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                          style={pm ? { background: pm.color + '22' } : { background: '#2a2820' }}
                        >
                          {pm ? PAYMENT_METHOD_ICONS[pm.type] : '💴'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-ink-100 text-sm truncate">{tx.note}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-ink-600 text-xs">{tx.category}</span>
                            {tx.is_charge && (
                              <span className="text-amber-300 text-xs bg-amber-300/10 px-1.5 rounded-md">チャージ</span>
                            )}
                            {pm && <span className="text-ink-700 text-xs">· {pm.name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className={`text-sm font-mono font-medium ${
                            tx.is_charge ? 'text-amber-200' : tx.type === 'income' ? 'text-sage-400' : 'text-coral-300'
                          }`}>
                            {tx.is_charge ? '⚡' : tx.type === 'income' ? '+' : '-'}{fmtYen(tx.amount)}
                          </p>
                          <button
                            onClick={() => { if (confirm('削除しますか？')) deleteTransaction(tx.id) }}
                            className="text-ink-700 hover:text-coral-400 transition-colors"
                            aria-label="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

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
