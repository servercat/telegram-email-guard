import test from 'node:test';
import assert from 'node:assert/strict';
import {reportWindow} from '../server/daily-report';
test('daily report uses fixed 16:00 Beijing boundaries including delayed runs',()=>{for(const [now,end] of [['2026-11-18T07:59:59Z','2026-11-17T08:00:00.000Z'],['2026-11-18T08:00:00Z','2026-11-18T08:00:00.000Z'],['2026-11-18T10:30:00Z','2026-11-18T08:00:00.000Z']]){const w=reportWindow(new Date(now));assert.equal(w.end.toISOString(),end);assert.equal(+w.end-+w.start,86400000)}});
