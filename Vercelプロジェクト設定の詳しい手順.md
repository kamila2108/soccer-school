# Vercelプロジェクト設定の詳しい手順

このドキュメントでは、Vercelでプロジェクトをインポートした後の設定方法を、初心者向けに画面の見つけ方から詳しく説明します。

---

## 📍 はじめに：設定画面はどこにある？

Vercelでプロジェクトをインポートした後、設定を変更する方法は**2つ**あります：

1. **インポート直後の設定画面**（初回のみ）
2. **プロジェクト作成後の設定画面**（後から変更する場合）

どちらの場合でも、設定内容は同じです。このドキュメントでは、両方の方法を説明します。

---

## 🎯 方法1: インポート直後の設定（推奨）

### ステップ1: プロジェクトをインポート

1. Vercelのダッシュボード（https://vercel.com/dashboard）にアクセス
2. 左上の「**Add New...**」ボタンをクリック
3. メニューから「**Project**」を選択
4. GitHubリポジトリの一覧が表示されるので、インポートしたいリポジトリを選択
5. 「**Import**」ボタンをクリック

### ステップ2: 設定画面が表示される

インポートボタンをクリックすると、以下のような設定画面が表示されます：

```
┌─────────────────────────────────────────┐
│  Configure Project                      │
├─────────────────────────────────────────┤
│                                         │
│  Framework Preset: [Next.js ▼]         │
│                                         │
│  Root Directory: [./        ] [Edit]   │
│                                         │
│  Build and Output Settings             │
│  ┌─────────────────────────────────┐   │
│  │ Build Command: npm run build    │   │
│  │ Output Directory:               │   │
│  │ Install Command: npm install    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Environment Variables                  │
│  ┌─────────────────────────────────┐   │
│  │ (環境変数の設定エリア)          │   │
│  └─────────────────────────────────┘   │
│                                         │
│              [Deploy]                   │
└─────────────────────────────────────────┘
```

**この画面が見つからない場合**は、方法2を参照してください。

---

## ⚙️ ステップ3: Root Directoryの設定

### 3-1. Root Directoryとは？

**Root Directory**（ルートディレクトリ）とは、Vercelがプロジェクトのコードを探す場所です。

このプロジェクトでは、コードが `frontend` フォルダに入っているため、`frontend` と設定する必要があります。

### 3-2. 設定手順

1. 設定画面で「**Root Directory**」の右側にある「**Edit**」ボタンをクリック
   - もし「Edit」ボタンが見当たらない場合は、Root Directoryの入力欄をクリックしてください

2. 入力欄に `frontend` と入力します
   - **重要**: `./frontend` や `/frontend` ではなく、`frontend` とだけ入力してください

3. 「**Continue**」または「**Save**」ボタンをクリック

### 3-3. 確認方法

設定が正しく反映されているか確認するには：
- Root Directoryの入力欄に `frontend` と表示されていることを確認
- もし `./` や空欄のままの場合は、再度 `frontend` と入力してください

---

## 🔧 ステップ4: Build and Output Settingsの設定

### 4-1. Build and Output Settingsとは？

**Build and Output Settings**（ビルドと出力設定）は、Vercelがアプリケーションをビルド（構築）する際のコマンドを設定する場所です。

### 4-2. 設定項目の説明

設定画面には、以下の3つの項目があります：

| 項目 | 説明 | 設定値 |
|------|------|--------|
| **Build Command** | ビルドを実行するコマンド | `npm run build` |
| **Output Directory** | ビルド結果の出力先 | **空欄のまま** |
| **Install Command** | 依存関係をインストールするコマンド | `npm install` |

### 4-3. 設定手順

#### Build Commandの確認

1. 「Build Command」の入力欄を確認
2. `npm run build` と表示されていることを確認
3. もし違う値が入っている場合は、`npm run build` に変更

#### Output Directoryの設定（重要！）

1. 「Output Directory」の入力欄を確認
2. **空欄になっていることを確認**（何も入力されていない状態）
3. もし `.next` や `out` などの値が入っている場合は、**すべて削除して空欄にしてください**

**⚠️ なぜ空欄にするの？**

Next.jsの場合、Vercelが自動的に正しい出力ディレクトリを検出します。手動で設定すると、404エラーが発生する原因になります。

#### Install Commandの確認

1. 「Install Command」の入力欄を確認
2. `npm install` と表示されていることを確認
3. もし違う値が入っている場合は、`npm install` に変更

### 4-4. その他の設定オプション

設定画面には、他にも以下のようなオプションが表示される場合があります：

#### オプション1: "Include files outside the root directory in the Build Step"

**設定**: **Disabled（無効）** を選択してください

**理由**:
- Root Directoryが `frontend` に設定されている場合、このオプションを有効にすると、`backend` フォルダなど、`frontend` フォルダの外にあるファイルもビルドに含まれる可能性があります
- しかし、Next.jsのビルドには `frontend` フォルダ内のファイルのみが必要です
- 不要なファイルを含めると、ビルドが遅くなったり、エラーが発生する可能性があります

**設定方法**:
- このオプションが表示されている場合、**Disabled（無効）** または **OFF** にしてください

#### オプション2: "Skip deployments when there are no changes to the root directory or its dependencies"

**設定**: **Enabled（有効）** を選択してください（推奨）

**理由**:
- このオプションを有効にすると、`frontend` フォルダやその依存関係（`package.json`など）に変更がない場合、自動的にデプロイをスキップします
- 不要なデプロイを避けられるため、ビルド時間とリソースを節約できます
- `backend` フォルダだけを変更した場合など、フロントエンドに影響がない変更ではデプロイされません

**設定方法**:
- このオプションが表示されている場合、**Enabled（有効）** または **ON** にしてください

**注意**: 初回デプロイ時や、確実にデプロイしたい場合は、一時的に **Disabled（無効）** にすることもできます

### 4-5. 設定の確認チェックリスト

設定が完了したら、以下を確認してください：

- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: **空欄**（何も入力されていない）
- [ ] Install Command: `npm install`
- [ ] Include files outside the root directory: **Disabled（無効）**
- [ ] Skip deployments when no changes: **Enabled（有効）**（推奨）

---

## 🎯 方法2: プロジェクト作成後の設定変更

もし、プロジェクトをすでに作成してしまい、設定画面が見当たらない場合は、以下の手順で後から設定を変更できます。

### ステップ1: プロジェクトの設定画面を開く

1. Vercelのダッシュボード（https://vercel.com/dashboard）にアクセス
2. 設定を変更したいプロジェクトをクリック
3. プロジェクトのページが開いたら、上部のタブから「**Settings**」をクリック
   - タブは以下のような並びになっています：
     ```
     [Overview] [Deployments] [Analytics] [Settings] [Insights]
     ```

### ステップ2: General設定を開く

1. Settingsページの左側にメニューが表示されます
2. 「**General**」をクリック
   - もし「General」が見当たらない場合は、一番上にある項目をクリックしてください

### ステップ3: Root Directoryの設定

1. 「General」ページを下にスクロール
2. 「**Root Directory**」というセクションを探す
3. 「Root Directory」の右側にある「**Edit**」ボタンをクリック
4. 入力欄に `frontend` と入力
5. 「**Save**」ボタンをクリック

### ステップ4: Build and Output Settingsの設定

1. 「General」ページをさらに下にスクロール
2. 「**Build and Output Settings**」というセクションを探す
3. 「Build and Output Settings」の右側にある「**Override**」ボタンをクリック
   - もし「Override」ボタンが見当たらない場合は、各項目の右側にある「Edit」ボタンをクリック

4. 以下の設定を確認・変更：
   - **Build Command**: `npm run build`
   - **Output Directory**: **空欄のまま**（何も入力しない）
   - **Install Command**: `npm install`

5. 「**Save**」ボタンをクリック

---

## 🔍 設定が見つからない場合の対処法

### 問題1: 「Root Directory」が見つからない

**原因**: VercelのUIが更新され、表示方法が変わった可能性があります。

**対処法**:
1. Settingsページの「General」セクションを確認
2. ページを下にスクロールして、すべての設定項目を確認
3. もし見つからない場合は、Vercelのサポートに問い合わせるか、以下の方法を試してください：
   - プロジェクトを削除して、再度インポートする（方法1を使用）
   - Vercel CLIを使用して設定する（上級者向け）

### 問題2: 「Build and Output Settings」が見つからない

**対処法**:
1. Settingsページの「General」セクションを確認
2. 「Build and Output Settings」という文字列を探す
3. もし見つからない場合は、「Build Settings」や「Build Configuration」という名前で表示されている可能性があります

### 問題3: 「Edit」ボタンや「Override」ボタンが見つからない

**対処法**:
1. 設定項目の右側を確認（マウスをホバーすると表示される場合があります）
2. 設定項目自体をクリックしてみる（クリックで編集モードになる場合があります）
3. 設定項目の右側にある「...」（三点メニュー）をクリックしてみる

---

## ✅ 設定完了後の確認

### 確認方法1: 設定画面で確認

1. Settings → General を開く
2. 以下の設定が正しく表示されていることを確認：
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: （空欄または表示されていない）
   - Install Command: `npm install`

### 確認方法2: デプロイログで確認

1. デプロイを実行（「Deploy」ボタンをクリック）
2. 「Deployments」タブを開く
3. 最新のデプロイをクリック
4. 「Build Logs」を確認
5. ログに以下のような行が表示されていれば、設定は正しいです：
   ```
   Installing dependencies...
   Running "npm run build" in /vercel/path0/frontend
   ```

---

## 🚨 よくある間違いと対処法

### 間違い1: Root Directoryを `./frontend` と設定した

**問題**: スラッシュ（`/`）やドット（`.`）を含めると、正しく認識されない場合があります。

**対処法**: `frontend` とだけ入力してください（スラッシュやドットなし）

### 間違い2: Output Directoryに `.next` と設定した

**問題**: Next.jsの場合、Output Directoryを手動で設定すると404エラーが発生します。

**対処法**: Output Directoryを**空欄**にしてください

### 間違い3: Root Directoryを設定し忘れた

**問題**: Root Directoryが空欄や `./` のままの場合、Vercelがプロジェクトのルート（`soccer`フォルダ）を探してしまい、`frontend`フォルダ内のコードを見つけられません。

**対処法**: Root Directoryに `frontend` と設定してください

---

## 📸 画面の見つけ方（補足）

### Vercelダッシュボードの構造

```
┌─────────────────────────────────────────┐
│  Vercel Logo    [Dashboard] [Projects] │  ← 上部メニュー
├─────────────────────────────────────────┤
│                                         │
│  [Add New...] ボタン                   │  ← ここからプロジェクトを追加
│                                         │
│  プロジェクト一覧                        │
│  ┌─────────────┐  ┌─────────────┐    │
│  │ Project 1   │  │ Project 2   │    │
│  └─────────────┘  └─────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### プロジェクトページの構造

プロジェクトをクリックすると、以下のようなページが表示されます：

```
┌─────────────────────────────────────────┐
│  Project Name                            │
├─────────────────────────────────────────┤
│ [Overview] [Deployments] [Settings] ... │  ← タブ
├─────────────────────────────────────────┤
│                                         │
│  Settings ページの内容                   │
│  ┌─────────────────────────────────┐   │
│  │ General                         │   │  ← 左側メニュー
│  │ Environment Variables           │   │
│  │ Domains                         │   │
│  │ ...                             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  設定項目がここに表示される              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🆘 それでも解決しない場合

### サポートに問い合わせる

1. Vercelのサポートページにアクセス: https://vercel.com/support
2. 問題の詳細を説明：
   - どの設定項目が見つからないか
   - どの画面まで進めたか
   - エラーメッセージがあれば、その内容

### 代替方法: プロジェクトを再作成

1. 既存のプロジェクトを削除（Settings → General → Delete Project）
2. 再度プロジェクトをインポート（方法1を使用）
3. 今度は設定画面で正しく設定する

---

## 📝 まとめ

### 設定のポイント

1. **Root Directory**: `frontend` と設定
2. **Build Command**: `npm run build` と設定
3. **Output Directory**: **空欄のまま**（重要！）
4. **Install Command**: `npm install` と設定

### 設定画面の見つけ方

- **初回**: プロジェクトをインポートした直後の画面
- **後から変更**: Settings → General

### 確認方法

- Settings → General で設定を確認
- デプロイログで正しく認識されているか確認

---

**設定が完了したら、環境変数を設定してデプロイを実行してください！** 🚀
