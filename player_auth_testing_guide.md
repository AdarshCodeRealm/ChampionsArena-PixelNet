# Player Authentication Testing Guide

This guide provides details about the new player authentication routes and sample request data for testing.

## Base URL

```
http://localhost:5000/api/v1/player-auth
```

## Authentication Routes

### 1. Register a Player

**Endpoint:** `POST /register`

**Description:** Register a new player with email, password, and player details.

**Request Body:**
```json
{
  "name": "Test Player",
  "email": "testplayer@example.com",
  "username": "testgamer123",
  "password": "Password123!",
  "uid": "123456789",
  "mobileNumber": "9876543210",
  "isOtpVerified": true
}
```

**Note:** For actual implementation, you should include profile picture as a file upload using form-data. The `isOtpVerified` flag is used for testing - in production this would be verified through the OTP flow.

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "player_id",
    "name": "Test Player",
    "email": "testplayer@example.com",
    "username": "testgamer123",
    "uid": "123456789",
    "mobileNumber": "9876543210",
    "profilePicture": null,
    "isVerified": true,
    "rank": "Rookie",
    "level": 1,
    "stats": {
      "totalMatches": 0,
      "matchesWon": 0,
      "tournamentsParticipated": 0,
      "tournamentsWon": 0,
      "killCount": 0
    },
    "createdAt": "2025-05-10T10:00:00.000Z",
    "updatedAt": "2025-05-10T10:00:00.000Z"
  },
  "message": "Player registered successfully"
}
```

### 2. Login a Player

**Endpoint:** `POST /login`

**Description:** Authenticate a player with email and password.

**Request Body:**
```json
{
  "email": "testplayer@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "player": {
      "_id": "player_id",
      "name": "Test Player",
      "email": "testplayer@example.com",
      "username": "testgamer123",
      "uid": "123456789",
      "profilePicture": null,
      "rank": "Rookie",
      "level": 1,
      "stats": {
        "totalMatches": 0,
        "matchesWon": 0,
        "tournamentsParticipated": 0,
        "tournamentsWon": 0,
        "killCount": 0
      },
      "isVerified": true,
      "userType": "player"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Player logged in successfully"
}
```

### 3. Verify Email with OTP

**Endpoint:** `POST /verify-email`

**Description:** Verify player's email with OTP sent during registration.

**Request Body:**
```json
{
  "email": "testplayer@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Email verified successfully"
}
```

### 4. Resend OTP

**Endpoint:** `POST /resend-otp`

**Description:** Resend verification OTP to player's email.

**Request Body:**
```json
{
  "email": "testplayer@example.com"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Verification code sent successfully"
}
```

### 5. Forgot Password

**Endpoint:** `POST /forgot-password`

**Description:** Send password reset link to player's email.

**Request Body:**
```json
{
  "email": "testplayer@example.com"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset link sent to your email"
}
```

### 6. Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Reset player's password using reset token received in email.

**Request Body:**
```json
{
  "token": "7a9d6c8b1e3f5a2d4c6b8a0e2d4f6a8c",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset successful"
}
```

### 7. Logout Player

**Endpoint:** `POST /logout`

**Description:** Log out player and invalidate tokens.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Player logged out successfully"
}
```

### 8. Refresh Access Token

**Endpoint:** `POST /refresh-token`

**Description:** Generate new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Access token refreshed successfully"
}
```

### 9. Change Password

**Endpoint:** `POST /change-password`

**Description:** Change player's password (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password updated successfully"
}
```

### 10. Get Current Player Profile

**Endpoint:** `GET /profile`

**Description:** Get current authenticated player's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "player_id",
    "name": "Test Player",
    "email": "testplayer@example.com",
    "username": "testgamer123",
    "uid": "123456789",
    "mobileNumber": "9876543210",
    "profilePicture": null,
    "isVerified": true,
    "rank": "Rookie",
    "level": 1,
    "stats": {
      "totalMatches": 0,
      "matchesWon": 0,
      "tournamentsParticipated": 0,
      "tournamentsWon": 0,
      "killCount": 0
    },
    "createdAt": "2025-05-10T10:00:00.000Z",
    "updatedAt": "2025-05-10T10:00:00.000Z"
  },
  "message": "Player profile fetched successfully"
}
```

### 11. Update Player Profile

**Endpoint:** `PATCH /profile`

**Description:** Update player's profile information.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Updated Player Name",
  "username": "upgradedgamer",
  "mobileNumber": "9876543210"
}
```

**Note:** For profile picture updates, use form-data to upload the image file.

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "player_id",
    "name": "Updated Player Name",
    "email": "testplayer@example.com",
    "username": "upgradedgamer",
    "uid": "123456789",
    "mobileNumber": "9876543210",
    "profilePicture": null,
    "isVerified": true,
    "rank": "Rookie",
    "level": 1,
    "stats": {
      "totalMatches": 0,
      "matchesWon": 0,
      "tournamentsParticipated": 0,
      "tournamentsWon": 0,
      "killCount": 0
    },
    "createdAt": "2025-05-10T10:00:00.000Z",
    "updatedAt": "2025-05-10T10:15:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

## Testing with Postman

### Setting up Environment Variables

1. Create a new environment in Postman
2. Set the following variables:
   - `BASE_URL`: http://localhost:5000/api/v1
   - `PLAYER_AUTH`: {{BASE_URL}}/player-auth
   - `ACCESS_TOKEN`: (leave empty initially)
   - `REFRESH_TOKEN`: (leave empty initially)

### Testing Authentication Flow

1. Register a new player
2. Login with the player's credentials
3. Store the access token and refresh token from the login response in environment variables
4. Use these tokens to test protected routes

### Collection Setup

Create a new request collection with folders:
- Player Authentication
  - Register Player
  - Login Player
  - Verify Email
  - Resend OTP
  - Forgot Password
  - Reset Password
  - Logout Player
  - Refresh Token
  - Change Password
  - Get Profile
  - Update Profile

For protected routes, use this in the Authorization tab:
- Type: Bearer Token
- Token: {{ACCESS_TOKEN}}

## Sample Test Users

### Test Player 1
```json
{
  "name": "Alex Smith",
  "email": "alexsmith@example.com",
  "username": "alexgamer99",
  "password": "SecurePass123!",
  "uid": "987654321",
  "mobileNumber": "8765432109"
}
```

### Test Player 2
```json
{
  "name": "Jordan Lee",
  "email": "jordanlee@example.com",
  "username": "prosniper42",
  "password": "StrongPwd456!",
  "uid": "123789456",
  "mobileNumber": "7654321098"
}
```

### Test Player 3
```json
{
  "name": "Taylor Quinn",
  "email": "taylorq@example.com",
  "username": "gamemaster77",
  "password": "GameTime789!",
  "uid": "456123789",
  "mobileNumber": "9876123450"
}
```

## Error Scenarios to Test

1. **Registration with Existing Email**
   - Expected: 409 Conflict with message "Email is already registered"

2. **Registration with Existing Username**
   - Expected: 409 Conflict with message "Username is already taken"

3. **Login with Incorrect Password**
   - Expected: 401 Unauthorized with message "Invalid password"

4. **Login with Non-existent Email**
   - Expected: 404 Not Found with message "Player not found with this email"

5. **Accessing Protected Route without Token**
   - Expected: 401 Unauthorized with message "Unauthorized request"

6. **Using Expired/Invalid Token**
   - Expected: 401 Unauthorized with message "Invalid or expired token"

7. **Verification with Invalid OTP**
   - Expected: 400 Bad Request with message "Invalid OTP"

8. **Password Reset with Invalid/Expired Token**
   - Expected: 400 Bad Request with message "Token is invalid or expired"