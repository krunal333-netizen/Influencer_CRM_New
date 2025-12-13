# Payouts Module

The Payouts module manages financial payouts, payment status tracking, document linkage (Invoice ↔ PO ↔ Payout), and provides audit trails for payment processing.

## Features

- **Payout Management**: Create and manage payouts for influencer commissions and campaign payments
- **Payment Status Tracking**: Track payment status with automatic timestamp recording
- **Status History**: Maintain an audit trail of all status changes
- **Document Linkage**: Link invoices, purchase orders, and payouts together
- **Payment Timeline**: View the complete payment processing timeline
- **Influencer & Campaign Payouts**: Get payment summaries by influencer or campaign

## Endpoints

### Create Payout

- **POST** `/payouts` - Create a new payout
  - Request body: `CreatePayoutDto`
  - Returns: Created payout with relationships

### List Payouts

- **GET** `/payouts` - List all payouts with filtering
  - Query params: `status`, `type`, `influencerId`, `campaignId`, `dateFrom`, `dateTo`, `page`, `limit`
  - Returns: Paginated payouts

### Get Payout Details

- **GET** `/payouts/:id` - Get a specific payout
  - Returns: Payout with full details

### Update Payout

- **PUT** `/payouts/:id` - Update payout amount, status, or notes
  - Request body: `UpdatePayoutDto`
  - Returns: Updated payout

### Update Payment Status

- **PUT** `/payouts/:id/status` - Update payment status
  - Request body: `{status: PaymentStatus, notes?: string}`
  - Returns: Updated payout with status history

### Delete Payout

- **DELETE** `/payouts/:id` - Delete a payout

### Payment Timeline

- **GET** `/payouts/:id/timeline` - Get payment status timeline
  - Returns: Timeline with requested, approved, processing, paid, failed dates

### Audit Trail

- **GET** `/payouts/:id/audit-trail` - Get complete audit trail
  - Returns: Sorted history of all status changes

### Payouts by Influencer

- **GET** `/payouts/by-influencer/:influencerId` - Get all payouts for an influencer
  - Returns: Influencer payouts with summary stats (total, by status, by type)

### Payouts by Campaign

- **GET** `/payouts/by-campaign/:campaignId` - Get all payouts for a campaign
  - Returns: Campaign payouts with budget utilization

### Link Documents

- **POST** `/payouts/link-documents` - Link Invoice, PO, or Payout documents
  - Request body: `CreateDocumentLinkDto`
  - Returns: Created document link

### Get Document Links

- **GET** `/payouts/document-links/:documentId` - Get all linked documents
  - Returns: All documents linked to the specified document

### Remove Document Link

- **DELETE** `/payouts/document-links/:linkId` - Remove a document link
  - Returns: Deleted link

## Data Models

### Payout

```prisma
model Payout {
  id              String
  type            PayoutType          (INFLUENCER_COMMISSION, CAMPAIGN_PAYMENT, REFUND)
  amount          Decimal             (12, 2)
  currency        String              (default: USD)
  status          PaymentStatus       (PENDING, APPROVED, PROCESSING, PAID, FAILED, CANCELLED)
  influencer      Influencer?         (optional)
  campaign        Campaign?           (optional)
  invoiceId       String?             (link to FinancialDocument)
  poId            String?             (link to FinancialDocument)
  requestedAt     DateTime            (creation time)
  approvedAt      DateTime?
  processedAt     DateTime?
  paidAt          DateTime?
  failedAt        DateTime?
  statusHistory   Json?               (array of {status, timestamp, notes, changedBy})
  notes           String?
  metadata        Json?
  createdAt       DateTime
  updatedAt       DateTime
}

enum PaymentStatus {
  PENDING
  APPROVED
  PROCESSING
  PAID
  FAILED
  CANCELLED
}

enum PayoutType {
  INFLUENCER_COMMISSION
  CAMPAIGN_PAYMENT
  REFUND
}
```

### DocumentLink

```prisma
model DocumentLink {
  id                   String
  primaryDocumentId    String
  primaryDocumentType  String        (INVOICE, PO, PAYOUT)
  linkedDocumentId     String
  linkedDocumentType   String        (INVOICE, PO, PAYOUT)
  relationship         String        (e.g., "invoice_for_po", "payout_for_invoice")
  notes                String?
  createdAt            DateTime
  updatedAt            DateTime
}
```

## Status Transition Flow

```
PENDING -> APPROVED
APPROVED -> PROCESSING
PROCESSING -> PAID
(Any status) -> FAILED
(Any status) -> CANCELLED
```

## Status History Entry Format

Each entry in `statusHistory` contains:

```json
{
  "status": "PAID",
  "timestamp": "2024-01-15T10:30:00Z",
  "notes": "Payment processed successfully",
  "changedBy": "admin-user-id (optional)"
}
```

## Document Linkage Examples

- Invoice for PO: `{primaryDocumentType: "PO", linkedDocumentType: "INVOICE", relationship: "invoice_for_po"}`
- Payout for Invoice: `{primaryDocumentType: "INVOICE", linkedDocumentType: "PAYOUT", relationship: "payout_for_invoice"}`
- Payout for PO: `{primaryDocumentType: "PO", linkedDocumentType: "PAYOUT", relationship: "payout_for_po"}`

## Summary Statistics

### Influencer Payouts Summary

- Total payouts
- Total amount
- Breakdown by status (PENDING, APPROVED, PROCESSING, PAID, FAILED)
- Breakdown by type (INFLUENCER_COMMISSION, CAMPAIGN_PAYMENT, REFUND)

### Campaign Payouts Summary

- Campaign details (id, name, budget)
- Total payouts
- Total amount
- Budget utilization percentage
- Status breakdown
