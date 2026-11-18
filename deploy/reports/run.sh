#!/bin/sh
set -eu
cd /opt/email-guard
mkdir -p /var/lib/email-guard-reports
exec 9>/var/lib/email-guard-reports/run.lock
flock -n 9 || exit 0
work=$(mktemp -d /var/lib/email-guard-reports/run.XXXXXX)
cleanup() {
 rm -f "$work/report.json" "$work/report.png"
 rmdir "$work"
 docker exec -u 0 email-guard-app-1 rm -f /tmp/daily-report.json /tmp/daily-report.png >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
docker exec email-guard-app-1 node --import tsx server/daily-report.ts prepare > "$work/report.json"
python3 deploy/reports/render.py "$work/report.json" "$work/report.png"
if [ "${1:-}" = "--preview" ]; then
 cp "$work/report.png" /var/lib/email-guard-reports/report-preview.png
 exit 0
fi
docker cp "$work/report.json" email-guard-app-1:/tmp/daily-report.json
docker cp "$work/report.png" email-guard-app-1:/tmp/daily-report.png
docker exec email-guard-app-1 node --import tsx server/daily-report.ts send /tmp/daily-report.json /tmp/daily-report.png
