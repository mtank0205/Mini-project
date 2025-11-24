# GitHub Token Setup (Optional but Recommended)

## Why You Need a GitHub Token

GitHub API has rate limits:
- **Without token**: 60 requests per hour
- **With token**: 5,000 requests per hour

For repository analysis, the app works **without a token** but has limitations on large repos or frequent analysis.

## How to Get a GitHub Token

### Step 1: Go to GitHub Settings
1. Go to https://github.com/settings/tokens
2. Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

### Step 2: Generate New Token
1. Click "Generate new token" → "Generate new token (classic)"
2. Give it a name like "HackSim Repository Analysis"
3. Set expiration (recommended: 90 days or No expiration for development)

### Step 3: Select Permissions
Select only these scopes (minimum required):
- ✅ `public_repo` (Access public repositories)
- ✅ `read:user` (Read user profile data)

**DO NOT** select private repo access unless needed!

### Step 4: Generate and Copy Token
1. Click "Generate token" at the bottom
2. **COPY THE TOKEN IMMEDIATELY** (you can't see it again!)
3. It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Add to .env File
1. Open `backend/.env`
2. Find the line: `GITHUB_TOKEN=`
3. Paste your token: `GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Save the file
5. Restart the backend server

## Example .env

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=hackathon_secret_key_2024_secure
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD

# AI Configuration
AI_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## Testing

After adding the token:
1. Restart backend: `Ctrl+C` then `node server.js`
2. Go to frontend: http://localhost:8080/repo
3. Try analyzing a large repository (e.g., facebook/react)
4. Should work without 403 errors!

## Security Notes

⚠️ **NEVER commit `.env` file to Git!**
- Already added to `.gitignore`
- Token should remain private
- Revoke token if accidentally exposed

## Troubleshooting

### Still Getting 403 Errors?
- Check token has `public_repo` permission
- Make sure `.env` has no extra spaces
- Restart backend after adding token
- Check GitHub token hasn't expired

### Token Not Working?
- Verify token is correct (no extra spaces)
- Check token permissions on GitHub
- Try generating a new token

## Without Token

The app **still works without a token**:
- Uses graceful fallback for rate limits
- Returns default scores (7/10) when API fails
- Shows basic repository info
- AI evaluation works with limited data

**Recommended to add token for:**
- Frequent repository analysis
- Large repositories with many files
- Team/production use
- Better AI evaluation accuracy
