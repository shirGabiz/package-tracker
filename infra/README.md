# Infrastructure (Bicep)

This folder defines the Azure resources for Package Tracker.

## Resources provisioned

- Resource Group (assumed to exist)
- Azure SQL Server + Database (Serverless)
- App Service Plan + App Service (API)
- Static Web App (frontend)
- Application Insights
- Key Vault (secrets, accessed via Managed Identity)

## Deploy

```bash
az login
az deployment group create \
  --resource-group rg-package-tracker-dev \
  --template-file main.bicep \
  --parameters @parameters.dev.json
```

> Azure AD B2C tenant is provisioned manually (one-time) and referenced by
> client ID / tenant name in app settings.
