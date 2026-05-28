import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Transaction } from '../types'
import { useAuth } from './useAuth'

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    if (error) setError(error.message)
    else setTransactions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return
    const payload = {
      ...tx,
      user_id: user.id,
      payment_method_id: tx.payment_method_id ?? null,
      is_charge: tx.is_charge ?? false,
    }
    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => [data, ...prev])
    return data
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  return { transactions, loading, error, addTransaction, deleteTransaction, updateTransaction, refetch: fetch }
}
