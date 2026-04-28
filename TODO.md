# Coach Dashboard Session/Attendance Fix Progress

## [x] Backend Analysis Complete
- Identified race condition in `markAttendance()` pre-upsert check
- `submitAttendance()` loops all students calling markAttendance individually
- Multiple saves trigger double enrollment decrement

## [ ] 1. Implement Transaction Fix
- Wrap `markAttendance()` in `$transaction`
- Atomic check + decrement + upsert

## [ ] 2. Restart Backend
```
Ctrl+C (stop current)
cd "../Cedars-Backup/cedars-sport-academy-api"
npm run start:dev
```

## [ ] 3. Test Flow
- Coach dashboard → open session → mark attendance → save
- Edit note/grade → save again
- Verify sessionsRemaining decrements **only once**

## [ ] 4. Parent Dashboard Verification
- Check student enrollment shows correct sessionsRemaining

**Expected result:** Single decrement per unique student/schedule/date regardless of multiple saves.
