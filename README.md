# @tome888/auth-express

A flexible, lightweight, and type-safe JWT authentication middleware for Express.js. Designed for developers who need both quick prototyping and strict runtime validation.

## Features

- 🔐 **JWT Generation**: Simple utility to sign tokens.
- 🍪 **Hybrid Auth**: Automatically checks `Authorization: Bearer` headers AND **HttpOnly Cookies**.
- 🛠️ **Dynamic Keys**: Attach decoded data to `req.user`, `req.company`, or any custom key.
- 🛡️ **Strict Validation**: Support for Type Guards/Validators to ensure payload integrity.
- 🟦 **TypeScript First**: Full IntelliSense and Generic support.
- 📦 **Zero Config**: Sensible defaults for security (HttpOnly, SameSite, etc.).

## Installation

```bash
npm install @tome888/auth-express jsonwebtoken
npm install @types/jsonwebtoken cookie-parser -D
```
> Note: `cookie-parser` is required if you plan to use cookie-based authentication.

### 1. Generate a Token

Issue a new JWT during login or registration.

```ts
import { generateJwt } from '@tome888/auth-express';

const token = generateJwt({
  payload: { id: "123", role: "admin" },
  secret: "YOUR_JWT_SECRET",
  expiresIn: "24h"
});
```

### 2. Set Auth Cookie (Secure)
Sets a secure, HttpOnly cookie to protect against XSS attacks.
```ts
import { setAuthCookie } from '@tome888/auth-express';

app.post("/login", (req, res) => {
  const token = generateJwt({ payload: { id: "123" }, secret: "SECRET" });
  
  // Sets 'token-tauth' cookie with 1-day expiry by default
  setAuthCookie(res, token); 

  res.json({ success: true });
});
```

### 3. Loose Mode (Quick Setup)
Best for simple apps. Use any custom key (default is user).
```ts
import { verifyJwtMW, TAuthRequest } from '@tome888/auth-express';

app.get("/profile", 
  verifyJwtMW("SECRET", "user"), 
  (req: TAuthRequest<any, "user">, res) => {
    // Data is attached to req.user
    res.json(req.user);
  }
);
```
### 4. Strict Mode (Production Standard)
Requires a Validator Function to verify the payload structure. This provides the highest level of type safety and security.

```ts
import { verifyJwtStrictMW, TAuthRequest } from '@tome888/auth-express';

interface CompanyData {
  id: string;
  plan: 'pro' | 'free';
}

// Type Guard Validator
const isCompany = (data: any): data is CompanyData => {
  return data && typeof data.id === "string" && !!data.plan;
};

app.get("/settings",
  verifyJwtStrictMW("SECRET", isCompany, "company"),
  (req: TAuthRequest<CompanyData, "company">, res) => {
    // TypeScript knows req.company exists and matches CompanyData
    res.json({ plan: req.company?.plan });
  }
);
```
### 5. Logout Support
Clearing the `HttpOnly` cookie must be done from the server. Use `clearAuthCookie` to securely remove the token from the client's browser.

```typescript
import { clearAuthCookie } from '@tome888/tauth-express';

app.post("/logout", (req, res) => {
  clearAuthCookie(res); 
  // Optionally pass a custom name if you aren't using the default
  // clearAuthCookie(res, "custom-cookie-name");
  
  res.json({ success: true, message: "Logged out" });
});
```

### API Reference
``generateJwt({ payload, secret, expiresIn })``
Returns a signed JWT string.

``setAuthCookie(res, token, cookieName?, options?, env?)``
* cookieName: Default is token-tauth.
* options: Standard Express CookieOptions.
* env: Defaults to development. If set to production, the cookie will be secure: true.

``verifyJwtMW(secret, attachKey?, cookieName?)``
Checks for token in:
1. ```ts Authorization: Bearer <token>```
2. ```req.cookies['token-tauth']```

``verifyJwtStrictMW(secret, validator, attachKey?, cookieName?) ``
Same as loose mode, but executes the validator function. If the validator returns false, it sends a 422 Unprocessable Entity response.

### Types
``TAuthRequest<T, K>``
Extends the Express Request type.
* T: The shape of your data (default any).
* K: The key name on the request object (default "user").
