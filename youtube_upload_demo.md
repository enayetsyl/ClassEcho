# YouTube Upload Demo in Next.js

This guide explains how to build a fully front-end YouTube video upload feature in a Next.js App Router application using the new Google Identity Services (GIS) for authentication and a manual multipart upload via `fetch`. No custom backend is required.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Environment Variables](#environment-variables)
4. [Page File Structure](#page-file-structure)
5. [Full Code: ](#full-code-srcappupload-videopagejs)[`src/app/upload-video/page.js`](#full-code-srcappupload-videopagejs)
6. [Explanation of Key Sections](#explanation-of-key-sections)
7. [Usage](#usage)

---

## Prerequisites

- A Next.js project using the App Router (`src/app` folder).
- A Google Cloud Console project with **YouTube Data API v3** enabled.
- An OAuth 2.0 **Client ID** (Web application) with:
  - Authorized JavaScript origin: `http://localhost:3000`
  - OAuth consent screen configured (in Production or Testing with your account as a test user)

---

## Project Setup

1. Install dependencies:
   ```bash
   npm install next react react-dom
   ```
2. Install types for Google APIs (optional):
   ```bash
   npm install @types/gapi @types/gapi.client
   ```
3. Create the folder for your route:
   ```text
   src/app/upload-video/page.js
   ```

---

## Environment Variables

Create a file named `.env.local` at your project root:

```dotenv
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_API_KEY
```

> **Note:** Prefix with `NEXT_PUBLIC_` so Next.js exposes them to the browser.

---

## Page File Structure

```text
src/app/
└── upload-video/
    └── page.js
```

In `page.js`, we:

1. Load the GIS and GAPI scripts.
2. Initialize `gapi.client` for discovery.
3. Initialize a GIS token client for OAuth.
4. Trigger the OAuth popup.
5. Perform a manual multipart upload with metadata and binary.
6. Handle loading and success/failure states.

---

## Full Code: `src/app/upload-video/page.js`

```js
'use client';
import { useState } from 'react';
import Script from 'next/script';

export default function UploadVideoPage() {
  const [isSignedIn, setIsSignedIn]   = useState(false);
  const [file, setFile]               = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  let   tokenClient                   = null;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const apiKey   = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // 1️⃣ Initialize gapi.client (discovery only)
  const initGapiClient = () => {
    gapi.client
      .init({
        apiKey,
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
        ]
      })
      .then(() => {
        // 2️⃣ Setup GIS token client
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/youtube.upload',
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('Token error', tokenResponse);
              return;
            }
            // Store the token on gapi.client
            gapi.client.setToken({ access_token: tokenResponse.access_token });
            setIsSignedIn(true);
          }
        });
      })
      .catch(err => console.error('gapi.client.init failed:', err));
  };

  // 3️⃣ Trigger OAuth popup
  const handleAuthClick = () => {
    if (!tokenClient) return console.error('Token client not ready');
    tokenClient.requestAccessToken({ prompt: '' });
  };

  // 4️⃣ Revoke & sign out
  const handleSignout = () => {
    const token = gapi.client.getToken()?.access_token;
    if (token) {
      google.accounts.oauth2.revoke(token, () => {
        gapi.client.setToken(null);
        setIsSignedIn(false);
        setFile(null);
      });
    }
  };

  // 5️⃣ Manual multipart upload via fetch + FormData
  const uploadVideo = async () => {
    if (!file) return;
    setIsUploading(true);

    // build metadata
    const metadata = {
      snippet: {
        title: file.name,
        description: 'Uploaded via Next.js + GIS demo'
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false
      }
    };

    // assemble multipart form
    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    const accessToken = gapi.client.getToken().access_token;
    try {
      const res  = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: form
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error('Upload error', data);
        alert('Upload failed: ' + data.error.message);
      } else {
        const url = `https://youtu.be/${data.id}`;
        alert(`Upload successful!\n${url}`);
      }
    } catch (err) {
      console.error('Fetch upload error', err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Load GIS & gapi */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={() => gapi.load('client', initGapiClient)}
      />

      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">
          YouTube Upload Demo (Multipart)
        </h1>

        {!isSignedIn ? (
          <button
            onClick={handleAuthClick}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Authorize
          </button>
        ) : (
          <button
            onClick={handleSignout}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Sign out
          </button>
        )}

        {isSignedIn && (
          <div className="mt-4 space-y-2">
            <input
              type="file"
              accept="video/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={uploadVideo}
              disabled={!file || isUploading}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Upload Video'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

---

## Explanation of Key Sections

1. **Loading Scripts**: We load GIS first, then the Google API script, both `afterInteractive` so they run on the client.
2. ``: Initializes discovery (`gapi.client.init`) then sets up the GIS token client via `google.accounts.oauth2.initTokenClient`.
3. **OAuth Flow**: `handleAuthClick` triggers a popup; the callback stores the access token with `gapi.client.setToken` and flips `isSignedIn`.
4. **Multipart Upload**: We build a two-part `FormData` (JSON metadata + binary file) and POST to the upload endpoint with `uploadType=multipart`.
5. **Loading State**: `isUploading` disables the button and shows “Uploading…” until the request finishes.

---

## Usage

1. Run your app:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3000/upload-video`
3. Click **Authorize**, pick your Google account, then select a video and click **Upload Video**.
4. You should see an alert with the new YouTube link upon success.

You're all set for a fully front-end, no-backend YouTube upload demo in Next.js! Feel free to customize the metadata, styling, or integrate this flow into your larger app.

