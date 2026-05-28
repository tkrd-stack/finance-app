# 家計簿アプリ — セットアップガイド

React + Supabase + Google OAuth で動作する個人収支管理アプリです。

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **スタイル**: Tailwind CSS (Sora フォント)
- **バックエンド/DB**: Supabase (PostgreSQL + Row Level Security)
- **認証**: Supabase Auth + Google OAuth

## 機能

- Google アカウントでログイン
- 収入・支出の記録（カテゴリ管理）
- **支払い方法管理**
  - 現金 / クレジットカード / デビットカード
  - 電子マネー (Suica, PASMO, nanaco, WAON...)
  - QR決済 (PayPay, LINE Pay, 楽天ペイ...)
  - 銀行振込
- クレジットカード: 締め日・引落日・限度額・未払い残高の追跡
- 電子マネー: チャージ記録・残高の自動計算
- 取引フィルター（種別・支払い方法・月）

---

## セットアップ手順

### 1. Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. `supabase_schema.sql` の内容を **SQL Editor** で実行

### 2. Google OAuth の設定

**Google Cloud Console:**
1. [console.cloud.google.com](https://console.cloud.google.com) でプロジェクト作成
2. 「APIとサービス」→「認証情報」→「OAuthクライアントID」を作成
3. アプリの種類: **ウェブアプリケーション**
4. 承認済みリダイレクト URI:
   ```
   https://<your-project>.supabase.co/auth/v1/callback
   ```
5. クライアントID / シークレットを控える

**Supabase Dashboard:**
1. Authentication → Providers → Google を有効化
2. 上記のクライアントID / シークレットを入力して保存

### 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...（anon key）
```

Supabase Dashboard → Settings → API から取得できます。

### 4. 開発サーバーの起動

```bash
npm install
npm run dev
```

`http://localhost:5173` でアクセスできます。

### 5. 本番ビルド

```bash
npm run build
# dist/ フォルダをホスティングサービスにデプロイ
```

Vercel / Netlify / Cloudflare Pages にそのままデプロイ可能です。

---

## ファイル構成

```
src/
├── components/
│   ├── AddPaymentMethodModal.tsx  # 支払い方法追加モーダル
│   ├── AddTransactionModal.tsx    # 取引追加モーダル
│   └── PaymentMethodCard.tsx     # 支払い方法カード
├── hooks/
│   ├── useAuth.tsx                # Google認証
│   ├── useTransactions.ts        # 取引CRUD
│   └── usePaymentMethods.ts      # 支払い方法CRUD + 残高計算
├── lib/
│   └── supabase.ts               # Supabaseクライアント
├── pages/
│   ├── LoginPage.tsx             # ログイン画面
│   ├── DashboardPage.tsx         # ホーム
│   ├── PaymentsPage.tsx          # 支払い方法管理
│   └── TransactionsPage.tsx      # 取引一覧
└── types/
    └── index.ts                  # 型定義・定数
```
# finance-app
