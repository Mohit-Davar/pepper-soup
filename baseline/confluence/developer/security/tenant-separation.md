# Tenant Separation and Authentication

Tenant passwords are stored encrypted in the fineract_tenants schema using AES/CBC/PKCS5Padding in Java, not database-level encryption. The master password and initialization vector are configured through environment variables. Encryption cannot be turned off, and credentials are encoded so they are unavailable for non-authorised access.
