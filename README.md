# 営業日報システム (Sales Daily Report System)

営業担当者が日々の訪問活動を報告し、上長がコメントを行うための営業日報管理システムです。

## 主要機能

- 営業担当者が顧客訪問記録を含む日報を作成・提出（1日1日報、訪問記録は複数可）
- 課題・相談（Problem）と明日やること（Plan）を記入
- 上長が日報に対してコメントを投稿
- 顧客マスタ・営業マスタの管理

## ディレクトリ構成

```
sales-report-system/
├── app/          # Next.js アプリケーション
├── docs/         # 仕様書（画面定義書・API仕様書・テスト仕様書）
├── CLAUDE.md     # AI開発アシスタント向け設定
└── README.md
```

## セットアップ

```bash
cd app
npm install
npm run dev
```

開発サーバーが http://localhost:3000 で起動します。

## 仕様書

| ドキュメント | ファイル |
|-------------|---------|
| 画面定義書 | [docs/営業日報システム_画面定義書.md](docs/営業日報システム_画面定義書.md) |
| API仕様書 | [docs/営業日報システム_API仕様書.md](docs/営業日報システム_API仕様書.md) |
| テスト仕様書 | [docs/営業日報システム_テスト仕様書.md](docs/営業日報システム_テスト仕様書.md) |

## 技術スタック

- **フロントエンド**: Next.js / React / TypeScript / Tailwind CSS
- **コード品質**: ESLint / Prettier / Husky / lint-staged
