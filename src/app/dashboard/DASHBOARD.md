# Distribution Dashboard API

**Endpoint:** `GET /api/v1/distribution/dashboard`  
**Auth:** Required (JWT Bearer token)

Returns a comprehensive view of the distribution channel: consignments, bulk orders, payments, invoices, and documents.

---

## Full Response Structure

```json
{
  "success": true,
  "message": "Distribution dashboard retrieved",
  "data": {
    "summary": {
      "consignments": {
        "total": "number",
        "byStatus": {
          "pending": "number",
          "received": "number",
          "inspected": "number",
          "available": "number",
          "partial_out": "number",
          "closed": "number"
        },
        "totalItemsReceived": "number",
        "totalValue": "number"
      },
      "bulkOrders": {
        "total": "number",
        "byStatus": {
          "pending": "number",
          "confirmed": "number",
          "packing": "number",
          "completed": "number",
          "cancelled": "number"
        },
        "totalRevenue": "number",
        "totalPaid": "number",
        "totalPending": "number",
        "byPaymentStatus": {
          "pending": "number",
          "partial": "number",
          "paid": "number"
        }
      },
      "documents": {
        "consignmentDocs": "number",
        "bulkOrderDocs": "number",
        "consignmentByType": {
          "invoice": "number",
          "packing_list": "number"
        },
        "bulkOrderByType": {
          "invoice": "number",
          "delivery_note": "number",
          "receipt": "number"
        }
      }
    },
    "recentConsignments": [
      {
        "id": "string",
        "referenceNumber": "string",
        "supplierName": "string",
        "status": "string",
        "receivedAt": "string | null (ISO date)",
        "itemCount": "number",
        "totalQuantity": "number",
        "totalValue": "number",
        "documentCount": "number",
        "createdAt": "string (ISO date)"
      }
    ],
    "recentBulkOrders": [
      {
        "id": "string",
        "referenceNumber": "string",
        "buyerName": "string",
        "buyerCompany": "string | null",
        "status": "string",
        "totalAmount": "number",
        "amountPaid": "number",
        "paymentStatus": "string | null",
        "invoiceNumber": "string | null",
        "itemCount": "number",
        "documentCount": "number",
        "createdAt": "string (ISO date)"
      }
    ],
    "recentConsignmentDocuments": [
      {
        "id": "string",
        "consignmentId": "string",
        "documentType": "string",
        "secure_url": "string",
        "public_id": "string",
        "createdAt": "string (ISO date)"
      }
    ],
    "recentBulkOrderDocuments": [
      {
        "id": "string",
        "bulkOrderId": "string",
        "documentType": "string",
        "secure_url": "string",
        "public_id": "string",
        "createdAt": "string (ISO date)"
      }
    ],
    "allConsignments": [
      {
        "id": "string",
        "referenceNumber": "string",
        "supplierName": "string",
        "supplierReference": "string | null",
        "receivedAt": "string | null",
        "status": "string",
        "warehouseLocation": "string | null",
        "notes": "string | null",
        "receivedById": "string | null",
        "createdAt": "string",
        "updatedAt": "string",
        "items": [
          {
            "id": "string",
            "sku": "string",
            "description": "string",
            "brand": "string | null",
            "model": "string | null",
            "quantity": "number",
            "unit": "string",
            "unitCost": "number | null",
            "condition": "string | null",
            "metadata": "object | null"
          }
        ],
        "documents": [
          {
            "id": "string",
            "documentType": "string",
            "secure_url": "string",
            "public_id": "string",
            "createdAt": "string"
          }
        ],
        "receivedBy": {
          "id": "string",
          "first_name": "string",
          "last_name": "string",
          "email": "string"
        } | null
      }
    ],
    "allBulkOrders": [
      {
        "id": "string",
        "referenceNumber": "string",
        "buyerName": "string",
        "buyerEmail": "string | null",
        "buyerPhone": "string | null",
        "buyerCompany": "string | null",
        "status": "string",
        "totalAmount": "number | null",
        "amountPaid": "number | null",
        "paymentStatus": "string | null",
        "paymentMethod": "string | null",
        "paidAt": "string | null",
        "invoiceNumber": "string | null",
        "notes": "string | null",
        "createdById": "string | null",
        "createdAt": "string",
        "updatedAt": "string",
        "items": [
          {
            "id": "string",
            "bulkOrderId": "string",
            "consignmentItemId": "string",
            "quantity": "number",
            "unitPrice": "number | null",
            "consignmentItem": {
              "id": "string",
              "sku": "string",
              "description": "string",
              "brand": "string | null",
              "model": "string | null",
              "quantity": "number",
              "unit": "string",
              "unitCost": "number | null"
            }
          }
        ],
        "documents": [
          {
            "id": "string",
            "documentType": "string",
            "secure_url": "string",
            "public_id": "string",
            "createdAt": "string"
          }
        ]
      }
    ]
  },
  "statusCode": 200
}
```

---

## Schema Additions (BulkOrder)

| Field          | Type     | Description                                |
|----------------|----------|--------------------------------------------|
| totalAmount    | Float?   | Order total (or computed from items)       |
| amountPaid     | Float?   | Amount paid so far                         |
| paymentStatus  | Enum?    | pending \| partial \| paid                 |
| paymentMethod  | String?  | bank_transfer, cash, etc.                  |
| paidAt         | DateTime?| When payment was completed                 |
| invoiceNumber  | String?  | Unique invoice reference                   |

## BulkOrderDocument

| Field        | Type   | Description                    |
|-------------|--------|--------------------------------|
| bulkOrderId | String | FK to BulkOrder                |
| documentType| String | invoice, delivery_note, receipt|
| secure_url  | String | Document URL                   |
| public_id   | String | Storage public ID              |
