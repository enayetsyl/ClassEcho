// src/types/google-client.d.ts

// minimal subset of gapi.client that we invoke
declare namespace gapi {
  namespace client {
    function init(opts: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;
    function setToken(token: { access_token: string }): void;
    function getToken(): { access_token: string } | null;
  }
}

// shape of the token-popup client
export interface TokenClient {
  requestAccessToken(params?: { prompt?: '' | 'none' }): void;
}

// google.identity services that we actually call
declare namespace google.accounts.oauth2 {
  function initTokenClient(init: {
    client_id: string;
    scope: string;
    callback: (resp: { access_token: string; error?: string }) => void;
  }): TokenClient;

  function revoke(token: string, callback: () => void): void;
}

// make them available on window
declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}
