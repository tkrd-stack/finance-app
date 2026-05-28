import { useState } from 'react'
import { X } from 'lucide-react'
import {
  PaymentMethodType,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS,
  DEFAULT_PAYMENT_COLORS,
} from '../types'

interface Props {
  onAdd: (data: {
    name: string
    type: PaymentMethodType
    color: string
    closing_day: number | null
    payment_day: number | null
    credit_limit: number | null
    balance: number | null
  }) => Promise<void>
  onClose: () => void
}

const TYPES: PaymentMethodType[] = ['cash', 'credit', 'debit', 'emoney', 'qr', 'bank_transfer']

const PRESET_NAMES: Record<PaymentMethodType, string[]> = {
  cash: ['財布', '小口現金'],
  credit: ['楽天カード', 'PayPayカード', '三井住友カード', 'JCBカード', 'Visaカード'],
  debit: ['住信SBIデビット', '楽天デビット'],
  emoney: ['Suica', 'PASMO', 'nanaco', 'WAON', '楽天Edy'],
  qr: ['PayPay', 'LINE Pay', '楽天ペイ', 'd払い', 'メルペイ'],
  bank_transfer: ['銀行振込', 'ゆうちょ銀行'],
}

export function AddPaymentMethodModal({ onAdd, onClose }: Props) {
  const [type, setType] = useState<PaymentMethodType>('credit')
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_PAYMENT_COLORS['credit'])
  const [closingDay, setClosingDay] = useState<string>('25')
  const [paymentDay, setPaymentDay] = useState<string>('27')
  const [creditLimit, setCreditLimit] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [saving, setSaving] = useState(false)

  const handleTypeChange = (t: PaymentMethodType) => {
    setType(t)
    setColor(DEFAULT_PAYMENT_COLORS[t])
    setName('')
  }

  const handleSubmit = async () => {
    if (!name.trim()) return alert('名前を入力してください')
    setSaving(true)
    try {
      await onAdd({
        name: name.trim(),
        type,
        color,
        closing_day: type === 'credit' ? parseInt(closingDay) || null : null,
        payment_day: type === 'credit' ? parseInt(paymentDay) || null : null,
        credit_limit: type === 'credit' && creditLimit ? parseInt(creditLimit) : null,
        balance: (type === 'emoney' || type === 'qr') ? parseInt(balance) || 0 : null,
      })
      onClose()
    } catch (e) {
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
      <div className="bg-ink-800 border border-ink-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-ink-700">
          <h2 className="text-ink-50 font-medium">支払い方法を追加</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 種別選択 */}
          <div>
            <label className="text-ink-400 text-xs mb-2 block">種別</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${
                    type === t
                      ? 'border-sage-400 bg-sage-400/10 text-sage-400'
                      : 'border-ink-700 text-ink-500 hover:border-ink-500'
                  }`}
                >
                  <span className="text-lg">{PAYMENT_METHOD_ICONS[t]}</span>
                  <span>{PAYMENT_METHOD_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 名前 */}
          <div>
            <label className="text-ink-400 text-xs mb-2 block">名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`例: ${PRESET_NAMES[type][0]}`}
              className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_NAMES[type].map(p => (
                <button
                  key={p}
                  onClick={() => setName(p)}
                  className="text-xs px-2.5 py-1 bg-ink-700 hover:bg-ink-600 text-ink-400 rounded-lg transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* カラー */}
          <div>
            <label className="text-ink-400 text-xs mb-2 block">カラー</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-ink-500 text-xs font-mono">{color}</span>
            </div>
          </div>

          {/* クレジット専用 */}
          {type === 'credit' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-ink-400 text-xs mb-1.5 block">締め日</label>
                  <select
                    value={closingDay}
                    onChange={e => setClosingDay(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
                  >
                    {[5,10,15,20,25,31].map(d => (
                      <option key={d} value={d}>{d}日</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-ink-400 text-xs mb-1.5 block">引落日</label>
                  <select
                    value={paymentDay}
                    onChange={e => setPaymentDay(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
                  >
                    {[1,2,3,4,5,10,15,20,25,27].map(d => (
                      <option key={d} value={d}>{d}日</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-ink-400 text-xs mb-1.5 block">利用限度額（省略可）</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">¥</span>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    placeholder="300000"
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-7 pr-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 電子マネー/QR専用 */}
          {(type === 'emoney' || type === 'qr') && (
            <div>
              <label className="text-ink-400 text-xs mb-1.5 block">現在残高</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 text-sm">¥</span>
                <input
                  type="number"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-7 pr-3 py-2.5 text-ink-50 text-sm focus:outline-none focus:border-ink-500"
                />
              </div>
              <p className="text-ink-600 text-xs mt-1.5">
                チャージや支出を記録すると残高が自動更新されます
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-sage-500 hover:bg-sage-400 text-ink-900 font-medium py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? '保存中...' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}
