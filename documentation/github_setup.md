# GitHub Actions Setup Guide

Follow these steps to enable automatic deployment for **Sid's Chatbot**.

## 1. Initialize Git Repository
Run these commands in your "c:/UltimateRAG/chat_bot" terminal:

```powershell
git init
git add .
git commit -m "Initial commit: Chatbot with FastAPI and Azure Deployment"
```

## 2. Create GitHub Repository
1.  Go to [GitHub.com](https://github.com/new).
2.  Create a new repository named `sids-chatbot` (or similar).
3.  **Do not** initialize with README or gitignore (we already have them).
4.  Copy the URL (e.g., `https://github.com/StartuptoEnterprise/sids-chatbot.git`).

## 3. Push Code
Back in your terminal:
```powershell
git branch -M main
git remote add origin <PASTE_YOUR_GITHUB_URL_HERE>
git push -u origin main
```

## 4. Configure Azure Credentials (Secret)

GitHub needs permission to talk to your Azure account.

1.  **Generate Credentials**: Run this command in your terminal. It will output a JSON object.
    ```powershell
    # Replace with your actual Subscription ID if needed (az account show --query id -o tsv)
    $SUBSCRIPTION_ID = $(az account show --query id -o tsv)
    
    az ad sp create-for-rbac --name "sids-chatbot-github-action" --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID --sdk-auth
    ```

2.  **Copy the JSON Output**: Copy the entire JSON output (starting with `{` and ending with `}`).

3.  **Add to GitHub**:
    *   Go to your Repository on GitHub.
    *   Click **Settings** > **Secrets and variables** > **Actions**.
    *   Click **New repository secret**.
    *   **Name**: `AZURE_CREDENTIALS`
    *   **Secret**: Paste the JSON you copied.
    *   Click **Add secret**.

## 5. Verify
Once you push to `main` and set the secret:
1.  Go to the **Actions** tab in your GitHub repo.
2.  You should see "Deploy to Azure Container Apps" running.
3.  When green, your app in Azure is updated!
