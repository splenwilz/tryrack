from workos import WorkOSClient
from app.core.config import settings

# Initialize WorkOS client with API key and client ID
# Based on WorkOS Python SDK documentation: https://github.com/workos/workos-python
workos_client = WorkOSClient(
    api_key=settings.WORKOS_API_KEY,
    client_id=settings.WORKOS_CLIENT_ID
)
