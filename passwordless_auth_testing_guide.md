# Champions Arena - Passwordless Authentication Testing Guide

This guide will walk you through testing the passwordless OTP-based authentication system using Postman.

## Setting Up Postman

1. Create a new collection named "Champions Arena API"
2. Set up environment variables:
   - `BASE_URL`: Set to your API base URL (e.g., `http://localhost:8000/api/v1`)
   - `PLAYER_TOKEN`: Will store player's access token
   - `ORGANIZER_TOKEN`: Will store organizer's access token

## Authentication Flow

The passwordless authentication flow consists of these steps:
1. Initiate OTP Auth (registration or login)
2. Receive OTP (in development, check server logs)
3. Verify OTP to complete authentication
4. Use the received token for authenticated requests

## Testing Endpoints

### 1. Initiate Player Authentication

**Endpoint**: `POST {{BASE_URL}}/auth/player/initiate-otp-auth`

**Headers**:
```
Content-Type: application/json
```

**Request Body for New Player (Registration)**:
```json
{
  "email": "testplayer@example.com",
  "name": "Test Player",
  "username": "testplayer123",
  "uid": "123456789",
  "mobileNumber": "9876543210"
}
```

**Request Body for Existing Player (Login)**:
```json
{
  "email": "testplayer@example.com"
}
```

### 2. Initiate Organizer Authentication

**Endpoint**: `POST {{BASE_URL}}/auth/organizer/initiate-otp-auth`

**Headers**:
```
Content-Type: application/json
```

**Request Body for New Organizer (Registration)**:
```json
{
  "email": "testorganizer@example.com",
  "name": "Test Organizer",
  "phoneNumber": "9876543210",
  "companyName": "Test Gaming Events",
  "upiId": "testgaming@upi"
}
```

**Request Body for Existing Organizer (Login)**:
```json
{
  "email": "testorganizer@example.com"
}
```

### 3. Verify OTP and Complete Authentication

**Endpoint**: `POST {{BASE_URL}}/auth/verify-otp`

**Headers**:
```
Content-Type: application/json
```

**Request Body for Player**:
```json
{
  "email": "testplayer@example.com",
  "otp": "123456",
  "userType": "player"
}
```

**Request Body for Organizer**:
```json
{
  "email": "testorganizer@example.com",
  "otp": "123456",
  "userType": "organizer"
}
```

After successful OTP verification, you'll receive auth tokens. Save the `accessToken` to your Postman environment variable (`PLAYER_TOKEN` or `ORGANIZER_TOKEN`).

### 4. Resend OTP

**Endpoint**: `POST {{BASE_URL}}/auth/resend-otp`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "testplayer@example.com",
  "userType": "player"
}
```

### 5. Check Player Authentication

**Endpoint**: `GET {{BASE_URL}}/auth/player/check-auth`

**Headers**:
```
Authorization: Bearer {{PLAYER_TOKEN}}
```

### 6. Check Organizer Authentication

**Endpoint**: `GET {{BASE_URL}}/auth/organizer/check-auth`

**Headers**:
```
Authorization: Bearer {{ORGANIZER_TOKEN}}
```

### 7. Logout

**Endpoint**: `POST {{BASE_URL}}/auth/logout`

**Headers**:
```
Authorization: Bearer {{PLAYER_TOKEN}}
```
or
```
Authorization: Bearer {{ORGANIZER_TOKEN}}
```

## Complete Testing Flow

1. **Player Authentication Flow**:
   - Initiate OTP auth for a player (provide full details for new users)
   - Get the OTP from server logs or email
   - Verify the OTP to complete authentication
   - Store the returned access token
   - Test accessing protected endpoints
   - Logout

2. **Organizer Authentication Flow**:
   - Initiate OTP auth for an organizer (provide full details for new users)
   - Get the OTP from server logs or email
   - Verify the OTP to complete authentication
   - For a new organizer, admin approval will be needed (manual database update for testing)
   - Store the returned access token
   - Test accessing protected endpoints
   - Logout

## Important Notes

1. **OTP Testing**: In development, check server logs to see the OTP. Modify the email service to log OTPs instead of actually sending emails:

   In `server/src/utils/email.js`, add this to your OTP email function:
   ```javascript
   console.log(`OTP for ${email}: ${otp}`);
   ```

2. **Organizer Approval**: New organizer accounts require admin approval. For testing, update the database directly:
   ```
   db.organizers.updateOne(
     { email: "testorganizer@example.com" },
     { $set: { isApproved: true } }
   )
   ```

3. **Environment Variables**: Keep your environment variables organized so you can easily switch between testing player and organizer authentication.

4. **Error Handling**: Test error cases by:
   - Trying invalid OTPs
   - Using non-existent emails
   - Providing incomplete data for new users
   - Using expired tokens

By following this guide, you should be able to thoroughly test the passwordless authentication system for Champions Arena. 