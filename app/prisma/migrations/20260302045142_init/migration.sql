-- CreateTable
CREATE TABLE "sales_staffs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "manager_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_staffs_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "sales_staffs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "sales_staff_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "customers_sales_staff_id_fkey" FOREIGN KEY ("sales_staff_id") REFERENCES "sales_staffs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sales_staff_id" INTEGER NOT NULL,
    "report_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "problem" TEXT,
    "plan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_reports_sales_staff_id_fkey" FOREIGN KEY ("sales_staff_id") REFERENCES "sales_staffs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visit_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "daily_report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visit_records_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visit_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "manager_comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "daily_report_id" INTEGER NOT NULL,
    "commenter_id" INTEGER NOT NULL,
    "comment_body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "manager_comments_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "manager_comments_commenter_id_fkey" FOREIGN KEY ("commenter_id") REFERENCES "sales_staffs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_staffs_email_key" ON "sales_staffs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reports_sales_staff_id_report_date_key" ON "daily_reports"("sales_staff_id", "report_date");
