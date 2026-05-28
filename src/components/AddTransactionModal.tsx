import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import { TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS } from '../types'
import { PaymentMethod } from '../types'
import { format } from 'date-fns'

interface Props {
  paymentMethods: PaymentMethod[]
  onAdd: (data: {
    type: TransactionType
    category: string
    note: string
    amount: number
    date: string
    payment_method_id: string | null
    is_charge: boolean
  }) => Promise<void>
  onClose: () => void
}

export function AddTransactionModal({ paymentMethods, onAdd, onClose }: Props) {
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentMethodId, setPaymentMethodId] = useState<string>('')
  const [isCharge, setIsCharge] = useState(false)
  const [saving, setSaving] = useState(false)

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const selectedPM = paymentMethods.find(pm => pm.id === paymentMethodId)
  const showChargeToggle = selectedPM && (selectedPM.type === 'emoney' || selectedPM.type === 'qr') && type === 'expense'

  const handleTypeChange = (t: TransactionType) => {
    setType(t)
    setCategory(t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
    setIsCharge(false)
  }

  const handleSubmit = async () => {
    const n = parseFloat(amount)
    if (!n || n <= 0) return alert('金額を入力してください')
    setSaving(true)
    try {
      await onAdd({
        type,
        category,
        note: note.trim() || category,
        amount: n,
        date,
        payment_method_id: paymentMethodId || null,
        is_charge: isCharge,
      })
      onClose()
    } catch {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ink-800 border border-ink-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-ink-700">
          <h2 className="text-ink-50 font-medium">取引を追加</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 収入/支出トグル */}
          <div className="grid grid-cols-2 border border-ink-700 rounded-xl overflow-hidden">
            {(['income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`py-2.5 text-sm font-medium transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'bg-sage-500 text-ink-900'
                      : 'bg-coral-400 text-ink-900'
                    : 'text-ink-500 hover:text-ink-300'
                }`}
              >
                {t === 'income' ? '＋ 収入' : '－ 支出'}
              </button>
            ))}
          </div>

          {/* 支払い方法 */}
          <div>
            <label className="text-ink-400 text-xs mb-2 block">支払い方法</label>
            <select
              value={paymentMethodId}
              onChange={e => { setPaymentMethodId(e.target.value); setIsCharge(false) }}
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
            >
              <option value="">未分類</option>
              {paymentMethods.map(pm => (
                <option key={pm.id} value={pm.id}>
                  {PAYMENT_METHOD_ICONS[pm.type]} {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* 電子マネーチャージトグル */}
          {showChargeToggle && (
            <button
              onClick={() => setIsCharge(!isCharge)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                isCharge
                  ? 'bg-amber-200/10 border-amber-200/40 text-amber-200'
                  : 'border-ink-700 text-ink-500 hover:border-ink-500'
              }`}
            >
              <Zap className="w-4 h-4" />
              {isCharge ? 'チャージとして記録中' : 'チャージとして記録する'}
              <span className="ml-auto text-xs opacity-60">
                {isCharge ? '残高に加算されます' : '通常の支出として記録'}
              </span>
            </button>
          )}

          {/* カテゴリ */}
          <div>
            <label className="text-ink-400 text-xs mb-2 block">カテゴリ</label>
            <div className="grid grid-cols-3 gap-1.5">
              {cats.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2 py-2 rounded-xl text-xs transition-all border ${
                    category === c
                      ? type === 'income'
                        ? 'bg-sage-500/20 border-sage-500/50 text-sage-400'
                        : 'bg-coral-400/20 border-coral-400/50 text-coral-300'
                      : 'border-ink-700 text-ink-500 hover:border-ink-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="text-ink-400 text-xs mb-1.5 block">メモ（省略可）</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={category}
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
            />
          </div>

          {/* 金額・日付 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-ink-400 text-xs mb-1.5 block">金額</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">¥</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-7 pr-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
                />
              </div>
            </div>
            <div>
              <label className="text-ink-400 text-xs mb-1.5 block">日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
              type === 'income'
                ? 'bg-sage-500 hover:bg-sage-400 text-ink-900'
                : 'bg-coral-400 hover:bg-coral-300 text-ink-900'
            }`}
          >
            {saving ? '保存中...' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}
