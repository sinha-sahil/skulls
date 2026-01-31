# Step 6: Middleware (`middleware.rs`) - Optional

**Dependencies:** None

**Can be implemented in parallel with:** Steps 1-4, 7, 8

## 6.1 Standard Authentication Middleware

Most services can reuse this pattern for client authentication.

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{services::auth, {{STATE_TYPE}}};
use axum::{
    extract::{Request, State},
    http::HeaderMap,
    middleware,
    response::Response,
    Extension, Json,
};

pub async fn auth_middleware(
    Extension(state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    mut request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let auth_result = {{AUTH_VERIFY_FN}}(headers, State(state)).await;
    match auth_result {
        Ok(Json(result)) => {
            request.extensions_mut().insert(result.clone());
            let response = next.run(request).await;
            Ok(response)
        }
        Err(e) => Err(e),
    }
}
```

## 6.2 Custom Role-Based Middleware

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{services::auth, {{STATE_TYPE}}};
use axum::{
    extract::{Request, State},
    http::HeaderMap,
    middleware,
    response::Response,
    Extension, Json,
};

pub async fn admin_auth_middleware(
    Extension(state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    mut request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let auth_result = {{AUTH_VERIFY_FN}}(headers, State(state)).await;
    match auth_result {
        Ok(Json(result)) => {
            // Check for admin role
            if !result.is_admin.unwrap_or(false) {
                return Err({{ERROR_TYPE}}::Unauthorized);
            }

            request.extensions_mut().insert(result.clone());
            let response = next.run(request).await;
            Ok(response)
        }
        Err(e) => Err(e),
    }
}
```

## 6.3 API Key Middleware (for Webhooks)

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{
    extract::Request,
    http::HeaderMap,
    middleware,
    response::Response,
    Extension,
};

pub async fn api_key_middleware(
    Extension(state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let api_key = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .ok_or({{ERROR_TYPE}}::Unauthorized)?;

    if api_key != state.secrets.webhook_api_key {
        return Err({{ERROR_TYPE}}::Unauthorized);
    }

    let response = next.run(request).await;
    Ok(response)
}
```

## 6.4 JWT Token Middleware

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{
    extract::Request,
    http::HeaderMap,
    middleware,
    response::Response,
    Extension,
};

pub async fn jwt_middleware(
    Extension(state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    mut request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let token = headers
        .get("{{AUTH_HEADER_NAME}}")
        .and_then(|v| v.to_str().ok())
        .ok_or({{ERROR_TYPE}}::Unauthorized)?;

    let claims = {{JWT_VERIFY_FN}}::<{{AUTH_CLAIMS_TYPE}}>(
        token,
        &state.secrets.{{JWT_SECRET_FIELD}},
        None,
    )
    .map_err(|_| {{ERROR_TYPE}}::Unauthorized)?;

    request.extensions_mut().insert(claims);
    let response = next.run(request).await;
    Ok(response)
}
```

## 6.5 Rate Limiting Middleware (Basic)

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{
    extract::Request,
    middleware,
    response::Response,
    Extension,
};

pub async fn rate_limit_middleware(
    Extension(_state): Extension<{{STATE_TYPE}}>,
    request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    // For production, use Redis-based rate limiting
    // This is a placeholder for the pattern

    let response = next.run(request).await;
    Ok(response)
}
```

## Checklist

- [ ] Import necessary extractors and types
- [ ] Use `{{AUTH_VERIFY_FN}}` for standard authentication
- [ ] Insert verified data into request extensions
- [ ] Return appropriate errors for failed auth
- [ ] Consider using Redis for production rate limiting
- [ ] Use `tracing` for logging instead of `println!`
