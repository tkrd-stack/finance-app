import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PaymentsPage from './pages/PaymentsPage'
import TransactionsPage from './pages/TransactionsPage'
import { LayoutDashboard, CreditCard, List, TrendingUp, LogOut } from 'lucide-react'

function AppLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'ホーム' },
    { to: '/payments', icon: CreditCard, label: '支払い' },
    { to: '/transactions', icon: List, label: '取引' },
  ]

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-ink-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sage-400 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-ink-900" strokeWidth={2.5} />
          </div>
          <span className="text-ink-50 font-semibold text-sm tracking-tight">家計簿</span>
        </div>
        <div className="flex items-center gap-3">
          {user?.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              className="w-7 h-7 rounded-full border border-ink-700"
            />
          )}
          <button
            onClick={signOut}
            className="text-ink-600 hover:text-ink-400 transition-colors"
            aria-label="ログアウト"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-ink-900 border-t border-ink-800 px-2 pb-safe">
        <div className="max-w-xl mx-auto flex">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-sage-400' : 'text-ink-600 hover:text-ink-400'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-ink-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
