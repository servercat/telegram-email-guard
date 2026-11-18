#!/bin/sh
set -eu
cd /opt/email-guard
mkdir -p /var/lib/email-guard-reports
exec 9>/var/lib/email-guard-reports/run.lock
flock -n 9 || exit 0
docker exec email-guard-app-1 node --import tsx server/daily-report.ts prepare > /var/lib/email-guard-reports/report.json
python3 deploy/reports/render.py /var/lib/email-guard-reports/report.json /var/lib/email-guard-reports/report.png
if [ "${1:-}" = "--preview" ]; then exit 0; fi
docker cp /var/lib/email-guard-reports/report.json email-guard-app-1:/tmp/daily-report.json
docker cp /var/lib/email-guard-reports/report.png email-guard-app-1:/tmp/daily-report.png
docker exec email-guard-app-1 node --import tsx server/daily-report.ts send /tmp/daily-report.json /tmp/daily-report.png
