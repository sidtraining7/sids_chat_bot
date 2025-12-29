# Deployment Guide: Sid's Chatbot on Azure

This guide will help you deploy your Chat UI application to Azure Container Apps (ACA) using the Azure CLI.

## Prerequisites
- [x] Docker installed and running locally
- [x] Azure CLI installed (`az --version`)
- [x] Logged into Azure (`az login`)

## 1. Setup Variables
Run these commands in your PowerShell terminal to convert your environment variables (Modify the region/names if you like):

```powershell
$RESOURCE_GROUP = "rag-qa-rg" # Using existing Resource Group
$LOCATION = "eastus"
$ACR_NAME = "sidschatbotacr" # Your existing registry
$CONTAINER_APP_NAME = "sids-chatbot-app"
$IMAGE_NAME = "sids-chatbot:v1"
$ENV_NAME = "rag-qa-env" # Using existing Environment to avoid quota limits
```

## 2. Prepare Resources

Create a resource group:
```powershell
az group create --name $RESOURCE_GROUP --location $LOCATION
```

Create an Azure Container Registry (ACR) to store your Docker images:
```powershell
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true
```

## 3. Build and Push Image

Log in to your new ACR:
```powershell
az acr login --name $ACR_NAME
```

Build the Docker image (from the root directory `c:/UltimateRAG/chat_bot/`):
```powershell
# Get the login server name
$ACR_LOGIN_SERVER = $(az acr show --name $ACR_NAME --query loginServer --output tsv)

# Build and Tag
docker build -t "$ACR_LOGIN_SERVER/$IMAGE_NAME" .

# Push to ACR
docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME"
```

## 4. Deploy to Azure Container Apps

## 4. Deploy to Azure Container Apps

Deploy the container app using your existing environment (`rag-qa-env`). 
**Important**: We pass your OpenAI API Key as a secure secret environment variable.

*Replace `PasteYourKeyHere` with your actual OpenAI API Key below:*

```powershell
az containerapp create `
  --name $CONTAINER_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --environment $ENV_NAME `
  --image "$ACR_LOGIN_SERVER/$IMAGE_NAME" `
  --target-port 8000 `
  --ingress external `
  --registry-server $ACR_LOGIN_SERVER `
  --registry-username $ACR_NAME `
  --registry-password $(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv) `
  --env-vars OPENAI_API_KEY="PasteYourKeyHere"
```


## 5. Verify

Once the command finishes, it will output an `fqdn` (Fully Qualified Domain Name). 
Open that URL in your browser to verify your running chatbot!

---

### Troubleshooting
- **Logs**: You can view live logs with:
  ```powershell
  az containerapp logs show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --follow
  ```
- **Updates**: If you change code, just rebuild, push, and update the container app:
  ```powershell
  docker build -t "$ACR_LOGIN_SERVER/$IMAGE_NAME" .
  docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME"
  az containerapp update --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --image "$ACR_LOGIN_SERVER/$IMAGE_NAME"
  ```

- **Secrets**: To update your API Key or other secrets without redeploying:
  ```powershell
  az containerapp update --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --set-env-vars OPENAI_API_KEY="sk-proj-..."
  ```
