# Azure Deployment & CI/CD Plan

## Goal Description
Containerize the "Sid's Chatbot" application, deploy to Azure, and automate updates using GitHub Actions.

## User Review Required
> [!IMPORTANT]
> **GitHub Secrets**: You must add Azure credentials to your GitHub repository secrets for the pipeline to work.

## Proposed Changes

### Docker Configuration
#### [EXISTING] Dockerfile
> [!NOTE]
> **Architecture**:
> - **Backend**: FastAPI with OpenAI + **DuckDuckGo Search** tool.
> - **Frontend**: Vanilla HTML/CSS/JS with **Mobile Responsive Design**.

## Proposed Changes

### Project Structure
- `backend/`: Python FastAPI server.
- `frontend/`: Static HTML/CSS/JS.

### Backend Development
#### [MODIFY] backend/requirements.txt
- Add `duckduckgo-search`.

#### [MODIFY] backend/main.py
- Implement **Function Calling**: Add `tools` parameter to OpenAI call.
- Create `search_web(query)` function using `DDGS`.
- Logic to execute the tool if model requests it.

### Frontend Development
#### [MODIFY] frontend/index.html
- Add Hamburger Menu button `<button id="menu-btn">`.

#### [MODIFY] frontend/style.css
- CSS Media Queries for `max-width: 768px`.
- Sidebar hidden by default on mobile, toggled via class.

#### [MODIFY] frontend/script.js
- Event listener for menu button to toggle `.sidebar.active`.

### CI/CD (Recovery)
#### [NEW] .github/workflows/azure-deploy.yml
- Re-create the workflow file.

#### [NEW] github_setup.md
- Re-create the setup guide.

### CI/CD Configuration
#### [NEW] .github/workflows/azure-deploy.yml
- Trigger: Push to `main` branch.
- Job:
    1.  Checkout code.
    2.  Login to Azure (Service Principal).
    3.  Login to ACR.
    4.  Build and Push Docker Image.
    5.  Deploy to Azure Container Apps.

#### [NEW] .gitignore
- Ignore: `.env`, `__pycache__`, `.venv`, `.DS_Store`.

### Documentation
#### [NEW] github_setup.md
- Instructions on:
    1.  Initializing Git.
    2.  Creating the GitHub Repo.
    3.  Creating an Azure Service Principal.
    4.  Setting up GitHub Secrets (`AZURE_CREDENTIALS`, `ACR_USERNAME`, etc.).

## Verification Plan
- Push code to GitHub.
- Observe the "Actions" tab in GitHub to see the workflow succeed.
- Verify the Azure Container App updates with the new image.
