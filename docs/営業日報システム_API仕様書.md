# 営業日報システム API仕様書

## 目次

1. [共通仕様](#1-共通仕様)
2. [認証 API](#2-認証-api)
3. [日報 API](#3-日報-api)
4. [訪問記録 API](#4-訪問記録-api)
5. [上長コメント API](#5-上長コメント-api)
6. [顧客マスタ API](#6-顧客マスタ-api)
7. [営業マスタ API](#7-営業マスタ-api)
8. [エラーコード一覧](#8-エラーコード一覧)

---

## 1. 共通仕様

### ベースURL

```
/api/v1
```

### 認証方式

- Bearer Token（JWT）
- ログインAPI で取得したトークンを `Authorization` ヘッダーに付与する

```
Authorization: Bearer <token>
```

### 共通リクエストヘッダー

| ヘッダー | 値 | 必須 |
|---------|-----|------|
| Content-Type | application/json | ○ |
| Authorization | Bearer {token} | ○（ログインAPI以外） |

### 共通レスポンス形式

#### 成功時

```json
{
  "status": "success",
  "data": { ... }
}
```

#### 一覧取得時（ページネーション付き）

```json
{
  "status": "success",
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_count": 150,
    "total_pages": 8
  }
}
```

#### エラー時

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "report_date",
        "message": "報告日を入力してください"
      }
    ]
  }
}
```

### 共通クエリパラメータ（一覧系）

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|----------|------|
| page | integer | 1 | ページ番号 |
| per_page | integer | 20 | 1ページあたりの件数（最大100） |

### 日付フォーマット

| 種別 | フォーマット | 例 |
|------|------------|-----|
| 日付 | YYYY-MM-DD | 2026-03-02 |
| 日時 | ISO 8601 | 2026-03-02T18:30:00+09:00 |

---

## 2. 認証 API

### POST /api/v1/auth/login

ログイン認証を行い、JWTトークンを返却する。

**認証**: 不要

#### リクエスト

```json
{
  "email": "tanaka@example.com",
  "password": "password123"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | ○ | メールアドレス |
| password | string | ○ | パスワード |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "sales_staff_id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "department": "営業1課",
      "position": "主任",
      "manager_id": 10
    }
  }
}
```

#### エラー（401 Unauthorized）

```json
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### POST /api/v1/auth/logout

ログアウト処理を行う。

**認証**: 必要

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "message": "ログアウトしました"
  }
}
```

---

### GET /api/v1/auth/me

ログイン中のユーザー情報を取得する。

**認証**: 必要

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "sales_staff_id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "department": "営業1課",
    "position": "主任",
    "manager_id": 10,
    "manager_name": "山田部長"
  }
}
```

---

## 3. 日報 API

### GET /api/v1/reports

日報一覧を取得する。営業担当者は自分の日報のみ、上長は部下の日報も取得可能。

**認証**: 必要

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| date_from | string | - | 報告日（開始）YYYY-MM-DD |
| date_to | string | - | 報告日（終了）YYYY-MM-DD |
| sales_staff_id | integer | - | 営業担当者ID |
| customer_name | string | - | 顧客名（部分一致） |
| status | string | - | ステータス（draft / submitted / commented） |
| page | integer | - | ページ番号 |
| per_page | integer | - | 1ページあたりの件数 |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": [
    {
      "report_id": 1,
      "sales_staff_id": 1,
      "sales_staff_name": "田中太郎",
      "report_date": "2026-03-02",
      "status": "commented",
      "visit_count": 3,
      "problem": "株式会社ABCの見積もり金額について...",
      "plan": "・株式会社ABCへ見積書作成...",
      "created_at": "2026-03-02T17:00:00+09:00",
      "updated_at": "2026-03-02T17:30:00+09:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_count": 150,
    "total_pages": 8
  }
}
```

---

### GET /api/v1/reports/{report_id}

日報の詳細を取得する。訪問記録・上長コメントを含む。

**認証**: 必要（本人・上長のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "report_id": 1,
    "sales_staff_id": 1,
    "sales_staff_name": "田中太郎",
    "report_date": "2026-03-02",
    "status": "commented",
    "problem": "株式会社ABCの見積もり金額について上長に相談したい。競合他社の価格が判明し、調整が必要。",
    "plan": "・株式会社ABCへ見積書作成\n・株式会社GHIへ初回訪問",
    "created_at": "2026-03-02T17:00:00+09:00",
    "updated_at": "2026-03-02T17:30:00+09:00",
    "visit_records": [
      {
        "visit_record_id": 1,
        "customer_id": 10,
        "customer_name": "株式会社ABC",
        "visit_content": "新製品の提案を実施。担当者は前向き。来週見積もりを提出予定。",
        "created_at": "2026-03-02T17:00:00+09:00"
      },
      {
        "visit_record_id": 2,
        "customer_id": 20,
        "customer_name": "株式会社DEF",
        "visit_content": "定期フォロー訪問。特に問題なし。",
        "created_at": "2026-03-02T17:00:00+09:00"
      }
    ],
    "comments": [
      {
        "comment_id": 1,
        "commenter_id": 10,
        "commenter_name": "山田部長",
        "comment_body": "ABC社の見積もりは15%引きまでOKです。明日の訪問頑張ってください。",
        "created_at": "2026-03-02T18:30:00+09:00"
      }
    ]
  }
}
```

---

### POST /api/v1/reports

日報を新規作成する。訪問記録も同時に登録する。

**認証**: 必要（営業担当者）

#### リクエスト

```json
{
  "report_date": "2026-03-02",
  "status": "submitted",
  "problem": "株式会社ABCの見積もり金額について上長に相談したい。",
  "plan": "・株式会社ABCへ見積書作成\n・株式会社GHIへ初回訪問",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。担当者は前向き。"
    },
    {
      "customer_id": 20,
      "visit_content": "定期フォロー訪問。特に問題なし。"
    }
  ]
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_date | string | ○ | 報告日（YYYY-MM-DD） |
| status | string | ○ | "draft"（下書き） / "submitted"（提出） |
| problem | string | - | 課題・相談（最大2000文字） |
| plan | string | - | 明日やること（最大2000文字） |
| visit_records | array | ○（提出時） | 訪問記録の配列 |
| visit_records[].customer_id | integer | ○ | 顧客ID |
| visit_records[].visit_content | string | ○ | 訪問内容（最大2000文字） |

#### レスポンス（201 Created）

```json
{
  "status": "success",
  "data": {
    "report_id": 1,
    "sales_staff_id": 1,
    "report_date": "2026-03-02",
    "status": "submitted",
    "problem": "株式会社ABCの見積もり金額について上長に相談したい。",
    "plan": "・株式会社ABCへ見積書作成\n・株式会社GHIへ初回訪問",
    "visit_records": [
      {
        "visit_record_id": 1,
        "customer_id": 10,
        "customer_name": "株式会社ABC",
        "visit_content": "新製品の提案を実施。担当者は前向き。"
      },
      {
        "visit_record_id": 2,
        "customer_id": 20,
        "customer_name": "株式会社DEF",
        "visit_content": "定期フォロー訪問。特に問題なし。"
      }
    ],
    "created_at": "2026-03-02T17:00:00+09:00",
    "updated_at": "2026-03-02T17:00:00+09:00"
  }
}
```

#### エラー（409 Conflict）

```json
{
  "status": "error",
  "error": {
    "code": "DUPLICATE_REPORT",
    "message": "この日付の日報は既に存在します"
  }
}
```

---

### PUT /api/v1/reports/{report_id}

日報を更新する。訪問記録は洗い替え（全削除→全登録）で更新する。

**認証**: 必要（本人のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### リクエスト

```json
{
  "report_date": "2026-03-02",
  "status": "submitted",
  "problem": "株式会社ABCの見積もり金額について上長に相談したい。競合他社の価格が判明し、調整が必要。",
  "plan": "・株式会社ABCへ見積書作成\n・株式会社GHIへ初回訪問",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品の提案を実施。担当者は前向き。来週見積もりを提出予定。"
    },
    {
      "customer_id": 20,
      "visit_content": "定期フォロー訪問。特に問題なし。"
    }
  ]
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_date | string | ○ | 報告日（YYYY-MM-DD） |
| status | string | ○ | "draft" / "submitted" |
| problem | string | - | 課題・相談（最大2000文字） |
| plan | string | - | 明日やること（最大2000文字） |
| visit_records | array | ○（提出時） | 訪問記録の配列（洗い替え） |
| visit_records[].customer_id | integer | ○ | 顧客ID |
| visit_records[].visit_content | string | ○ | 訪問内容（最大2000文字） |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "report_id": 1,
    "sales_staff_id": 1,
    "report_date": "2026-03-02",
    "status": "submitted",
    "problem": "...",
    "plan": "...",
    "visit_records": [ ... ],
    "created_at": "2026-03-02T17:00:00+09:00",
    "updated_at": "2026-03-02T17:45:00+09:00"
  }
}
```

---

### DELETE /api/v1/reports/{report_id}

日報を削除する。関連する訪問記録・コメントも同時に削除される。

**認証**: 必要（本人のみ。提出済みの場合は削除不可）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "message": "日報を削除しました"
  }
}
```

#### エラー（422 Unprocessable Entity）

```json
{
  "status": "error",
  "error": {
    "code": "CANNOT_DELETE_SUBMITTED",
    "message": "提出済みの日報は削除できません"
  }
}
```

---

## 4. 訪問記録 API

### GET /api/v1/reports/{report_id}/visits

指定した日報の訪問記録一覧を取得する。

**認証**: 必要（本人・上長のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": [
    {
      "visit_record_id": 1,
      "report_id": 1,
      "customer_id": 10,
      "customer_name": "株式会社ABC",
      "visit_content": "新製品の提案を実施。担当者は前向き。来週見積もりを提出予定。",
      "created_at": "2026-03-02T17:00:00+09:00",
      "updated_at": "2026-03-02T17:00:00+09:00"
    },
    {
      "visit_record_id": 2,
      "report_id": 1,
      "customer_id": 20,
      "customer_name": "株式会社DEF",
      "visit_content": "定期フォロー訪問。特に問題なし。",
      "created_at": "2026-03-02T17:00:00+09:00",
      "updated_at": "2026-03-02T17:00:00+09:00"
    }
  ]
}
```

---

### POST /api/v1/reports/{report_id}/visits

指定した日報に訪問記録を追加する。

**認証**: 必要（本人のみ）

#### リクエスト

```json
{
  "customer_id": 30,
  "visit_content": "新規開拓訪問。担当者と名刺交換し、次回アポイントを取得。"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |
| visit_content | string | ○ | 訪問内容（最大2000文字） |

#### レスポンス（201 Created）

```json
{
  "status": "success",
  "data": {
    "visit_record_id": 3,
    "report_id": 1,
    "customer_id": 30,
    "customer_name": "株式会社GHI",
    "visit_content": "新規開拓訪問。担当者と名刺交換し、次回アポイントを取得。",
    "created_at": "2026-03-02T17:30:00+09:00",
    "updated_at": "2026-03-02T17:30:00+09:00"
  }
}
```

---

### PUT /api/v1/reports/{report_id}/visits/{visit_record_id}

訪問記録を更新する。

**認証**: 必要（本人のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |
| visit_record_id | integer | ○ | 訪問記録ID |

#### リクエスト

```json
{
  "customer_id": 10,
  "visit_content": "新製品の提案を実施。担当者は前向き。来週見積もりを提出予定。予算は500万円程度。"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |
| visit_content | string | ○ | 訪問内容（最大2000文字） |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "visit_record_id": 1,
    "report_id": 1,
    "customer_id": 10,
    "customer_name": "株式会社ABC",
    "visit_content": "新製品の提案を実施。担当者は前向き。来週見積もりを提出予定。予算は500万円程度。",
    "created_at": "2026-03-02T17:00:00+09:00",
    "updated_at": "2026-03-02T17:45:00+09:00"
  }
}
```

---

### DELETE /api/v1/reports/{report_id}/visits/{visit_record_id}

訪問記録を削除する。

**認証**: 必要（本人のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |
| visit_record_id | integer | ○ | 訪問記録ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "message": "訪問記録を削除しました"
  }
}
```

---

## 5. 上長コメント API

### GET /api/v1/reports/{report_id}/comments

指定した日報のコメント一覧を取得する。

**認証**: 必要（本人・上長のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": [
    {
      "comment_id": 1,
      "report_id": 1,
      "commenter_id": 10,
      "commenter_name": "山田部長",
      "comment_body": "ABC社の見積もりは15%引きまでOKです。明日の訪問頑張ってください。",
      "created_at": "2026-03-02T18:30:00+09:00"
    }
  ]
}
```

---

### POST /api/v1/reports/{report_id}/comments

日報にコメントを投稿する。日報のステータスが「コメント済」に更新される。

**認証**: 必要（上長のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| report_id | integer | ○ | 日報ID |

#### リクエスト

```json
{
  "comment_body": "ABC社の見積もりは15%引きまでOKです。明日の訪問頑張ってください。"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| comment_body | string | ○ | コメント内容（最大1000文字） |

#### レスポンス（201 Created）

```json
{
  "status": "success",
  "data": {
    "comment_id": 1,
    "report_id": 1,
    "commenter_id": 10,
    "commenter_name": "山田部長",
    "comment_body": "ABC社の見積もりは15%引きまでOKです。明日の訪問頑張ってください。",
    "created_at": "2026-03-02T18:30:00+09:00"
  }
}
```

#### エラー（403 Forbidden）

```json
{
  "status": "error",
  "error": {
    "code": "FORBIDDEN",
    "message": "コメントは上長のみ投稿可能です"
  }
}
```

---

## 6. 顧客マスタ API

### GET /api/v1/customers

顧客一覧を取得する。

**認証**: 必要

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_name | string | - | 顧客名（部分一致） |
| sales_staff_id | integer | - | 担当営業ID |
| page | integer | - | ページ番号 |
| per_page | integer | - | 1ページあたりの件数 |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": [
    {
      "customer_id": 10,
      "customer_name": "株式会社ABC",
      "address": "東京都千代田区丸の内1-1-1",
      "phone": "03-1234-5678",
      "sales_staff_id": 1,
      "sales_staff_name": "田中太郎",
      "created_at": "2026-01-15T10:00:00+09:00",
      "updated_at": "2026-02-20T14:00:00+09:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_count": 50,
    "total_pages": 3
  }
}
```

---

### GET /api/v1/customers/{customer_id}

顧客の詳細を取得する。

**認証**: 必要

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "customer_id": 10,
    "customer_name": "株式会社ABC",
    "address": "東京都千代田区丸の内1-1-1",
    "phone": "03-1234-5678",
    "sales_staff_id": 1,
    "sales_staff_name": "田中太郎",
    "created_at": "2026-01-15T10:00:00+09:00",
    "updated_at": "2026-02-20T14:00:00+09:00"
  }
}
```

---

### POST /api/v1/customers

顧客を新規登録する。

**認証**: 必要（管理者・営業担当者）

#### リクエスト

```json
{
  "customer_name": "株式会社XYZ",
  "address": "大阪府大阪市北区梅田2-2-2",
  "phone": "06-9876-5432",
  "sales_staff_id": 1
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_name | string | ○ | 顧客名（最大200文字） |
| address | string | - | 住所（最大500文字） |
| phone | string | - | 電話番号 |
| sales_staff_id | integer | - | 担当営業ID |

#### レスポンス（201 Created）

```json
{
  "status": "success",
  "data": {
    "customer_id": 51,
    "customer_name": "株式会社XYZ",
    "address": "大阪府大阪市北区梅田2-2-2",
    "phone": "06-9876-5432",
    "sales_staff_id": 1,
    "sales_staff_name": "田中太郎",
    "created_at": "2026-03-02T10:00:00+09:00",
    "updated_at": "2026-03-02T10:00:00+09:00"
  }
}
```

---

### PUT /api/v1/customers/{customer_id}

顧客情報を更新する。

**認証**: 必要（管理者・営業担当者）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |

#### リクエスト

```json
{
  "customer_name": "株式会社XYZ",
  "address": "大阪府大阪市北区梅田3-3-3",
  "phone": "06-9876-5432",
  "sales_staff_id": 2
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_name | string | ○ | 顧客名（最大200文字） |
| address | string | - | 住所（最大500文字） |
| phone | string | - | 電話番号 |
| sales_staff_id | integer | - | 担当営業ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "customer_id": 51,
    "customer_name": "株式会社XYZ",
    "address": "大阪府大阪市北区梅田3-3-3",
    "phone": "06-9876-5432",
    "sales_staff_id": 2,
    "sales_staff_name": "佐藤花子",
    "created_at": "2026-03-02T10:00:00+09:00",
    "updated_at": "2026-03-02T11:00:00+09:00"
  }
}
```

---

### DELETE /api/v1/customers/{customer_id}

顧客を削除する。訪問記録が存在する場合は削除不可。

**認証**: 必要（管理者のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| customer_id | integer | ○ | 顧客ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "message": "顧客を削除しました"
  }
}
```

#### エラー（422 Unprocessable Entity）

```json
{
  "status": "error",
  "error": {
    "code": "HAS_RELATED_RECORDS",
    "message": "訪問記録が存在するため削除できません"
  }
}
```

---

## 7. 営業マスタ API

### GET /api/v1/staffs

営業担当者一覧を取得する。

**認証**: 必要（管理者のみ。ただしセレクトボックス用の簡易取得は全ユーザー可）

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | - | 氏名（部分一致） |
| department | string | - | 部署 |
| simple | boolean | - | true の場合、id と name のみ返却（セレクトボックス用） |
| page | integer | - | ページ番号 |
| per_page | integer | - | 1ページあたりの件数 |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": [
    {
      "sales_staff_id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "department": "営業1課",
      "position": "主任",
      "manager_id": 10,
      "manager_name": "山田部長",
      "created_at": "2025-04-01T09:00:00+09:00",
      "updated_at": "2026-01-10T10:00:00+09:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_count": 30,
    "total_pages": 2
  }
}
```

#### レスポンス（200 OK / simple=true）

```json
{
  "status": "success",
  "data": [
    { "sales_staff_id": 1, "name": "田中太郎" },
    { "sales_staff_id": 2, "name": "佐藤花子" },
    { "sales_staff_id": 10, "name": "山田部長" }
  ]
}
```

---

### GET /api/v1/staffs/{sales_staff_id}

営業担当者の詳細を取得する。

**認証**: 必要（管理者のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| sales_staff_id | integer | ○ | 営業ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "sales_staff_id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "department": "営業1課",
    "position": "主任",
    "manager_id": 10,
    "manager_name": "山田部長",
    "created_at": "2025-04-01T09:00:00+09:00",
    "updated_at": "2026-01-10T10:00:00+09:00"
  }
}
```

---

### POST /api/v1/staffs

営業担当者を新規登録する。

**認証**: 必要（管理者のみ）

#### リクエスト

```json
{
  "name": "鈴木一郎",
  "email": "suzuki@example.com",
  "password": "securePass123",
  "department": "営業2課",
  "position": "",
  "manager_id": 10
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 氏名（最大100文字） |
| email | string | ○ | メールアドレス（一意） |
| password | string | ○ | パスワード（8文字以上） |
| department | string | - | 部署（最大100文字） |
| position | string | - | 役職（最大50文字） |
| manager_id | integer | - | 上長ID |

#### レスポンス（201 Created）

```json
{
  "status": "success",
  "data": {
    "sales_staff_id": 31,
    "name": "鈴木一郎",
    "email": "suzuki@example.com",
    "department": "営業2課",
    "position": "",
    "manager_id": 10,
    "manager_name": "山田部長",
    "created_at": "2026-03-02T10:00:00+09:00",
    "updated_at": "2026-03-02T10:00:00+09:00"
  }
}
```

#### エラー（409 Conflict）

```json
{
  "status": "error",
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "このメールアドレスは既に使用されています"
  }
}
```

---

### PUT /api/v1/staffs/{sales_staff_id}

営業担当者情報を更新する。

**認証**: 必要（管理者のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| sales_staff_id | integer | ○ | 営業ID |

#### リクエスト

```json
{
  "name": "鈴木一郎",
  "email": "suzuki@example.com",
  "password": "",
  "department": "営業2課",
  "position": "主任",
  "manager_id": 10
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | ○ | 氏名（最大100文字） |
| email | string | ○ | メールアドレス（一意） |
| password | string | - | パスワード（空文字の場合は変更なし） |
| department | string | - | 部署（最大100文字） |
| position | string | - | 役職（最大50文字） |
| manager_id | integer | - | 上長ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "sales_staff_id": 31,
    "name": "鈴木一郎",
    "email": "suzuki@example.com",
    "department": "営業2課",
    "position": "主任",
    "manager_id": 10,
    "manager_name": "山田部長",
    "created_at": "2026-03-02T10:00:00+09:00",
    "updated_at": "2026-03-02T15:00:00+09:00"
  }
}
```

---

### DELETE /api/v1/staffs/{sales_staff_id}

営業担当者を削除する。日報が存在する場合は削除不可。

**認証**: 必要（管理者のみ）

#### パスパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| sales_staff_id | integer | ○ | 営業ID |

#### レスポンス（200 OK）

```json
{
  "status": "success",
  "data": {
    "message": "営業担当者を削除しました"
  }
}
```

#### エラー（422 Unprocessable Entity）

```json
{
  "status": "error",
  "error": {
    "code": "HAS_RELATED_RECORDS",
    "message": "日報データが存在するため削除できません"
  }
}
```

---

## 8. エラーコード一覧

### HTTPステータスコード

| コード | 意味 | 使用場面 |
|--------|------|---------|
| 200 | OK | 正常（取得・更新・削除） |
| 201 | Created | 正常（新規作成） |
| 400 | Bad Request | リクエスト形式不正 |
| 401 | Unauthorized | 未認証・トークン無効 |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | 重複エラー |
| 422 | Unprocessable Entity | バリデーションエラー・ビジネスルール違反 |
| 500 | Internal Server Error | サーバー内部エラー |

### アプリケーションエラーコード

| エラーコード | HTTPステータス | 説明 |
|-------------|---------------|------|
| AUTHENTICATION_FAILED | 401 | ログイン認証失敗 |
| TOKEN_EXPIRED | 401 | トークン有効期限切れ |
| TOKEN_INVALID | 401 | 不正なトークン |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | 対象リソースが見つからない |
| DUPLICATE_REPORT | 409 | 同一日の日報が既に存在 |
| DUPLICATE_EMAIL | 409 | メールアドレス重複 |
| VALIDATION_ERROR | 422 | 入力値バリデーションエラー |
| CANNOT_DELETE_SUBMITTED | 422 | 提出済み日報の削除不可 |
| HAS_RELATED_RECORDS | 422 | 関連データ存在のため削除不可 |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

---

## API一覧（サマリー）

| メソッド | エンドポイント | 概要 | 権限 |
|---------|---------------|------|------|
| POST | /api/v1/auth/login | ログイン | 全員 |
| POST | /api/v1/auth/logout | ログアウト | 認証済 |
| GET | /api/v1/auth/me | ログインユーザー情報取得 | 認証済 |
| GET | /api/v1/reports | 日報一覧取得 | 認証済 |
| GET | /api/v1/reports/:id | 日報詳細取得 | 本人・上長 |
| POST | /api/v1/reports | 日報作成 | 営業担当 |
| PUT | /api/v1/reports/:id | 日報更新 | 本人 |
| DELETE | /api/v1/reports/:id | 日報削除 | 本人 |
| GET | /api/v1/reports/:id/visits | 訪問記録一覧取得 | 本人・上長 |
| POST | /api/v1/reports/:id/visits | 訪問記録追加 | 本人 |
| PUT | /api/v1/reports/:id/visits/:vid | 訪問記録更新 | 本人 |
| DELETE | /api/v1/reports/:id/visits/:vid | 訪問記録削除 | 本人 |
| GET | /api/v1/reports/:id/comments | コメント一覧取得 | 本人・上長 |
| POST | /api/v1/reports/:id/comments | コメント投稿 | 上長 |
| GET | /api/v1/customers | 顧客一覧取得 | 認証済 |
| GET | /api/v1/customers/:id | 顧客詳細取得 | 認証済 |
| POST | /api/v1/customers | 顧客登録 | 管理者・営業 |
| PUT | /api/v1/customers/:id | 顧客更新 | 管理者・営業 |
| DELETE | /api/v1/customers/:id | 顧客削除 | 管理者 |
| GET | /api/v1/staffs | 営業一覧取得 | 管理者 |
| GET | /api/v1/staffs/:id | 営業詳細取得 | 管理者 |
| POST | /api/v1/staffs | 営業登録 | 管理者 |
| PUT | /api/v1/staffs/:id | 営業更新 | 管理者 |
| DELETE | /api/v1/staffs/:id | 営業削除 | 管理者 |
