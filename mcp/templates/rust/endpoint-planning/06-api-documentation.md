# {{SERVICE_NAME}} {{FEATURE_NAME}} - API Documentation

## Overview

Create comprehensive API documentation for external integrators.

## Status

🔴 Not Started

## Dependencies

- All other templates completed (01-05)
- Endpoint tested and verified working

---

## Instructions

This template creates **user-facing API documentation** for external developers integrating with this endpoint.

**Target File:** `docs/api-documentation/{{SERVICE_NAME}}-{{FEATURE_NAME}}.md`

**Purpose:**

- Document endpoint paths, methods, and authentication
- Provide request/response schemas with examples
- List all error responses
- Include working curl examples
- Explain use cases and validation rules

---

## Step 1: Copy Template to Correct Location

```bash
cp .templates/endpoint-planning/06-api-documentation.md docs/api-documentation/{{SERVICE_NAME}}-{{FEATURE_NAME}}.md
```

**Example:**

```bash
cp templates/endpoint-planning/06-api-documentation.md docs/api-documentation/products-analytics.md
```

---

## Step 2: Fill in the Template

Use the template structure below. **Remove sections that don't apply** (marked with comments).

---

## API Documentation Template

```markdown
# {{SERVICE_NAME}} {{FEATURE_NAME}} API

## Endpoint

\`\`\`
{{HTTP_METHOD}} {{ENDPOINT_PATH}}
\`\`\`

{{BRIEF_DESCRIPTION}}

---

## Authentication

<!-- CHOOSE ONE: Keep only the authentication section that applies to your endpoint -->

<!-- FOR JWT AUTHENTICATION -->
**Required Header:**
\`\`\`
x-access-token: <JWT_ACCESS_TOKEN>
\`\`\`

The JWT access token is obtained during authentication and contains user/session claims:
- `user_id`: User identifier
- `tenant_id`: Tenant/organization identifier
- `roles`: User roles/permissions
- `exp`: Token expiration timestamp

<!-- FOR API KEY AUTHENTICATION -->
**Required Header:**
\`\`\`
x-api-key: <ADMIN_API_KEY>
\`\`\`

The admin API key is a server-side secret for internal use only.

<!-- FOR WEBHOOK (HMAC VERIFICATION) -->
**Required Headers:**
\`\`\`
x-webhook-signature: <hmac_signature>
\`\`\`

Webhook HMAC verification is performed automatically using the configured webhook secret.

<!-- FOR PUBLIC ENDPOINTS -->
**No authentication required.**

This is a public endpoint accessible without credentials.

---

## Request

### Headers
\`\`\`
Content-Type: application/json
{{AUTH_HEADER_LINE}}  <!-- Example: x-access-token: <JWT_TOKEN> -->
\`\`\`

### Request Body Schema

\`\`\`json
{
  "field1": "string (required)",
  "field2": "integer (optional)",
  "nested_object": {
    "sub_field": "boolean (required)"
  }
}
\`\`\`

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field1` | string | Yes | Description of field1 |
| `field2` | integer | No | Description of field2 (default: 0) |
| `nested_object.sub_field` | boolean | Yes | Description of sub_field |

---

## Request Example

\`\`\`bash
curl -X {{HTTP_METHOD}} https://your-domain.com{{ENDPOINT_PATH}} \\
  -H "Content-Type: application/json" \\
  -H "{{AUTH_HEADER_NAME}}: {{AUTH_HEADER_VALUE}}" \\
  -d '{
    "field1": "example_value",
    "field2": 123,
    "nested_object": {
      "sub_field": true
    }
  }'
\`\`\`

---

## Response

### Success Response (200 OK)

\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "result_field": "value"
  }
}
\`\`\`

**Response Fields:**
- `success` (boolean): Operation success status
- `message` (string): Human-readable success message
- `data` (object): Response data (structure varies by endpoint)

---

## Error Responses

### 400 Bad Request
**Invalid input or missing required fields**

\`\`\`json
{
  "message": "Invalid input",
  "description": "Field 'field1' is required"
}
\`\`\`

### 401 Unauthorized
**Missing or invalid authentication**

\`\`\`json
{
  "message": "Unauthorized"
}
\`\`\`

### 404 Not Found
**Resource not found**

\`\`\`json
{
  "message": "Resource not found",
  "description": "No data exists for the provided ID"
}
\`\`\`

### 422 Unprocessable Entity
**Invalid data structure**

\`\`\`json
{
  "message": "Validation error",
  "description": "Invalid data format for field 'field1'"
}
\`\`\`

### 500 Internal Server Error
**Server-side error**

\`\`\`json
{
  "error": "Internal Error",
  "message": "Operation failed: <error details>"
}
\`\`\`

---

## Use Cases

### Use Case 1: {{USE_CASE_NAME}}

**Description:** {{USE_CASE_DESCRIPTION}}

**Example Request:**
\`\`\`json
{
  "field1": "specific_value",
  "field2": 42
}
\`\`\`

**Example Response:**
\`\`\`json
{
  "success": true,
  "message": "Success message",
  "data": {
    "result": "value"
  }
}
\`\`\`

---

<!-- OPTIONAL: Add if you have complex fields that need detailed explanation -->
## Field Specifications

### {{FIELD_NAME}}

**Type:** \`{{FIELD_TYPE}}\`  
**Required:** {{YES_OR_NO}}  
**Default:** {{DEFAULT_VALUE}}  

{{FIELD_DESCRIPTION}}

**Valid Values:**
- \`value1\`: Description of value1
- \`value2\`: Description of value2

**Example:**
\`\`\`json
{
  "{{FIELD_NAME}}": "{{EXAMPLE_VALUE}}"
}
\`\`\`

---

## Validation Rules

### Input Validation
- \`user_id\`: Must be valid UUID format
- \`field1\`: Must be non-empty string, max length 255
- \`field2\`: Must be positive integer between 1 and 100

### Business Rules
- User must exist in database before operation
- User must have permission for the requested resource
- {{ADDITIONAL_BUSINESS_RULES}}

---

<!-- OPTIONAL: Include only if endpoint uses S3 storage -->
## Storage Details

### S3 Storage

**Bucket:** \`{{S3_BUCKET_ENV_VAR}}\`  
**Path Format:** \`{{SERVICE_NAME}}/{{RESOURCE}}/{shop_id}/{{FILE_NAME}}\`  

**Example:**
- Input: \`user_id = "user-123"\`
- S3 Path: \`{{SERVICE_NAME}}/{{RESOURCE}}/user-123/{{FILE_NAME}}\`

**Content Type:** \`application/json\`

<!-- OPTIONAL: Include only if endpoint uses database storage -->
### Database Storage

**Table:** \`{{TABLE_NAME}}\`  
**Primary Key:** \`{{PRIMARY_KEY_FIELD}}\`  

Data is persisted in PostgreSQL.

---

<!-- OPTIONAL: Include only if rate limiting is implemented -->
## Rate Limiting

**Limit:** {{RATE_LIMIT}} requests per {{TIME_WINDOW}}

Exceeding the rate limit will result in:
\`\`\`json
{
  "message": "Rate limit exceeded",
  "retry_after": 60
}
\`\`\`

<!-- If NOT rate limited, use this instead:
No rate limiting applied to this endpoint.
-->

---

<!-- OPTIONAL: Include only for webhook endpoints -->
## Webhooks

### Webhook Events

This endpoint processes the following webhook events:
- \`{{WEBHOOK_TOPIC_1}}\`
- \`{{WEBHOOK_TOPIC_2}}\`

**Payload Structure:** Standard webhook payload format from the provider.

**Verification:** HMAC signature verification is performed automatically.

---

## Testing

### Test Scenario 1: Success Case
\`\`\`bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \\
  -H "Content-Type: application/json" \\
  -H "{{AUTH_HEADER_NAME}}: VALID_TOKEN" \\
  -d '{"field1": "test_value"}'

# Expected: 200 OK with success response
\`\`\`

### Test Scenario 2: Authentication Failure
\`\`\`bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \\
  -H "Content-Type: application/json" \\
  -d '{"field1": "test_value"}'

# Expected: 401 Unauthorized
\`\`\`

### Test Scenario 3: Validation Error
\`\`\`bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \\
  -H "Content-Type: application/json" \\
  -H "{{AUTH_HEADER_NAME}}: VALID_TOKEN" \\
  -d '{}'

# Expected: 400 Bad Request
\`\`\`

---

## Integration Notes

1. **Authentication**: {{AUTH_INTEGRATION_NOTE}}
2. **Entity Validation**: Entity must exist in database before operation
3. **Idempotency**: {{IDEMPOTENCY_BEHAVIOR}}
4. **Error Handling**: All errors return JSON with \`message\` and optional \`description\`
5. **Content Type**: Always use \`application/json\` for requests and responses

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial release |

---

## Support

For integration support or questions:
- Verify authentication credentials are correct
- Ensure required entities exist in database
- Check error messages for debugging hints
- Contact: [support contact info]

\`\`\`

---

## Variable Reference

Replace these placeholders when creating documentation:

### Service & Feature
- `{{SERVICE_NAME}}` - Service name (e.g., "products", "users", "orders")
- `{{FEATURE_NAME}}` - Feature name (e.g., "Config Update", "Analytics")
- `{{BRIEF_DESCRIPTION}}` - One-line description of endpoint purpose

### Endpoint Details
- `{{HTTP_METHOD}}` - GET, POST, PUT, PATCH, DELETE
- `{{ENDPOINT_PATH}}` - Full path (e.g., "/products", "/users/profile")

### Authentication
- `{{AUTH_HEADER_NAME}}` - x-access-token, x-api-key, etc.
- `{{AUTH_HEADER_VALUE}}` - Example value for curl (e.g., "YOUR_JWT_TOKEN")
- `{{AUTH_HEADER_LINE}}` - Full header line (e.g., "x-access-token: <JWT_TOKEN>")
- `{{AUTH_INTEGRATION_NOTE}}` - Specific auth setup instructions

### Request/Response
- `{{FIELD_NAME}}` - Name of a field
- `{{FIELD_TYPE}}` - string, integer, boolean, object, array
- `{{FIELD_DESCRIPTION}}` - What the field does
- `{{DEFAULT_VALUE}}` - Default value if field is optional
- `{{YES_OR_NO}}` - "Yes" or "No" for required fields

### Use Cases
- `{{USE_CASE_NAME}}` - Name of the use case
- `{{USE_CASE_DESCRIPTION}}` - Detailed description
- `{{EXAMPLE_VALUE}}` - Example value for the use case

### Storage (if applicable)
- `{{S3_BUCKET_ENV_VAR}}` - Environment variable name (e.g., "PRODUCTS_S3_BUCKET")
- `{{RESOURCE}}` - Resource type (e.g., "config", "exports")
- `{{FILE_NAME}}` - File name pattern (e.g., "config.json")
- `{{TABLE_NAME}}` - Database table name
- `{{PRIMARY_KEY_FIELD}}` - Primary key field name

### Business Logic
- `{{ADDITIONAL_BUSINESS_RULES}}` - Any special business logic
- `{{IDEMPOTENCY_BEHAVIOR}}` - Whether requests are idempotent
- `{{RATE_LIMIT}}` - Number of requests allowed
- `{{TIME_WINDOW}}` - Time window (e.g., "minute", "hour")
- `{{WEBHOOK_TOPIC_1}}` - First webhook topic

---

## Customization Guide

### 1. Authentication Section
**Keep only ONE of these:**
- JWT Authentication (for user-authenticated endpoints)
- API Key Authentication (for admin endpoints)
- HMAC Webhook Authentication (for webhook endpoints)
- Public (for no auth endpoints)

Delete the other three sections.

### 2. Optional Sections to Remove
If not applicable, remove these entire sections:
- **Field Specifications** - Only needed for complex enums/objects
- **Storage Details** - Only if using S3 or documenting database schema
- **Rate Limiting** - Only if implemented
- **Webhooks** - Only for webhook endpoints

### 3. Multiple Endpoints
If documenting related endpoints (e.g., PUT + PATCH), you can include both in one file:
- Create separate "## Endpoint" sections for each
- Share common sections (Authentication, Error Responses, etc.)
- See `cartx-config-update.md` for an example

### 4. Enum Values
If your types have enums, add a section like:
```markdown
## Enum Values

**RewardType:** `discount`, `free_gift`, `free_shipping`, `custom`
**RewardSpecifier:** `percentage`, `fixed_amount`, `product_sku`
```

---

## Real-World Example

A complete API documentation example should include:

- Multiple related endpoints documented together (if applicable)
- Clear authentication requirements
- Complete request/response schemas
- Storage details (if applicable)
- Enum values and field specifications
- Multiple use cases with examples

---

## Verification Checklist

After creating the documentation:

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Only ONE authentication section kept (others deleted)
- [ ] Request/response schemas match actual implemented types
- [ ] All possible HTTP error codes documented
- [ ] Working curl examples provided (test them!)
- [ ] Use cases explain real-world scenarios
- [ ] Optional sections removed if not applicable
- [ ] Storage details accurate (if included)
- [ ] Testing scenarios cover success and failure cases
- [ ] No placeholder text or comments left
- [ ] Markdown formatting is correct
- [ ] File saved to `docs/api-documentation/{{SERVICE_NAME}}-{{FEATURE_NAME}}.md`
- [ ] Added entry to `docs/api-documentation/README.md` index

---

## Notes

- This documentation is for **external integrators**, not internal developers
- Keep language clear and example-focused
- Include working curl examples that can be copy-pasted
- Document all possible error responses
- Reference real types from your implementation
- Test all curl examples before publishing
- Update the docs when the API changes
- Consider the audience: developers integrating with your API who may not know the internal implementation

---

## Task Completion

After creating the API documentation:

```bash
# Verify markdown formatting
cat docs/api-documentation/{{SERVICE_NAME}}-{{FEATURE_NAME}}.md

# Test curl examples manually
# (Copy-paste from the documentation and verify they work)

# Update the API documentation index
# Add an entry to docs/api-documentation/README.md
```

**Status Update:** Mark this task as completed and move on.
