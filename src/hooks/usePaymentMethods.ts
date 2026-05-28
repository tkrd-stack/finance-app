import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PaymentMethod } from '../types'
import { useAuth } from './useAuth'

export function usePaymentMethods() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setPaymentMethods(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const addPaymentMethod = async (pm: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{ ...pm, user_id: user.id }])
      .select()
      .single()
    if (error) throw error
    setPaymentMethods(prev => [...prev, data])
    return data
  }

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPaymentMethods(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  const deletePaymentMethod = async (id: string) => {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
    if (error) throw error
    setPaymentMethods(prev => prev.filter(p => p.id !== id))
  }

  // クレジットカードの当月未払い残高を計算
  const getUnpaidBalance = (
    pm: PaymentMethod,
    transactions: Array<{ payment_method_id: string | null; type: string; amount: number; date: string }>
  ): number | null => {
    if (pm.type !== 'credit') return null
    const now = new Date()
    const closingDay = pm.closing_day ?? 25

    // 締め日基準で「現在の請求期間」を計算
    let periodStart: Date
    let periodEnd: Date
    if (now.getDate() <= closingDay) {
      // 今月締め日前: 先月締め日翌日〜今月締め日
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, closingDay + 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth(), closingDay)
    } else {
      // 今月締め日後: 今月締め日翌日〜来月締め日
      periodStart = new Date(now.getFullYear(), now.getMonth(), closingDay + 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, closingDay)
    }

    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    return transactions
      .filter(t =>
        t.payment_method_id === pm.id &&
        t.type === 'expense' &&
        t.date >= fmt(periodStart) &&
        t.date <= fmt(periodEnd)
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // 電子マネー残高を計算（チャージ - 支出）
  const getEmoneyBalance = (
    pm: PaymentMethod,
    transactions: Array<{ payment_method_id: string | null; type: string; amount: number; is_charge: boolean }>
  ): number => {
    const initial = pm.balance ?? 0
    const charges = transactions
      .filter(t => t.payment_method_id === pm.id && t.is_charge)
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter(t => t.payment_method_id === pm.id && t.type === 'expense' && !t.is_charge)
      .reduce((sum, t) => sum + t.amount, 0)
    return initial + charges - expenses
  }

  return {
    paymentMethods,
    loading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getUnpaidBalance,
    getEmoneyBalance,
    refetch: fetch,
  }
}
