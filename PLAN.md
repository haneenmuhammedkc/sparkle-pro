# SparklePro — Product & Architectural Master Plan (PLAN.md)

> **Core Operating Principle**: SparklePro is an **Owner-Centric Workshop & Car Wash Management System**. The workshop owner is the sole application user and administrator. Staff members are operational records used strictly for job assignment and workload monitoring (they do NOT have login accounts or a portal). Customers monitor vehicle progress via secure WhatsApp tracking links (`/tracking/:token`) without creating an account.

---

## 1. Executive Summary & Product Vision
SparklePro is a modern, high-performance SaaS platform built specifically for vehicle wash, detailing, and auto service workshops. It simplifies workshop operations by giving the workshop owner complete control over check-ins, job workflows, staff assignments, customer tracking, service pricing, payment recording, and business analytics.

---

## 2. Business Workflow & Operational Roles

### 2.1 Owner (Primary Administrator)
- **Account Control**: Registers workshop, completes email verification, and configures workshop profile (hours, logo, tax rate, currency, bays, holidays).
- **Staff Management**: Creates staff records (name, phone, role, avatar, status) to assign workers to jobs and monitor workload.
- **Service Management**: Defines service catalogs with category-specific pricing (2-wheeler, 4-wheeler, SUV, Custom/Heavy).
- **Job Lifecycle Control**: Creates jobs, assigns staff, updates progress across workflow stages (Wait → Wash → Interior → QC → Ready → Completed), and cancels jobs if necessary.
- **Payment Processing**: Records manual payments (Cash, UPI, Card, POS) received directly from customers at the workshop.
- **Analytics & Reporting**: Tracks real-time workshop revenue, job volume, staff performance, customer visit trends, and vehicle category distribution.

### 2.2 Customer (Vehicle Tracking User)
- **No Registration Required**: Receives a secure WhatsApp tracking link (`/tracking/:token`) upon job creation.
- **Live Status Monitoring**: Views real-time vehicle status, current workflow step, estimated completion time, immutable service price breakdown, and direct workshop contact options (Call / WhatsApp).

### 2.3 Staff (Operational Records Only)
- **No Login / No Portal / No JWT**: Staff are **not** system users.
- **Operational Utility**: Staff records exist in MongoDB purely for job assignment, workload distribution, and performance tracking by the owner.

---

## 3. System Architecture & Feature Inventory

### 3.1 Feature Inventory & Module Status

| Feature Module | Description | Status |
|---|---|---|
| **Owner Authentication** | Register, Login, Refresh Token (RTR), Logout, OTP Email Verify, Password Reset | **[COMPLETED]** |
| **Workshop Setup / Onboarding** | Step-by-step business wizard (Details, Services, Bays, Tax, Capacity) | **[COMPLETED]** |
| **User / Customer Tracking** | Public live tracking portal (`/tracking/:token`), plate+phone search, responsive UI | **[COMPLETED]** |
| **Job Engine & Snapshots** | Job creation, unique Job ID (`SPK-XXXX`), tracking token, immutable service snapshots | **[COMPLETED]** |
| **Workflow State Machine** | Status (`Pending` → `In Progress` → `Ready` → `Completed` / `Cancelled`) & Steps (`Wait` → `Wash` → `Interior` → `QC` → `Ready`) | **[COMPLETED]** |
| **Customer Auto-Upsert** | Automatic customer record creation and vehicle visit history tracking on job creation | **[COMPLETED]** |
| **Staff Record Management** | Staff creation, status (`AVAILABLE`, `BUSY`, `OFFLINE`), workload aggregation, assignment | **[COMPLETED]** |
| **Settings & Workshop Config** | Business profile updates, working hours, tax rates, category pricing, backup exports | **[COMPLETED]** |
| **Owner Analytics Engine** | Realized revenue, job trends, service popularity, staff performance, vehicle breakdown | **[COMPLETED]** |
| **WhatsApp Notification Engine** | WhatsApp notification generator / link trigger on job creation | **[COMPLETED]** |
| **Owner Payment Recording** | Record manual payment methods (Cash, UPI, Card), payment status, balanceAmount, & transaction refs | **[COMPLETED]** |
| **Staff Portal / Staff Authentication** | Independent staff accounts, login, staff dashboard | **[INCORRECT / REMOVED]** |

---

## 4. Domain & Technical Architecture

### 4.1 Database Architecture (MongoDB Schemas)

1. **`User` Schema**: Owner credentials, hashed password (bcrypt), role (`OWNER`), verification flags, refresh token family hashes.
2. **`Business` Schema**: Owner reference (`ownerId`), workshop name, logo, contact numbers, address, tax configuration, currency, bay configuration, category pricing rules.
3. **`Job` Schema**: Job ID, tenant references (`businessId`, `ownerId`), customer information, vehicle specifications (`vehiclePlate`, `vehicleCategory`, `wheelCategory`, `vehicleType`, `vehicleModel`), immutable service snapshot array (`name`, `price`, `duration`), totals (`subtotal`, `taxAmount`, `grandTotal`, `currency`), payment tracking (`paymentStatus`, `paymentMethod`, `paidAmount`, `balanceAmount`, `transactionRef`, `paidAt`), status, workflow step, assigned staff snapshot, tracking token, activities timeline.
4. **`Customer` Schema**: Tenant reference (`businessId`), name, normalized phone, visit history, vehicle list.
5. **`Staff` Schema**: Tenant reference (`businessId`), name, phone, role/designation, availability status (`AVAILABLE`, `BUSY`, `OFFLINE`), avatar.

### 4.2 API Architecture (Modular Monolith)

- `/api/auth` — Owner Registration, Login, Token Refresh, Password Recovery.
- `/api/owner` — Workshop Onboarding & Settings.
- `/api/owner/jobs` — Job Creation, Workflow Updates, Status Updates, Staff Reassignment, Payment Recording (`PATCH /:id/payment`).
- `/api/owner/customers` — Customer History, Search, Pagination.
- `/api/owner/staff` — Staff Record Management & Workload Metrics.
- `/api/owner/analytics` — Business Revenue, Popularity Metrics, Performance.
- `/api/public/track` — Public Rate-Limited Customer Telemetry Lookup (`token` or `plate` + `phone`).

---

## 5. Quality Assurance & Regression Verification Matrix
All 9 regression suites verified operational with 100% pass rates:
- `test_module3_jobs_suite.js` — PASSED (16/16)
- `test_module4_customers_suite.js` — PASSED (20/20)
- `test_module5_staff_suite.js` — PASSED (20/20)
- `test_module5_staff_job_integration_suite.js` — PASSED (14/14)
- `test_module6_analytics_suite.js` — PASSED (25/25)
- `test_module7_settings_suite.js` — PASSED (30/30)
- `test_module8_user_tracking_suite.js` — PASSED (30/30)
- `test_module9_payments_whatsapp_suite.js` — PASSED (9/9)
- `test_remediation_security_suite.js` — PASSED (25/25)
