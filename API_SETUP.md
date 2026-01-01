# API Configuration Guide

## Setting Up API Base URL

The app needs to know where your backend API is running. Here are the ways to configure it:

### Option 1: Using app.json (Recommended for Development)

Edit `app.json` and update the `extra.apiBaseUrl` field:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:3000/api"
    }
  }
}
```

### Option 2: Using Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Then restart your Expo development server.

### Option 3: For Physical Devices

When testing on a physical device (not emulator/simulator), you need to use your computer's IP address instead of `localhost`.

1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in CMD and look for "IPv4 Address"
   - **Mac/Linux**: Run `ifconfig` and look for your network interface IP

2. Update the API URL:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:3000/api
   ```
   Example: `http://192.168.1.100:3000/api`

3. Make sure your backend server allows connections from your network (not just localhost)

### Troubleshooting

1. **Check if API is running**: Make sure your backend server is running on the specified port
2. **Check console logs**: The app logs the API base URL on startup in development mode
3. **Network errors**: If you see "Network error", check:
   - Backend server is running
   - Correct IP address/URL
   - Firewall isn't blocking the connection
   - Device and computer are on the same network (for physical devices)

### Default Configuration

If no configuration is provided, the app defaults to:
```
http://localhost:3000/api
```

This works for:
- iOS Simulator
- Android Emulator
- Web browser

But NOT for physical devices.

