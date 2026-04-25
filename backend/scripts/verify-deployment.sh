
#!/bin/bash
# Verify deployment health
# Usage: ./verify-deployment.sh <url> <timeout_seconds>

URL=$1
TIMEOUT=${2:-30}
START_TIME=$(date +%s)
FAILURES=0
MAX_FAILURES=3

echo "🔍 Verifying deployment at $URL (Timeout: ${TIMEOUT}s)..."

while true; do
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))

  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "✅ Verification period passed successfully."
    exit 0
  fi

  # Check health endpoint
  # Expecting JSON with status: UP
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    # Optional: Check deeper health metrics from body if needed
    echo "  [$(date +%T)] Health check passed (200 OK)"
    FAILURES=0 # Reset failures on success
  else
    echo "  [$(date +%T)] Health check failed (Status: $HTTP_CODE)"
    FAILURES=$((FAILURES + 1))
  fi

  if [ $FAILURES -ge $MAX_FAILURES ]; then
    echo "❌ Health check failed $FAILURES times consecutively. Triggering rollback!"
    exit 1
  fi

  sleep 5
done
