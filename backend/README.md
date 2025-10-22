# TryRack Backend

FastAPI backend with WorkOS AuthKit authentication integration.

## Setup

### 1. Install Dependencies

Using uv (recommended):
```bash
uv sync
```

Or using pip:
```bash
pip install -e .
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your WorkOS credentials:
   - Get your API key and Client ID from [WorkOS Dashboard](https://dashboard.workos.com/api-keys)
   - Generate a secure cookie password for session encryption
   - Configure redirect URIs in your WorkOS Dashboard

### 3. WorkOS Dashboard Configuration

In your WorkOS Dashboard, configure:
- **Redirect URI**: `http://localhost:8000/auth/callback`
- **Login Endpoint**: `http://localhost:8000/auth/login`
- **Logout Redirect**: `http://localhost:3000` (your frontend URL)

### 4. Run the Application

```bash
uv run python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health status
- `GET /auth/login` - Initiate login flow
- `GET /auth/callback` - Handle authentication callback
- `GET /auth/logout` - Logout user
- `GET /auth/me` - Get current user info
- `GET /auth/protected` - Example protected route

## Documentation

- API docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## WorkOS Integration

This backend integrates with WorkOS AuthKit following the official documentation:
- [WorkOS AuthKit Python Guide](https://workos.com/docs/authkit/react/python)
- [WorkOS Python SDK](https://github.com/workos/workos-python)
