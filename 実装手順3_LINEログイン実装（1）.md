# LINEログイン実装（1） 実装手順（初心者向け）

## 📚 このガイドについて

このガイドは、**2/5（木）: LINEログイン実装（1）**の作業を初心者の方でも理解できるように、**用語の説明**や**各ステップの詳細**を丁寧に記載しています。

**所要時間**: 約2〜3時間（初めての場合）

---

## 📖 用語集（最初に読んでおくと理解が深まります）

### LINEログインに関する用語

- **LINE Developers**: LINEの開発者向けプラットフォーム。LINEログインなどの機能を使うために必要です。
- **チャネル**: LINEのサービスを識別するためのID。LINEログインを使うには、チャネルを作成する必要があります。
- **チャネルID**: チャネルを識別するための一意のID。公開しても安全です。
- **チャネルシークレット**: チャネルを認証するための秘密鍵。**絶対に公開してはいけません**。
- **コールバックURL**: LINE認証が完了した後、ユーザーをリダイレクトするURL。認証結果を受け取るためのURLです。
- **OAuth 2.0**: 安全にログイン機能を実装するための標準的な仕組み。LINEログインはOAuth 2.0を使用しています。

### NextAuth.jsに関する用語

- **NextAuth.js**: Next.jsで認証機能を簡単に実装できるライブラリ。LINEログインなどのOAuth認証を簡単に扱えます。
- **プロバイダー**: 認証方法（LINE、Google、GitHubなど）。NextAuth.jsでは、複数のプロバイダーを設定できます。
- **セッション**: ログイン状態を保持する仕組み。ユーザーがログインしている間、セッション情報が保存されます。

---

## 📋 今日（2/5）の作業内容

開発スケジュールの「2/5（木）: LINEログイン実装（1）」を完了するためのステップバイステップガイドです。

**目標**: LINE Developersの設定とNextAuth.jsの導入を完了し、LINEログインの基本設定を行う

**作成するもの**:
1. LINE Developersアカウントとチャネル
2. NextAuth.jsの設定ファイル
3. LINEプロバイダーの設定

---

## ✅ ステップ1: LINE Developers の設定

### 1-1. LINE Developersアカウントの作成とログイン

**目的**: LINEの開発者向けサービスを使うためのアカウントを作成し、LINE Developers Consoleにアクセスします。

**LINE Developers Consoleとは？**: 
- LINE Developersのウェブサイト（https://developers.line.biz/）にログインした画面のことです
- 別途「Console」を作成する必要はありません
- ログインすると自動的にLINE Developers Consoleが表示されます

**手順**:

1. **LINE Developersにアクセス**
   - ブラウザで https://developers.line.biz/ にアクセス
   - 「ログイン」をクリック

2. **LINEアカウントでログイン**
   - 既存のLINEアカウントでログインします
   - LINEアカウントがない場合は、先にLINEアプリでアカウントを作成してください

3. **開発者情報の登録（初回ログイン時のみ）**
   - 初回ログインの場合、「Enter your information and select "Create my account"」という画面が表示されます
   - この画面で開発者情報を入力します：
     - **名前**: あなたの名前（任意、後で変更可能）
     - **メールアドレス**: 連絡先のメールアドレス（任意、後で変更可能）
     - **国・地域**: 日本を選択
   - 「Create my account」または「アカウントを作成」ボタンをクリック
   - ⚠️ **注意**: 「You can still change your developer information later.」と表示されている通り、後で変更可能です

4. **利用規約に同意（表示される場合）**
   - 利用規約が表示される場合があります
   - 利用規約を読んで同意します
   - 「同意する」をクリック

5. **LINE Developers Consoleが表示される**
   - 登録完了後、「Hi, みら! Welcome to the LINE Developers Console.」のようなウェルカム画面が表示されます
   - これがLINE Developers Consoleです
   - ✅ **この時点で、LINE Developers Consoleにアクセスできています**

**現在の状態**: ✅ LINE Developersアカウントが作成され、LINE Developers Consoleにアクセスできました

**次のステップ**: プロバイダーを作成します（ステップ1-2）。プロバイダーを作成しないと、チャネルを作成できません。

---

### 1-2. プロバイダーの作成

**目的**: LINE Developersでプロジェクト（プロバイダー）を作成します。

**⚠️ 重要**: **プロバイダーは必ず作成する必要があります**。プロバイダーを作成しないと、LINE Loginチャネルなどのチャネルを作成できません。

**プロバイダーとは？**: LINEのサービスを管理する単位です。1つのプロバイダーに複数のチャネルを作成できます。

**手順**:

1. **プロバイダー一覧ページを開く**
   - ログイン後、画面上部または左側のメニューから「プロバイダー」をクリック
   - または、トップページ（Welcome画面）から「プロバイダーを作成」ボタンをクリック
   - 初回アクセスの場合、「プロバイダーを作成」ボタンが大きく表示されているはずです

2. **新しいプロバイダーを作成**
   - 「プロバイダーを作成」ボタンをクリック
   - **プロバイダー名**: `サッカー教室`（任意の名前でOK）
     - 例: `サッカー教室`、`Soccer School`、`My Soccer App`など
   - **説明**: `サッカー教室ホームページ用`（任意、空欄でもOK）
   - 「作成」または「Create」ボタンをクリック

3. **作成完了を確認**
   - プロバイダー一覧に作成したプロバイダーが表示されれば成功
   - プロバイダー名をクリックすると、そのプロバイダーの管理画面に移動します

**現在の状態**: ✅ プロバイダーが作成されました

**次のステップ**: プロバイダーを作成したら、そのプロバイダーを選択して、LINE Loginチャネルを作成します（ステップ1-3）。

---

### 1-3. LINE Loginチャネルの作成

**目的**: LINEログイン機能を使うためのチャネルを作成します。

**手順**:

1. **プロバイダーを選択**
   - 作成したプロバイダーをクリック

2. **チャネルを作成**
   - 「チャネルを作成」ボタンをクリック
   - 「LINE Login」を選択
   - 「次へ」をクリック

3. **チャネル情報を入力**
   - **チャネル名**: `サッカー教室 ログイン`（任意の名前でOK）
   - **チャネル説明**: `サッカー教室ホームページのログイン機能`（任意）
   - **アプリタイプ**: `Webアプリ`を選択
   - **メールアドレス**: 連絡先のメールアドレスを入力
   - **利用規約への同意**: チェックを入れる
   - 「作成」をクリック

4. **作成完了を確認**
   - チャネル一覧に作成したチャネルが表示されれば成功

**現在の状態**: ✅ LINE Loginチャネルが作成されました

---

### 1-4. チャネルIDとチャネルシークレットの取得

**目的**: アプリケーションでLINEログインを使うために必要な情報を取得します。

**手順**:

1. **チャネルを開く**
   - 作成したLINE Loginチャネルをクリック

2. **基本情報タブを確認**
   - 「基本情報」タブが開いていることを確認

3. **チャネルIDをコピー**
   - **チャネルID**: 数字の文字列（例: `1234567890`）
   - この値をコピーしてメモ帳などに保存しておきます
   - ⚠️ **重要**: 後で環境変数に設定します

4. **チャネルシークレットを表示・コピー**
   - **チャネルシークレット**: 「表示」ボタンをクリックして表示
   - 長い文字列（例: `abcdefghijklmnopqrstuvwxyz123456`）
   - この値をコピーしてメモ帳などに保存しておきます
   - ⚠️ **重要**: この値は**絶対に公開してはいけません**。後で環境変数に設定します

**現在の状態**: ✅ チャネルIDとチャネルシークレットを取得しました

**保存した情報**:
- チャネルID: `_________________`（後で入力）
- チャネルシークレット: `_________________`（後で入力）

---

### 1-5. コールバックURLの設定

**目的**: LINE認証が完了した後、ユーザーをリダイレクトするURLを設定します。

**コールバックURLとは？**: LINE認証が完了すると、LINEがこのURLにユーザーをリダイレクトします。このURLで認証結果を受け取り、ログイン処理を行います。

**手順**:

1. **チャネル設定を開く**
   - 作成したLINE Loginチャネルの「LINE Login」タブを開く
   - または、「設定」タブを開く

2. **コールバックURLを追加**
   - 「コールバックURL」のセクションを探す
   - 「追加」ボタンをクリック
   - 以下のURLを入力:
     ```
     http://localhost:3000/api/auth/callback/line
     ```
   - 「追加」をクリック

3. **設定を保存**
   - 「更新」または「保存」ボタンをクリック

**現在の状態**: ✅ コールバックURLが設定されました

**設定したコールバックURL**:
- 開発環境: `http://localhost:3000/api/auth/callback/line`
- 本番環境: 後で設定（例: `https://yourdomain.com/api/auth/callback/line`）

---

## ✅ ステップ2: NextAuth.js の導入

### 2-1. NextAuth.jsとは？

**NextAuth.js**: Next.jsで認証機能を簡単に実装できるライブラリです。LINEログインなどのOAuth認証を数行のコードで実装できます。

**メリット**:
- セッション管理が自動で行われる
- 複数の認証方法（LINE、Google、GitHubなど）に対応
- セキュリティが考慮されている

---

### 2-2. パッケージのインストール

**手順**:

1. **フロントエンドフォルダに移動**
   ```bash
   cd frontend
   ```

2. **NextAuth.jsをインストール**
   ```bash
   npm install next-auth@beta
   ```
   
   **コマンドの説明**:
   - `next-auth@beta`: Next.js App Router対応版のNextAuth.js
   - `@beta`を付けることで、最新のベータ版（App Router対応）をインストール

3. **インストールの完了を待つ**
   - `added X packages` のようなメッセージが表示されれば完了です

**現在の状態**: ✅ NextAuth.jsがインストールされました

---

### 2-3. 環境変数の設定

**目的**: LINE Developersで取得した情報を環境変数に設定します。

**手順**:

1. **環境変数ファイルを開く**
   - `frontend/.env.local` ファイルを開く
   - ファイルが存在しない場合は作成してください

2. **LINEログインの設定を追加**
   - ファイルの最後に以下の内容を追加:

   ```env
   # LINE Login
   LINE_CHANNEL_ID=あなたのチャネルID
   LINE_CHANNEL_SECRET=あなたのチャネルシークレット
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=ランダムな文字列（後で生成）
   ```

3. **実際の値を設定**
   - `LINE_CHANNEL_ID`: 先ほどコピーしたチャネルIDを貼り付け
   - `LINE_CHANNEL_SECRET`: 先ほどコピーしたチャネルシークレットを貼り付け
   - `NEXTAUTH_URL`: そのままでOK（開発環境用）
   - `NEXTAUTH_SECRET`: 後で生成します（次のステップ）

**例**:
```env
# LINE Login
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abcdefghijklmnopqrstuvwxyz123456

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=（後で生成）
```

**現在の状態**: ✅ 環境変数が設定されました（NEXTAUTH_SECRETは後で設定）

---

### 2-4. NEXTAUTH_SECRETの生成

**目的**: NextAuth.jsでセッションを暗号化するための秘密鍵を生成します。

**NEXTAUTH_SECRETとは？**: セッション情報を暗号化するために使用する秘密鍵です。ランダムな文字列を生成して使用します。

**手順**:

1. **ターミナルで秘密鍵を生成**
   ```bash
   openssl rand -base64 32
   ```
   
   **Windowsの場合（PowerShell）**:
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```
   
   または、オンラインツールを使用:
   - https://generate-secret.vercel.app/32 にアクセス
   - 生成された文字列をコピー

2. **環境変数に設定**
   - `frontend/.env.local` の `NEXTAUTH_SECRET` に生成した文字列を貼り付け
   
   **例**:
   ```env
   NEXTAUTH_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

**現在の状態**: ✅ NEXTAUTH_SECRETが生成され、環境変数に設定されました

---

### 2-5. NextAuth.jsの設定ファイルの作成

**目的**: NextAuth.jsの設定を行い、LINEプロバイダーを追加します。

**手順**:

1. **設定ファイルを作成**
   - `frontend/app/api/auth/[...nextauth]` フォルダを作成
   - フォルダ構造:
     ```
     frontend/
     └── app/
         └── api/
             └── auth/
                 └── [...nextauth]/
                     └── route.ts
     ```

2. **`route.ts`ファイルを作成**

3. **以下のコードをコピー＆ペースト**

```typescript
import NextAuth from 'next-auth'
import LineProvider from 'next-auth/providers/line'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID || '',
      clientSecret: process.env.LINE_CHANNEL_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // セッション情報にLINEユーザーIDを追加
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, account, profile }) {
      // 初回ログイン時にLINEユーザーIDを保存
      if (account && profile) {
        token.sub = profile.sub || account.providerAccountId
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const { GET, POST } = handlers
```

**コードの説明**:
- `export const { handlers, auth, signIn, signOut }`: NextAuth.js v5の新しい書き方です
- `handlers`: GETとPOSTリクエストを処理するハンドラー
- `auth`: サーバー側でセッションを取得する関数（後で使用）
- `signIn` / `signOut`: ログイン・ログアウト関数（後で使用）
- `export const { GET, POST } = handlers`: handlersからGETとPOSTをエクスポート

**コードの説明**:
- `LineProvider`: LINEログイン用のプロバイダー
- `clientId`: 環境変数からチャネルIDを取得
- `clientSecret`: 環境変数からチャネルシークレットを取得
- `callbacks`: 認証後の処理をカスタマイズ
- `pages.signIn`: ログインページのURLを指定

**現在の状態**: ✅ NextAuth.jsの設定ファイルが作成されました

---

### 2-6. フォルダ構造の確認

**正しいフォルダ構造**:

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts    ← 新規作成
│   ├── login/
│   │   └── page.tsx
│   └── ...
├── .env.local                  ← 環境変数を設定
└── ...
```

**確認ポイント**:
- `[...nextauth]` は角括弧3つです（`[` `]` `[` `]` `nextauth`）
- これはNext.jsの動的ルート機能で、`/api/auth/*` のすべてのパスを処理します

---

## ✅ ステップ3: 動作確認

### 3-1. 開発サーバーの再起動

**重要**: 環境変数を変更した場合は、開発サーバーを再起動する必要があります。

**手順**:

1. **開発サーバーを停止**
   - ターミナルで `Ctrl + C` を押す

2. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

3. **起動を確認**
   - `- Local: http://localhost:3000` と表示されれば成功

---

### 3-2. NextAuth.jsの動作確認

**手順**:

1. **NextAuth.jsの設定ページにアクセス**
   - ブラウザで `http://localhost:3000/api/auth/providers` にアクセス
   - 以下のようなJSONが表示されれば成功:
     ```json
     {
       "line": {
         "id": "line",
         "name": "LINE",
         "type": "oidc",
         "signinUrl": "http://localhost:3000/api/auth/signin/line",
         "callbackUrl": "http://localhost:3000/api/auth/callback/line"
       }
     }
     ```

2. **表示内容の確認**
   - ✅ **正しい表示**: 上記のようなJSONが表示されれば成功です
   - `type`が`"oidc"`でも`"oauth"`でも問題ありません（どちらも正しいです）
   - `signinUrl`と`callbackUrl`が正しく表示されていればOKです

3. **エラーがないか確認**
   - エラーメッセージが表示される場合は、環境変数が正しく設定されているか確認してください
   - HTTP ERROR 500が表示される場合は、トラブルシューティングを参照してください

**現在の状態**: ✅ NextAuth.jsが正常に動作しています

**表示例**:
```json
{"line":{"id":"line","name":"LINE","type":"oidc","signinUrl":"http://localhost:3000/api/auth/signin/line","callbackUrl":"http://localhost:3000/api/auth/callback/line"}}
```

**この表示の意味**:
- `id: "line"`: LINEプロバイダーが正しく設定されています
- `name: "LINE"`: プロバイダー名が正しく表示されています
- `type: "oidc"`: OIDC（OpenID Connect）を使用しています（OAuth 2.0の拡張版）
- `signinUrl`: ログインURLが正しく設定されています
- `callbackUrl`: コールバックURLが正しく設定されています

---

### 3-3. HTTP ERROR 500が発生した場合の対処法

**エラーメッセージ例**:
```
このページは現在機能していません
localhost はこの要求を現在処理できません。
HTTP ERROR 500
```

**原因**: サーバー側でエラーが発生しています。主な原因は以下の通りです：

1. **環境変数が設定されていない**
   - `LINE_CHANNEL_ID`、`LINE_CHANNEL_SECRET`、`NEXTAUTH_SECRET`が設定されていない
2. **環境変数の値が間違っている**
   - 値に余分なスペースや引用符が含まれている
3. **開発サーバーを再起動していない**
   - 環境変数を変更した後、開発サーバーを再起動していない

**解決方法**:

#### ステップ1: ターミナルのエラーログを確認

1. **開発サーバーを起動しているターミナルを確認**
   - ターミナルにエラーメッセージが表示されているはずです
   - エラーメッセージを読んで、何が問題か確認してください

2. **よくあるエラーメッセージ**:
   - `Missing LINE_CHANNEL_ID` → 環境変数が設定されていません
   - `Invalid client secret` → チャネルシークレットが間違っています
   - `NEXTAUTH_SECRET is not defined` → NEXTAUTH_SECRETが設定されていません

#### ステップ2: 環境変数ファイルを確認

1. **`.env.local`ファイルを開く**
   - `frontend/.env.local` を開く

2. **以下の環境変数が設定されているか確認**:
   ```env
   LINE_CHANNEL_ID=あなたのチャネルID
   LINE_CHANNEL_SECRET=あなたのチャネルシークレット
   NEXTAUTH_SECRET=生成した秘密鍵
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **値の形式を確認**:
   - 値に引用符（`"`）が含まれていないか確認
   - 値の前後に余分なスペースがないか確認
   - 例: `LINE_CHANNEL_ID=1234567890`（引用符なし）

#### ステップ3: 開発サーバーを再起動

1. **開発サーバーを停止**
   - ターミナルで `Ctrl + C` を押す

2. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

3. **エラーログを確認**
   - 起動時にエラーメッセージが表示されないか確認

#### ステップ4: 設定ファイルを確認

1. **設定ファイルの場所を確認**
   - `frontend/app/api/auth/[...nextauth]/route.ts` が存在するか確認

2. **設定ファイルの内容を確認**
   - ファイルが正しく作成されているか確認
   - コードにエラーがないか確認

#### ステップ5: 環境変数の読み込みを確認（デバッグ用）

一時的に設定ファイルにデバッグコードを追加して、環境変数が読み込まれているか確認できます：

```typescript
// デバッグ用（確認後は削除してください）
console.log('LINE_CHANNEL_ID:', process.env.LINE_CHANNEL_ID ? '設定済み' : '未設定')
console.log('LINE_CHANNEL_SECRET:', process.env.LINE_CHANNEL_SECRET ? '設定済み' : '未設定')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '設定済み' : '未設定')
```

**注意**: このコードは確認後、必ず削除してください（セキュリティのため）。

---

**現在の状態**: エラーが解消されれば、NextAuth.jsが正常に動作します

---

## ✅ 完了チェックリスト

以下の項目を確認して、すべて完了したらLINEログイン実装（1）が完了です！

- [ ] LINE Developersアカウントが作成されている
- [ ] プロバイダーが作成されている
- [ ] LINE Loginチャネルが作成されている
- [ ] チャネルIDとチャネルシークレットを取得している
- [ ] コールバックURLが設定されている
- [ ] NextAuth.jsがインストールされている
- [ ] 環境変数が設定されている（LINE_CHANNEL_ID、LINE_CHANNEL_SECRET、NEXTAUTH_SECRET）
- [ ] NextAuth.jsの設定ファイル（route.ts）が作成されている
- [ ] 開発サーバーが正常に起動する
- [ ] NextAuth.jsの設定ページ（/api/auth/providers）が表示される

---

## 📝 次のステップ

次回（2/6）の作業内容：
- 認証フローの実装
- ログインページの更新
- コールバック処理の実装
- 初回ログイン時のユーザー登録処理
- セッション管理の実装

詳細は `開発スケジュール.md` を参照してください。

---

## ⚠️ トラブルシューティング

### エラー1: チャネルIDが見つからない

**エラーメッセージ例**:
```
Error: Missing LINE_CHANNEL_ID
```

**原因**: 環境変数 `LINE_CHANNEL_ID` が設定されていない、または間違っています。

**解決方法**:

1. **環境変数ファイルを確認**
   - `frontend/.env.local` を開く
   - `LINE_CHANNEL_ID` が正しく設定されているか確認

2. **値の確認**
   - チャネルIDは数字の文字列です（例: `1234567890`）
   - 余分なスペースや引用符がないか確認

3. **開発サーバーを再起動**
   - 環境変数を変更した場合は、必ず開発サーバーを再起動してください

---

### エラー2: コールバックURLが一致しない

**エラーメッセージ例**:
```
Error: redirect_uri_mismatch
```

**原因**: LINE Developersで設定したコールバックURLと、実際のURLが一致していません。

**解決方法**:

1. **LINE DevelopersでコールバックURLを確認**
   - チャネル設定 > コールバックURL
   - `http://localhost:3000/api/auth/callback/line` が設定されているか確認

2. **URLの形式を確認**
   - `http://` で始まっているか（`https://` ではない）
   - 末尾にスラッシュ（`/`）がないか
   - スペースや改行が入っていないか

3. **設定を保存**
   - LINE Developersで設定を保存したか確認

---

### エラー3: NEXTAUTH_SECRETが設定されていない

**エラーメッセージ例**:
```
Error: Please define a `NEXTAUTH_SECRET` environment variable
```

**原因**: 環境変数 `NEXTAUTH_SECRET` が設定されていません。

**解決方法**:

1. **環境変数ファイルを確認**
   - `frontend/.env.local` を開く
   - `NEXTAUTH_SECRET` が設定されているか確認

2. **秘密鍵を生成**
   - ステップ2-4を参照して、秘密鍵を生成してください

3. **開発サーバーを再起動**
   - 環境変数を変更した場合は、必ず開発サーバーを再起動してください

---

### エラー4: パッケージが見つからない

**エラーメッセージ例**:
```
Module not found: Can't resolve 'next-auth'
```

**原因**: NextAuth.jsがインストールされていない、またはインストールに失敗しています。

**解決方法**:

1. **パッケージを再インストール**
   ```bash
   cd frontend
   npm install next-auth@beta
   ```

2. **package.jsonを確認**
   - `frontend/package.json` を開く
   - `dependencies` に `next-auth` が含まれているか確認

---

### エラー5: Function.prototype.applyエラー

**エラーメッセージ例**:
```
TypeError: Function.prototype.apply was called on #<Object>, which is an object and not a function
```

**原因**: NextAuth.js v5（beta）の設定方法が間違っています。古い書き方を使用している可能性があります。

**解決方法**:

1. **設定ファイルを確認**
   - `frontend/app/api/auth/[...nextauth]/route.ts` を開く

2. **正しい書き方に修正**
   
   **❌ 間違った書き方（古い方法）**:
   ```typescript
   const handler = NextAuth({ ... })
   export { handler as GET, handler as POST }
   ```
   
   **✅ 正しい書き方（NextAuth.js v5）**:
   ```typescript
   export const { handlers, auth, signIn, signOut } = NextAuth({ ... })
   export const { GET, POST } = handlers
   ```

3. **ファイルを保存して再起動**
   - ファイルを保存（`Ctrl + S`）
   - 開発サーバーを再起動（`Ctrl + C` → `npm run dev`）

4. **動作確認**
   - `http://localhost:3000/api/auth/providers` にアクセス
   - エラーが解消されれば成功

**なぜこのエラーが発生するのか？**:
- NextAuth.js v5（beta）では、App Router用に書き方が変更されました
- 古い書き方（v4）では動作しません
- `handlers`オブジェクトから`GET`と`POST`を取得する必要があります

---

### エラー6: フォルダ構造が間違っている

**エラーメッセージ例**:
```
Cannot find module './app/api/auth/[...nextauth]/route'
```

**原因**: フォルダ構造が正しくありません。

**解決方法**:

1. **フォルダ構造を確認**
   ```
   frontend/
   └── app/
       └── api/
           └── auth/
               └── [...nextauth]/
                   └── route.ts
   ```

2. **フォルダ名を確認**
   - `[...nextauth]` は角括弧3つです
   - `[` `]` `[` `]` `nextauth` の順番です

3. **ファイル名を確認**
   - ファイル名は `route.ts` です（`route.tsx` ではありません）

---

## 💡 よくある質問（FAQ）

### Q1: チャネルシークレットを公開してしまった場合は？

**A**: すぐにチャネルシークレットを再生成してください。

1. LINE Developers > チャネル設定 > 基本情報
2. 「チャネルシークレット」の「再発行」をクリック
3. 新しいシークレットを環境変数に設定
4. 開発サーバーを再起動

---

### Q2: 複数の環境（開発・本番）で異なるチャネルを使いたい場合は？

**A**: 環境変数で管理します。

- **開発環境**（`.env.local`）: 開発用チャネルのIDとシークレット
- **本番環境**（Vercelなどの環境変数設定）: 本番用チャネルのIDとシークレット

本番環境用のチャネルも、LINE Developersで別途作成する必要があります。

---

### Q3: コールバックURLは複数設定できますか？

**A**: はい、複数設定できます。

- 開発環境: `http://localhost:3000/api/auth/callback/line`
- 本番環境: `https://yourdomain.com/api/auth/callback/line`

両方を設定しておくと、開発と本番で同じチャネルを使えます。

---

### Q4: NextAuth.jsのバージョンは？

**A**: `next-auth@beta` を使用しています。

- `@beta` を付けることで、Next.js App Router対応版をインストールします
- 通常の `next-auth` は Pages Router用なので、App Routerでは動作しません

---

### Q5: 環境変数が読み込まれない場合は？

**A**: 以下を確認してください：

1. **ファイル名が正しいか**
   - `.env.local` です（`.env` や `.env.local.txt` ではありません）

2. **ファイルの場所が正しいか**
   - `frontend/.env.local` です（プロジェクトルートではありません）

3. **開発サーバーを再起動したか**
   - 環境変数を変更した場合は、必ず再起動が必要です

4. **変数名が正しいか**
   - `NEXT_PUBLIC_` で始まる変数はクライアント側に公開されます
   - NextAuth.jsの変数は `NEXT_PUBLIC_` を付けません

---

## 📞 参考リンク

- **LINE Developers**: https://developers.line.biz/
- **NextAuth.js公式ドキュメント**: https://next-auth.js.org/
- **LINE Login公式ドキュメント**: https://developers.line.biz/ja/docs/line-login/

---

**最終更新**: 2024年2月5日  
**対象**: プログラミング初心者の方
