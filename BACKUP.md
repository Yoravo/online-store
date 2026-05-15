# Backup & Recovery Plan

## Database (Supabase PostgreSQL)

### Automatic Backups
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Point-in-time recovery (PITR) up to 7 days

### Manual Backup
```bash
pg_dump $DIRECT_URL > backup_$(date +%Y%m%d).sql
```

### Recovery
1. Login ke Supabase Dashboard → Settings → Database
2. Klik "Restore" dan pilih backup point
3. Atau restore manual: `psql $DIRECT_URL < backup_file.sql`

## File Storage (Supabase Storage)
- Supabase Storage tidak punya auto-backup
- Untuk production: setup periodic sync ke S3/R2 via cron

## Environment Variables
- Simpan copy `.env.production` di password manager (1Password/Bitwarden)
- Jangan simpan di git

## Disaster Recovery Steps
1. Restore database dari Supabase backup
2. Redeploy app dari git (Vercel auto-deploy)
3. Verify: hit `/api/health` endpoint
4. Run reconciliation: `POST /api/payment/reconcile`
