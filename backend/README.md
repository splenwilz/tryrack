# TryRack Backend

A modern FastAPI backend application with proper architecture, database migrations, and development tools.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy 2.0** - Modern ORM with PostgreSQL support
- **Alembic** - Database migration tool
- **Pydantic** - Data validation and settings management
- **JWT Authentication** - Secure token-based authentication with Argon2 password hashing
- **CORS Support** - Cross-origin resource sharing
- **Development Tools** - Hot reload, debugging, and logging

## Project Structure

```
backend/
├── app/
│   ├── api/           # API routes and endpoints
│   ├── core/          # Core configuration and app setup
│   ├── db/            # Database configuration
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── services/      # Business logic
│   └── utils/         # Utility functions
├── alembic/           # Database migrations
├── main.py            # Application entry point
└── pyproject.toml     # Project configuration
```

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   uv run alembic upgrade head
   ```

4. **Start development server:**
   ```bash
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc
   - Health check: http://localhost:8000/api/v1/health

## Development

### Running the Server

- **Development mode** (with hot reload):
  ```bash
  uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
  ```

- **Development mode** (with debug logging):
  ```bash
  uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
  ```

- **Production mode**:
  ```bash
  uv run python main.py
  ```

### Database Migrations

- **Create a new migration:**
  ```bash
  uv run alembic revision --autogenerate -m "Description of changes"
  ```

- **Apply migrations:**
  ```bash
  uv run alembic upgrade head
  ```

- **Rollback migration:**
  ```bash
  uv run alembic downgrade -1
  ```

### Code Quality

- **Format code:**
  ```bash
  uv run black .
  uv run isort .
  ```

- **Lint code:**
  ```bash
  uv run flake8 .
  ```

- **Type checking:**
  ```bash
  uv run mypy .
  ```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/v1/users/` - List users
- `POST /api/v1/users/` - Create user
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

### OAuth Endpoints

- `GET /api/v1/auth/oauth/google` - Initiate Google OAuth flow
- `GET /api/v1/auth/oauth/callback` - Handle OAuth callback

## Configuration

The application uses environment variables for configuration. See `env.example` for available options.

Key settings:
- `DATABASE_URL` - PostgreSQL connection string (default: postgresql://splenwilz@localhost:5432/tryrack)
- `SECRET_KEY` - JWT secret key
- `DEBUG` - Enable debug mode
- `ENVIRONMENT` - Environment (development/production)

## Database Setup

The application is configured to use PostgreSQL by default. Make sure PostgreSQL is running and the `tryrack` database exists:

```sql
CREATE DATABASE tryrack;
```

The application will automatically create tables using Alembic migrations.