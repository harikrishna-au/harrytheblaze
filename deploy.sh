#!/bin/bash
set -e

# Backup old samconfig.toml to force a fresh deployment state (avoids bucket permission errors)
if [ -f "samconfig.toml" ]; then
    echo "� Backing up old samconfig.toml..."
    mv samconfig.toml samconfig.toml.user_backup
fi

# Parse credentials safely (handling comments and whitespace)
export AWS_ACCESS_KEY_ID=$(grep AWS_ACCESS_KEY_ID backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')
export AWS_SECRET_ACCESS_KEY=$(grep AWS_SECRET_ACCESS_KEY backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')
export AWS_DEFAULT_REGION=$(grep AWS_DEFAULT_REGION backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: Could not find credentials in backend/.env"
    exit 1
fi

echo "✅ Credentials loaded for account ending in: ...${AWS_ACCESS_KEY_ID: -4}"
echo "🌏 Region: $AWS_DEFAULT_REGION"

export OPENAI_API_KEY=$(grep OPENAI_API_KEY backend/.env | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not found in backend/.env"
    exit 1
fi

# Optional extras for auth. Neither is required: tokens are verified with Clerk's public
# keys and Premium is read with the public Supabase key (see template.yaml).
export CLERK_SECRET_KEY=$(grep CLERK_SECRET_KEY backend/.env 2>/dev/null | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY backend/.env 2>/dev/null | cut -d '#' -f1 | awk -F= '{print $2}' | tr -d ' "[:space:]')

# Check if Docker is running (Required for Linux binary compatibility)
if ! docker info &> /dev/null; then
    echo "⚠️  WARNING: Docker is not running or not installed."
    echo "   Deploying from macOS without Docker will cause 502 Bad Gateway errors on Lambda"
    echo "   because Python dependencies (like FastAPI/Pydantic) must be compiled for Linux."
    echo ""
    read -p "❓ Do you want to proceed anyway (NOT RECOMMENDED)? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled. Please install/start Docker Desktop and try again."
        exit 1
    fi
    echo "⚠️  Proceeding with host build... (Expect 502 errors)"
    USE_CONTAINER=""
else
    echo "🐳 Docker is running. Using container for build (Safe)."
    USE_CONTAINER="--use-container"
fi

PARAM_OVERRIDES="OpenAiApiKey=$OPENAI_API_KEY"
[ -n "$CLERK_SECRET_KEY" ] && PARAM_OVERRIDES="$PARAM_OVERRIDES ClerkSecretKey=$CLERK_SECRET_KEY"
[ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && PARAM_OVERRIDES="$PARAM_OVERRIDES SupabaseServiceRoleKey=$SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "📦 Building project (Clean Build)..."
rm -rf .aws-sam
sam build $USE_CONTAINER

echo ""
echo "🚀 Deploying to NEW ACCOUNT..."
# We use --resolve-s3 to let SAM manage the bucket in the new account
sam deploy \
    --stack-name communication-backend \
    --region $AWS_DEFAULT_REGION \
    --capabilities CAPABILITY_IAM \
    --resolve-s3 \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --parameter-overrides $PARAM_OVERRIDES

echo ""
echo "🌱 Seeding Database..."
python3 backend/seed_dynamo.py
