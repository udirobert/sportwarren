#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Database backup script for SportWarren
#
# Usage:
#   ./scripts/backup-database.sh
#
# Environment variables:
#   DATABASE_URL    — PostgreSQL connection string (required)
#   BACKUP_DIR      — Local backup directory (default: ./backups/postgres)
#   BACKUP_S3_BUCKET — S3 bucket name (optional, uploads if set)
#   BACKUP_RETENTION_DAYS — Days to keep local backups (default: 7)
# ─────────────────────────────────────────────────────────────────────────────

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sportwarren_${TIMESTAMP}.sql.gz"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

echo "Starting backup at $(date)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Run pg_dump and compress
pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$BACKUP_FILE"

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup created: $BACKUP_FILE ($FILESIZE)"

# Upload to S3 if configured
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  echo "Uploading to s3://${BACKUP_S3_BUCKET}/postgres/"
  aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/postgres/" --storage-class STANDARD_IA
  echo "Upload complete"
fi

# Clean up old local backups
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "sportwarren_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Backup complete at $(date)"
