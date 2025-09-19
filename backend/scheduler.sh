#!/bin/sh

set -e

echo "Starting scheduler..."

while true; do
  python manage.py process_recurring

  echo "Recurring transactions processed. Waiting 24 hours..."
  sleep 86400
done