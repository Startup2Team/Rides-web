# Admin Backend — Implementation Tasks

All endpoints are prefixed with `/api/v1`. All request/response bodies are JSON unless noted.
Auth: Bearer token in `Authorization` header (JWT). All admin-only routes require the token.

---

## 1. Authentication

### POST `/api/v1/admin/auth/login`
**Step 1 — credentials**

Request:
```json
{
  "email": "string",
  "password": "string"
}
```

Response `200`:
```json
{
  "token": "string (JWT)",
  "admin": {
    "id": "string",
    "name": "string",
    "email": "string",
    "roleId": "string",
    "twoFactorEnabled": true
  },
  "requiresTwoFactor": true
}
```

- If `requiresTwoFactor: true`, client must call the verify endpoint before the token is valid for protected routes.
- If `twoFactorEnabled: false`, the server should initiate a TOTP setup flow (return a `totpSecret` + `qrCodeUrl`).

---

### POST `/api/v1/admin/auth/totp/setup`
**Returns TOTP secret + QR code for first-time setup.**

Request: _(no body, auth: partial token from login)_

Response `200`:
```json
{
  "secret": "string (base32)",
  "qrCodeUrl": "string (otpauth://... URI)",
  "backupCodes": ["string × 10"]
}
```

---

### POST `/api/v1/admin/auth/totp/verify`
**Verifies OTP during login or setup.**

Request:
```json
{
  "code": "string (6-digit TOTP)"
}
```

Or with backup code:
```json
{
  "backupCode": "string (format: XXXXX-XXXXX)"
}
```

Response `200`:
```json
{
  "token": "string (full JWT, valid for all routes)"
}
```

---

### POST `/api/v1/admin/auth/totp/reset`
**Resets TOTP — invalidates old secret, issues new one.**

Request:
```json
{
  "code": "string (current 6-digit OTP to confirm identity)"
}
```

Response `200`: same shape as `/totp/setup` (new secret, qr, backup codes).

---

### POST `/api/v1/admin/auth/totp/disable`
**Disables 2FA for the authenticated admin.**

Request:
```json
{
  "password": "string"
}
```

Response `200`: `{ "message": "2FA disabled" }`

---

### POST `/api/v1/admin/auth/logout`

Request: _(no body)_

Response `200`: `{ "message": "logged out" }`

---

## 2. Account (self-service for authenticated admin)

### GET `/api/v1/admin/account/me`

Response `200`:
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "string (display name)",
  "roleId": "string",
  "photoUrl": "string | null",
  "twoFactorEnabled": true
}
```

---

### PATCH `/api/v1/admin/account/me`
**Update profile (name, phone, photo).**

Request (multipart/form-data OR JSON):
```json
{
  "name": "string",
  "phone": "string"
}
```

File field: `photo` (image upload, optional).

Response `200`: updated admin object (same shape as GET above).

---

### POST `/api/v1/admin/account/change-password`

Request:
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 10 chars)"
}
```

Response `200`: `{ "message": "password updated" }`
Response `400`: `{ "error": "current_password_wrong" | "password_too_short" | "passwords_match" }`

---

### GET `/api/v1/admin/account/sessions`

Response `200`:
```json
{
  "sessions": [
    {
      "id": "string",
      "device": "string",
      "browser": "string",
      "location": "string",
      "ip": "string",
      "lastActiveAt": "ISO8601",
      "current": true
    }
  ]
}
```

---

### DELETE `/api/v1/admin/account/sessions/:sessionId`
**Revoke a specific session (force logout that device).**

Response `200`: `{ "message": "session revoked" }`

---

## 3. Drivers

### GET `/api/v1/admin/drivers`

Query params:
- `status`: `"all" | "Active" | "Online" | "Suspended" | "Pending"` (default `all`)
- `vehicleType`: `"all" | "moto" | "cab" | "hilux" | "fuso"` (default `all`)
- `q`: search string (name, phone, plate)
- `page`: number (default 1)
- `limit`: number (default 20)

Response `200`:
```json
{
  "total": 142,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "fullName": "string",
      "phone": "string",
      "dob": "YYYY-MM-DD",
      "address": {
        "province": "string",
        "district": "string",
        "sector": "string",
        "cell": "string",
        "village": "string"
      },
      "vehicle": {
        "type": "moto | cab | hilux | fuso",
        "plate": "string (e.g. RAB 410 U)",
        "licenseNumber": "string",
        "passengerSeats": "number | null",
        "loadCapacityKg": "number | null"
      },
      "documents": {
        "license": "url | null",
        "insurance": "url | null",
        "authorization": "url | null"
      },
      "payment": {
        "momoProvider": "mtn | airtel",
        "momoCode": "string"
      },
      "status": "Active | Pending | Suspended | Rejected",
      "verificationStatus": "Unverified | Under review | Verified | Rejected",
      "rating": 4.9,
      "totalTrips": 432,
      "totalEarnings": 1544400,
      "onlineNow": false,
      "onTrip": false,
      "joinedAt": "ISO8601"
    }
  ]
}
```

---

### GET `/api/v1/admin/drivers/overview`

Response `200`:
```json
{
  "total": 142,
  "onlineNow": 89,
  "onTrip": 34,
  "pendingVerification": 7,
  "byVehicle": [
    {
      "type": "moto",
      "label": "Moto Bike",
      "total": 58,
      "online": 41,
      "onTrip": 12,
      "pendingKyc": 3
    }
  ]
}
```

---

### GET `/api/v1/admin/drivers/:id`

Response `200`: full driver object (same shape as list item, with full document URLs).

---

### POST `/api/v1/admin/drivers`
**Register a new driver (multi-step form submission).**

Request (multipart/form-data):

Fields:
- `fullName` string
- `phone` string
- `dob` string (YYYY-MM-DD)
- `province` string
- `district` string
- `sector` string
- `cell` string
- `village` string
- `vehicleType` string (`moto | cab | hilux | fuso`)
- `plate` string (Rwanda format: `/^R[A-Z]{2}\s\d{3}\s[A-Z]$/`)
- `licenseNumber` string (uppercase)
- `passengerSeats` number (required if vehicleType is `cab` or `hilux`)
- `loadCapacityKg` number (required if vehicleType is `fuso`)
- `momoProvider` string (`mtn | airtel`)
- `momoCode` string
- `licenseDoc` file
- `insuranceDoc` file
- `authorizationDoc` file

Response `201`:
```json
{ "id": "string", "message": "driver registered, pending verification" }
```

---

### PATCH `/api/v1/admin/drivers/:id`
**Edit driver fields (admin can update any field).**

Request: partial driver object (any subset of POST fields, JSON or multipart).

Response `200`: updated driver object.

---

### PATCH `/api/v1/admin/drivers/:id/verify`
**Approve or reject a pending driver.**

Request:
```json
{
  "action": "approve | reject",
  "reason": "string (required if reject)"
}
```

Response `200`: `{ "message": "driver approved" | "driver rejected" }`

---

### PATCH `/api/v1/admin/drivers/:id/status`
**Suspend or reinstate a driver.**

Request:
```json
{
  "status": "Active | Suspended",
  "reason": "string"
}
```

Response `200`: `{ "status": "Active | Suspended" }`

---

### DELETE `/api/v1/admin/drivers/:id`
**Permanently remove a driver record.**

Response `200`: `{ "message": "deleted" }`

---

## 4. Customers

### GET `/api/v1/admin/customers`

Query params:
- `status`: `"all" | "Active" | "VIP" | "Banned"` (default `all`)
- `q`: search (name, email, phone)
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "joinedAt": "ISO8601",
      "totalTrips": 24,
      "totalSpend": 82500,
      "avgFare": 3438,
      "lastTripAt": "ISO8601",
      "rating": 4.8,
      "preferredVehicle": "string",
      "status": "Active | VIP | Banned",
      "notes": "string | null"
    }
  ]
}
```

---

### GET `/api/v1/admin/customers/:id`

Response `200`: full customer object plus:
```json
{
  "recentTrips": [
    {
      "id": "string",
      "date": "ISO8601",
      "from": "string",
      "to": "string",
      "vehicle": "string",
      "fare": 3500,
      "status": "Completed | Cancelled | Disputed"
    }
  ]
}
```

---

### PATCH `/api/v1/admin/customers/:id`
**Update notes or status.**

Request:
```json
{
  "status": "Active | VIP | Banned",
  "notes": "string"
}
```

Response `200`: updated customer object.

---

### PATCH `/api/v1/admin/customers/:id/ban`

Request:
```json
{
  "reason": "string"
}
```

Response `200`: `{ "status": "Banned" }`

---

## 5. Live Rides

### GET `/api/v1/admin/rides/live`

Query params:
- `status`: `"all" | "Searching" | "Negotiating" | "Driver arriving" | "On trip"` (default `all`)
- `district`: string (optional filter)
- `q`: search (customer name, driver name, ride id)

Response `200`:
```json
{
  "data": [
    {
      "id": "string",
      "customer": {
        "name": "string",
        "phone": "string",
        "rating": 4.8
      },
      "driver": {
        "name": "string",
        "phone": "string",
        "vehicleType": "string",
        "plate": "string",
        "rating": 4.7
      },
      "pickup": "string",
      "destination": "string",
      "vehicleType": "string",
      "status": "Searching | Negotiating | Driver arriving | On trip",
      "startedAt": "ISO8601",
      "etaMinutes": 8,
      "fare": 3500,
      "paymentMethod": "MTN MoMo | Airtel Money | Cash",
      "district": "string",
      "position": { "lat": 0.0, "lng": 0.0 },
      "timeline": [
        {
          "time": "ISO8601",
          "event": "string",
          "kind": "system | negotiation | trip | alert"
        }
      ],
      "negotiation": [
        {
          "round": 1,
          "from": "customer | driver",
          "amount": 3000,
          "time": "ISO8601"
        }
      ]
    }
  ]
}
```

---

### GET `/api/v1/admin/rides/live/:id`

Response `200`: full single live ride object (same shape as list item).

---

### POST `/api/v1/admin/rides/live/:id/intervene`
**Admin intervention on an active ride.**

Request:
```json
{
  "action": "cancel | force-complete | reassign",
  "reason": "string"
}
```

Response `200`: `{ "message": "action applied" }`

---

## 6. Negotiations

### GET `/api/v1/admin/negotiations`

Query params:
- `status`: `"all" | "Agreed" | "Failed" | "In progress" | "Disputed"` (default `all`)
- `q`: search
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "customer": { "name": "string", "phone": "string", "rating": 4.8 },
      "driver": { "name": "string", "phone": "string", "vehicleType": "string", "plate": "string", "rating": 4.9 },
      "pickup": "string",
      "destination": "string",
      "vehicleType": "string",
      "initial": 3000,
      "final": 3800,
      "rounds": 4,
      "status": "Agreed | Failed | In progress | Disputed",
      "startedAt": "ISO8601",
      "durationSec": 84,
      "paymentMethod": "string",
      "failureReason": "string | null",
      "offers": [
        {
          "round": 1,
          "from": "customer | driver",
          "amount": 3000,
          "time": "ISO8601"
        }
      ]
    }
  ]
}
```

---

### GET `/api/v1/admin/negotiations/:id`

Response `200`: full single negotiation object.

---

## 7. Revenue

### GET `/api/v1/admin/revenue`

Query params:
- `period`: `"today" | "7d" | "30d" | "month" | "quarter" | "year"` (default `month`)

Response `200`:
```json
{
  "period": "month",
  "gross": 38200000,
  "commission": 4584000,
  "payouts": 33616000,
  "trips": 32184,
  "pendingPayouts": 2100000,
  "pendingCount": 412,
  "deltas": {
    "gross": 12.4,
    "commission": 12.4,
    "payouts": 12.1,
    "avgFare": 3.2
  },
  "trend": [
    { "label": "W1", "value": 7100000 }
  ],
  "byVehicle": [
    { "vehicle": "Cab Taxi", "pct": 62, "amount": 23684000 }
  ],
  "byPayment": [
    { "method": "MTN MoMo", "pct": 62, "amount": 23684000 }
  ],
  "topZones": [
    { "name": "Kigali Heights", "revenue": 612000, "trend": 8.2 }
  ]
}
```

---

### GET `/api/v1/admin/revenue/transactions`

Query params:
- `period`: same as above
- `type`: `"all" | "commission" | "payout" | "refund"`
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "type": "commission | payout | refund",
      "amount": 3500,
      "rideId": "string",
      "driver": { "name": "string", "momoCode": "string" },
      "customer": { "name": "string" },
      "paymentMethod": "MTN MoMo | Airtel Money | Cash",
      "status": "Completed | Pending | Failed",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### POST `/api/v1/admin/revenue/payouts/disburse`
**Trigger payout disbursement for pending transactions.**

Request:
```json
{
  "transactionIds": ["string"]
}
```

Response `200`: `{ "disbursed": 84, "totalAmount": 412000 }`

---

## 8. Analytics

### GET `/api/v1/admin/analytics`

Query params:
- `period`: `"week" | "month" | "quarter" | "year"` (default `month`)

Response `200`:
```json
{
  "period": "month",
  "totalTrips": 32184,
  "conversionRate": 84.0,
  "avgDurationMin": 14.1,
  "repeatRiders": 67.0,
  "trend": [
    { "label": "W1", "value": 7100 }
  ],
  "funnel": [
    { "label": "Ride requested", "count": 38312, "pct": 100 },
    { "label": "Driver matched", "count": 36240, "pct": 95 },
    { "label": "Negotiation agreed", "count": 32450, "pct": 85 },
    { "label": "Ride completed", "count": 32184, "pct": 84 }
  ],
  "vehicleMix": [
    { "label": "Cab Taxi", "pct": 62 }
  ],
  "satisfaction": {
    "avg": 4.8,
    "breakdown": [
      { "stars": 5, "pct": 79 }
    ]
  },
  "topPerformers": [
    {
      "name": "string",
      "vehicleType": "string",
      "trips": 432,
      "rating": 4.95
    }
  ],
  "heatmap": [
    {
      "day": 0,
      "hour": 0,
      "trips": 4
    }
  ]
}
```

`day` is 0=Monday through 6=Sunday. `hour` is 0–23.

---

## 9. Heatmaps

### GET `/api/v1/admin/heatmaps`

Query params:
- `period`: `"today" | "7d" | "30d"`
- `vehicleType`: `"all" | "moto" | "cab" | "hilux" | "fuso"`

Response `200`:
```json
{
  "zones": [
    {
      "id": "string",
      "name": "string",
      "lat": 0.0,
      "lng": 0.0,
      "trips": 1240,
      "activeDrivers": 12,
      "demandScore": 0.87,
      "avgFare": 3200,
      "peakHour": 18
    }
  ]
}
```

---

### GET `/api/v1/admin/heatmaps/zones/:id`

Response `200`:
```json
{
  "id": "string",
  "name": "string",
  "trips": 1240,
  "activeDrivers": 12,
  "avgFare": 3200,
  "hourlyBreakdown": [
    { "hour": 0, "trips": 4 }
  ],
  "vehicleBreakdown": [
    { "type": "moto", "pct": 42 }
  ],
  "topRoutes": [
    { "from": "string", "to": "string", "trips": 88 }
  ]
}
```

---

## 10. Reports

### GET `/api/v1/admin/reports`

Query params:
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "data": [
    {
      "id": "string",
      "templateId": "ops-daily | driver-performance | revenue-breakdown | negotiation-stats | customer-cohort | ride-completion",
      "range": "today | 7d | 30d | month | quarter | custom",
      "format": "PDF | CSV | Excel",
      "frequency": "once | daily | weekly | monthly",
      "recipients": ["email@example.com"],
      "status": "Generating | Ready | Failed",
      "createdAt": "ISO8601",
      "fileUrl": "string | null"
    }
  ]
}
```

---

### POST `/api/v1/admin/reports/generate`

Request:
```json
{
  "templateId": "ops-daily | driver-performance | revenue-breakdown | negotiation-stats | customer-cohort | ride-completion",
  "range": "today | 7d | 30d | month | quarter | custom",
  "rangeStart": "YYYY-MM-DD (required if range=custom)",
  "rangeEnd": "YYYY-MM-DD (required if range=custom)",
  "format": "PDF | CSV | Excel",
  "frequency": "once | daily | weekly | monthly",
  "recipients": ["email@example.com"]
}
```

Response `202`:
```json
{
  "id": "string",
  "status": "Generating",
  "message": "report queued"
}
```

---

### GET `/api/v1/admin/reports/:id/download`

Response: file download (Content-Disposition: attachment).

---

### DELETE `/api/v1/admin/reports/:id`

Response `200`: `{ "message": "deleted" }`

---

## 11. Support Tickets

### GET `/api/v1/admin/support/tickets`

Query params:
- `status`: `"all" | "Open" | "Pending" | "Resolved" | "Closed"` (default `all`)
- `priority`: `"all" | "High" | "Medium" | "Low"` (default `all`)
- `type`: `"all" | "Ride dispute" | "Refund" | "Lost item" | "Driver" | "Payment" | "Account"` (default `all`)
- `q`: search
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "subject": "string",
      "type": "Ride dispute | Refund | Lost item | Driver | Payment | Account",
      "priority": "High | Medium | Low",
      "status": "Open | Pending | Resolved | Closed",
      "fromName": "string",
      "fromRole": "Customer | Driver",
      "fromEmail": "string",
      "fromPhone": "string",
      "rideId": "string | null",
      "assignedTo": "string | null",
      "createdAt": "ISO8601",
      "lastActivityAt": "ISO8601"
    }
  ]
}
```

---

### GET `/api/v1/admin/support/tickets/:id`

Response `200`: full ticket with messages:
```json
{
  "messages": [
    {
      "id": "string",
      "from": "customer | driver | agent | system",
      "author": "string",
      "time": "ISO8601",
      "body": "string"
    }
  ]
}
```

---

### POST `/api/v1/admin/support/tickets/:id/reply`

Request:
```json
{
  "body": "string"
}
```

Response `201`: the new message object.

---

### PATCH `/api/v1/admin/support/tickets/:id`
**Update status, priority, or assignee.**

Request:
```json
{
  "status": "Open | Pending | Resolved | Closed",
  "priority": "High | Medium | Low",
  "assignedTo": "adminId string"
}
```

Response `200`: updated ticket object.

---

## 12. Inbox (Contact Messages)

### GET `/api/v1/admin/inbox`

Query params:
- `status`: `"all" | "New" | "Replied" | "Spam"` (default `all`)
- `category`: `"all" | "Driver application" | "Partnership" | "Complaint" | "Press" | "General" | "Other"` (default `all`)
- `q`: search
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "subject": "string",
      "category": "Driver application | Partnership | Complaint | Press | General | Other",
      "status": "New | Replied | Spam",
      "receivedAt": "ISO8601",
      "body": "string"
    }
  ]
}
```

---

### GET `/api/v1/admin/inbox/:id`

Response `200`: message + replies:
```json
{
  "replies": [
    {
      "id": "string",
      "author": "string",
      "time": "ISO8601",
      "body": "string"
    }
  ]
}
```

---

### POST `/api/v1/admin/inbox/:id/reply`

Request:
```json
{
  "body": "string"
}
```

Response `201`: reply object.

---

### PATCH `/api/v1/admin/inbox/:id`

Request:
```json
{
  "status": "New | Replied | Spam"
}
```

Response `200`: updated message.

---

### DELETE `/api/v1/admin/inbox/:id`

Response `200`: `{ "message": "deleted" }`

---

## 13. Safety Center / Incidents

### GET `/api/v1/admin/incidents`

Query params:
- `status`: `"all" | "Open" | "Acknowledged" | "Escalated" | "Resolved"` (default `all`)
- `severity`: `"all" | "Critical" | "High" | "Medium" | "Low"` (default `all`)
- `type`: `"all" | "SOS Alert" | "Driver complaint" | "Customer complaint" | "Fraud signal" | "Fake GPS" | "Lost item" | "Accident" | "Safety check"` (default `all`)
- `q`: search
- `page`, `limit`

Response `200`:
```json
{
  "total": 0,
  "data": [
    {
      "id": "string",
      "type": "SOS Alert | Driver complaint | Customer complaint | Fraud signal | Fake GPS | Lost item | Accident | Safety check",
      "severity": "Critical | High | Medium | Low",
      "status": "Open | Acknowledged | Escalated | Resolved",
      "rideId": "string | null",
      "reportedAt": "ISO8601",
      "reporter": {
        "name": "string",
        "phone": "string",
        "role": "Customer | Driver | System"
      },
      "involves": [
        {
          "name": "string",
          "phone": "string",
          "role": "Customer | Driver",
          "vehicleType": "string | null",
          "plate": "string | null"
        }
      ],
      "timeline": [
        {
          "time": "ISO8601",
          "event": "string",
          "kind": "system | ops | alert"
        }
      ],
      "notes": "string | null"
    }
  ]
}
```

---

### GET `/api/v1/admin/incidents/:id`

Response `200`: full incident object.

---

### PATCH `/api/v1/admin/incidents/:id/status`

Request:
```json
{
  "status": "Acknowledged | Escalated | Resolved",
  "event": "string (log entry to append to timeline)"
}
```

Response `200`: updated incident.

---

### POST `/api/v1/admin/incidents/:id/message`
**Send a message to an involved party (customer or driver).**

Request:
```json
{
  "party": "Customer | Driver",
  "body": "string"
}
```

Response `201`: `{ "message": "sent" }`

---

## 14. Team & Admin Management

### GET `/api/v1/admin/team`

Response `200`:
```json
{
  "admins": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "roleId": "string",
      "status": "Active | Invited | Suspended",
      "lastActiveAt": "ISO8601 | null",
      "twoFactor": true,
      "notes": "string | null",
      "invitedAt": "ISO8601 | null"
    }
  ]
}
```

---

### POST `/api/v1/admin/team/invite`
**Invite a new admin (sends setup email).**

Request:
```json
{
  "name": "string",
  "email": "string",
  "roleId": "string",
  "temporaryPassword": "string",
  "notes": "string | null"
}
```

Response `201`:
```json
{
  "id": "string",
  "message": "invite sent"
}
```

---

### PATCH `/api/v1/admin/team/:id`
**Update name, role, notes, or status.**

Request:
```json
{
  "name": "string",
  "roleId": "string",
  "status": "Active | Suspended",
  "notes": "string"
}
```

Response `200`: updated admin object.

---

### DELETE `/api/v1/admin/team/:id`
**Remove an admin account.**

Response `200`: `{ "message": "deleted" }`

---

### GET `/api/v1/admin/team/roles`

Response `200`:
```json
{
  "roles": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "permissions": ["string"],
      "isSystem": false,
      "adminCount": 2
    }
  ]
}
```

Possible permission values (page slugs):
- `"*"` (super / full access)
- `"/admin"`
- `"/admin/drivers"`
- `"/admin/customers"`
- `"/admin/live-rides"`
- `"/admin/negotiations"`
- `"/admin/heatmaps"`
- `"/admin/revenue"`
- `"/admin/analytics"`
- `"/admin/reports"`
- `"/admin/safety-center"`
- `"/admin/support"`
- `"/admin/inbox"`
- `"/admin/settings"`
- `"/admin/team"`

---

### POST `/api/v1/admin/team/roles`
**Create a custom role.**

Request:
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

Response `201`: created role object.

---

### PATCH `/api/v1/admin/team/roles/:roleId`
**Update a non-system role's name, description, or permissions.**

Request:
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

Response `200`: updated role.

---

### DELETE `/api/v1/admin/team/roles/:roleId`

Response `200`: `{ "message": "deleted" }`
Response `400`: `{ "error": "cannot_delete_system_role" }` if `isSystem: true`.

---

## 15. System Settings

### GET `/api/v1/admin/settings`

Response `200`:
```json
{
  "commission": {
    "moto": 12,
    "cab": 15,
    "hilux": 16,
    "fuso": 18
  },
  "negotiation": {
    "maxRounds": 4,
    "responseTimeoutSec": 15,
    "maskedCallSec": 30
  },
  "fares": {
    "moto": { "baseFare": 500, "perKm": 180 },
    "cab": { "baseFare": 1000, "perKm": 300 },
    "hilux": { "baseFare": 1500, "perKm": 450 },
    "fuso": { "baseFare": 3000, "perKm": 800 }
  },
  "regions": [
    {
      "id": "string",
      "name": "string",
      "status": "Active | Pilot | Coming soon",
      "drivers": 89
    }
  ],
  "integrations": {
    "mtnMomo": true,
    "airtelMoney": true,
    "mapsProvider": "Google | Mapbox | OSM",
    "sms": true,
    "email": true
  },
  "notifications": {
    "sosToOps": true,
    "sosToAdmins": true,
    "payoutSummary": true,
    "weeklyDigest": true,
    "incidentEscalation": true
  }
}
```

---

### PATCH `/api/v1/admin/settings`
**Update one or more settings sections (partial update).**

Request: partial settings object (any top-level key and its nested fields).

Example — update commission only:
```json
{
  "commission": {
    "moto": 13,
    "cab": 15,
    "hilux": 16,
    "fuso": 18
  }
}
```

Response `200`: full updated settings object.

---

### POST `/api/v1/admin/settings/regions`
**Add a new region.**

Request:
```json
{
  "name": "string",
  "status": "Active | Pilot | Coming soon"
}
```

Response `201`: created region `{ "id": "string", "name": "string", "status": "string", "drivers": 0 }`.

---

### PATCH `/api/v1/admin/settings/regions/:regionId`

Request:
```json
{
  "name": "string",
  "status": "Active | Pilot | Coming soon"
}
```

Response `200`: updated region.

---

### DELETE `/api/v1/admin/settings/regions/:regionId`

Response `200`: `{ "message": "deleted" }`

---

## 16. Dashboard Summary

### GET `/api/v1/admin/dashboard`
**Top-level stats for the home page.**

Response `200`:
```json
{
  "liveRides": 34,
  "onlineDrivers": 89,
  "openTickets": 12,
  "revenueToday": 4200000,
  "pendingVerifications": 7,
  "openIncidents": 3
}
```

---

## Error Format (all endpoints)

```json
{
  "error": "snake_case_code",
  "message": "Human readable description",
  "details": {}
}
```

Common codes: `unauthorized`, `forbidden`, `not_found`, `validation_error`, `internal_error`.

---

## Auth Notes

- JWT should include: `adminId`, `roleId`, `permissions[]`, `exp`
- Middleware must enforce permissions per route based on the permission slugs in the token
- Routes under `/api/v1/admin/team` and `/api/v1/admin/settings` require `"*"` or explicit slug
- 2FA token state: issue a short-lived "pre-auth" token after credentials, then upgrade to full token after TOTP verify
