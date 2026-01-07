# Gemini OAuth Configuration for Toad CLI

## Overview
Configure Google Gemini to authenticate via OAuth instead of API key for enhanced security and user-specific access.

## Prerequisites
- Google Cloud Project
- OAuth 2.0 credentials configured
- Gemini CLI v0.3.0+

## Configuration Steps

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth client ID**
4. Select **Desktop app** as application type
5. Download the JSON credentials file

### 2. Set Up Environment

Save the OAuth credentials:
```bash
mkdir -p ~/.config/gemini-cli
cp ~/Downloads/client_secret_*.json ~/.config/gemini-cli/oauth_credentials.json
```

### 3. Update Toad Configuration

Edit `toad/src/toad/data/agents/geminicli.com.toml`:

```toml
[identity]
id = "gemini"
name = "Gemini by Google"
url = "https://ai.google.dev"

[run]
command = """
gemini \
  --auth-mode oauth \
  --oauth-credentials ~/.config/gemini-cli/oauth_credentials.json \
  --no-left-pane
"""

[options]
requires_project = true
```

### 4. First-Time Authentication

On first run, Gemini CLI will:
1. Open browser for Google OAuth consent
2. Request permissions for Gemini API access
3. Save refresh token to `~/.config/gemini-cli/oauth_token.json`

```bash
# Test OAuth flow
gemini --auth-mode oauth --oauth-credentials ~/.config/gemini-cli/oauth_credentials.json
```

### 5. Update start.sh

Modify environment loading in `start.sh`:

```bash
# OAuth mode - no API key needed
unset GEMINI_API_KEY

# Ensure OAuth credentials exist
if [ ! -f ~/.config/gemini-cli/oauth_credentials.json ]; then
    echo "ERROR: OAuth credentials not found"
    echo "Please set up OAuth: cat docs/gemini-oauth.md"
    exit 1
fi
```

## Benefits of OAuth

✅ **Per-user authentication** - Each developer uses their own Google account  
✅ **No shared API keys** - Eliminates key rotation hassles  
✅ **Automatic token refresh** - OAuth handles expiration  
✅ **Fine-grained permissions** - Control API access per user  
✅ **Audit trail** - Google Cloud logs show individual usage

## Troubleshooting

### Token Expired
```bash
# Force re-authentication
rm ~/.config/gemini-cli/oauth_token.json
gemini --auth-mode oauth
```

### Permission Denied
- Verify OAuth client is enabled for Gemini API
- Check that redirect URI matches: `http://localhost:8080`

### Browser Not Opening
```bash
# Manual OAuth URL
gemini --auth-mode oauth --no-browser
# Copy URL to browser manually
```

## Reverting to API Key

If needed, revert to API key mode:

```toml
# geminicli.com.toml
[run]
command = "gemini --no-left-pane"

# .env
GEMINI_API_KEY=your-key-here
```

## Security Notes

- OAuth tokens stored in `~/.config/gemini-cli/oauth_token.json`
- Tokens encrypted at rest
- Refresh tokens valid for 6 months
- Revoke access: [Google Account Permissions](https://myaccount.google.com/permissions)
