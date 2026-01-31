# Step 7: Remote API (`remote.rs`) - Optional

**Dependencies:** Step 1 (types.rs for request/response types)

**Can be implemented in parallel with:** Steps 2-5, 6, 8

## 7.1 Basic External API Call

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use super::types::{ExternalApiReq, ExternalApiResp, ApiSecrets};

pub async fn call_external_api(
    payload: &ExternalApiReq,
    api_secrets: &ApiSecrets,
) -> Result<ExternalApiResp, {{ERROR_TYPE}}> {
    let endpoint = "https://api.example.com/v1/endpoint";

    let client = reqwest::Client::new();
    let response = client
        .post(endpoint)
        .header("Authorization", format!("Bearer {}", api_secrets.api_key))
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(resp) => {
            match resp.json::<ExternalApiResp>().await {
                Ok(parsed) => Ok(parsed),
                Err(e) => {
                    tracing::error!("Error parsing response: {:?}", e);
                    Err({{ERROR_TYPE}}::Unavailable)
                }
            }
        }
        Err(e) => {
            tracing::error!("Error calling API: {:?}", e);
            Err({{ERROR_TYPE}}::Unavailable)
        }
    }
}
```

## 7.2 GET Request with Query Parameters

```rust
pub async fn fetch_external_data(
    id: &str,
    api_secrets: &ApiSecrets,
) -> Result<ExternalDataResp, {{ERROR_TYPE}}> {
    let endpoint = format!("https://api.example.com/v1/resource/{}", id);

    let client = reqwest::Client::new();
    let response = client
        .get(&endpoint)
        .header("x-api-key", &api_secrets.api_key)
        .header("x-api-version", "2025-01-01")
        .send()
        .await;

    match response {
        Ok(resp) => {
            match resp.json::<ExternalDataResp>().await {
                Ok(data) => Ok(data),
                Err(e) => {
                    tracing::error!("Error parsing external data: {:?}", e);
                    Err({{ERROR_TYPE}}::Unavailable)
                }
            }
        }
        Err(e) => {
            tracing::error!("Error fetching external data: {:?}", e);
            Err({{ERROR_TYPE}}::Unavailable)
        }
    }
}
```

## 7.3 Gateway Pattern (Multiple Providers)

```rust
use super::types::{Gateway, GatewaySecrets, GatewayTxnParams, TransactionData};

pub async fn create_gateway_transaction(
    transaction: &TransactionData,
    gateway_secrets: &GatewaySecrets,
) -> Result<GatewayTxnParams, {{ERROR_TYPE}}> {
    let gateway = Gateway::Provider1;  // Could be determined dynamically

    match gateway {
        Gateway::Provider1 => {
            create_provider1_transaction(transaction, gateway_secrets).await
        }
        Gateway::Provider2 => {
            create_provider2_transaction(transaction, gateway_secrets).await
        }
    }
}

async fn create_provider1_transaction(
    transaction: &TransactionData,
    secrets: &GatewaySecrets,
) -> Result<GatewayTxnParams, {{ERROR_TYPE}}> {
    let endpoint = "https://api.provider1.com/v1/orders";
    let webhook_url = format!(
        "{}/{{SERVICE_NAME}}/webhook/provider1",
        secrets.app_endpoint
    );

    let request_body = Provider1Request {
        amount: transaction.amount as f32 / 100.0,
        order_id: transaction.id.clone(),
        notify_url: Some(webhook_url),
        // ... other fields
    };

    let client = reqwest::Client::new();
    let response = client
        .post(endpoint)
        .header("x-client-id", &secrets.provider1_client_id)
        .header("x-client-secret", &secrets.provider1_client_secret)
        .json(&request_body)
        .send()
        .await;

    match response {
        Ok(resp) => {
            match resp.json::<Provider1Response>().await {
                Ok(resp) => Ok(GatewayTxnParams::Provider1Params(resp)),
                Err(_) => Err({{ERROR_TYPE}}::Unavailable),
            }
        }
        Err(_) => Err({{ERROR_TYPE}}::Unavailable),
    }
}
```

## 7.4 With Retry Logic

```rust
use std::time::Duration;
use tokio::time::sleep;

pub async fn call_api_with_retry(
    payload: &ApiRequest,
    secrets: &ApiSecrets,
    max_retries: u32,
) -> Result<ApiResponse, {{ERROR_TYPE}}> {
    let mut attempts = 0;

    loop {
        attempts += 1;

        match call_external_api(payload, secrets).await {
            Ok(response) => return Ok(response),
            Err(e) => {
                if attempts >= max_retries {
                    tracing::error!("Max retries ({}) exceeded", max_retries);
                    return Err(e);
                }

                let delay = Duration::from_millis(100 * 2_u64.pow(attempts));
                tracing::warn!("Retry {} after {:?}", attempts, delay);
                sleep(delay).await;
            }
        }
    }
}
```

## 7.5 Environment-Specific Endpoints

```rust
pub async fn call_api(
    payload: &ApiRequest,
    secrets: &ApiSecrets,
) -> Result<ApiResponse, {{ERROR_TYPE}}> {
    let endpoint = if cfg!(debug_assertions) {
        "https://sandbox.api.example.com/v1/endpoint"
    } else {
        "https://api.example.com/v1/endpoint"
    };

    // ... rest of implementation
}
```

## Checklist

- [ ] Define request/response types in `types.rs`
- [ ] Use `reqwest::Client` for HTTP calls
- [ ] Handle both network and parsing errors
- [ ] Return `{{ERROR_TYPE}}::Unavailable` for API failures
- [ ] Consider environment-specific endpoints (sandbox vs production)
- [ ] Use `tracing` for logging instead of `println!`
- [ ] Consider retry logic for transient failures
