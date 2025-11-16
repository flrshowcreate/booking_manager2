# Deployment Guide - Booking Manager v3.0

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Database (Supabase/Neon/Railway)
- Google Maps API key

### Step-by-Step Deployment

#### 1. Prepare Database

**Using Supabase (Recommended):**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy database connection string from Settings → Database
4. Format: `postgresql://[user]:[password]@[host]:5432/[database]`

**Using Neon:**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

#### 2. Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/booking-manager.git
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. Add Environment Variables:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=(generate with: openssl rand -base64 32)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
STORAGE_ENDPOINT=https://your-project.supabase.co/storage/v1
STORAGE_BUCKET=event-files
SUPABASE_KEY=your-anon-key
RESEND_API_KEY=your-resend-key
EMAIL_FROM=booking@yourdomain.com
DEFAULT_COMMISSION_PCT=10
```

5. Click **Deploy**

#### 4. Initialize Database

After deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run database setup
vercel exec -- npx prisma db push
vercel exec -- npm run db:seed
```

Or use Vercel UI:
1. Go to your project → Settings → Functions
2. Add a one-time deployment function to run migrations

#### 5. Configure Custom Domain (Optional)

1. Go to Project → Settings → Domains
2. Add your domain
3. Configure DNS records as shown

---

## Alternative: Deploy to Railway

### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub account

### Steps

1. **Deploy Database**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   ```

2. **Deploy Application**
   ```bash
   # Link GitHub repo
   railway link
   
   # Add environment variables
   railway variables set DATABASE_URL=...
   railway variables set NEXTAUTH_SECRET=...
   # ... add all other variables
   
   # Deploy
   railway up
   ```

3. **Run Migrations**
   ```bash
   railway run npx prisma db push
   railway run npm run db:seed
   ```

---

## Production Checklist

### Security

- [ ] Change default admin password
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Enable CORS restrictions
- [ ] Set up rate limiting
- [ ] Configure CSP headers
- [ ] Enable HTTPS only

### Database

- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Set up monitoring/alerts
- [ ] Review and optimize indexes

### Storage

- [ ] Configure bucket policies
- [ ] Set up CDN (if needed)
- [ ] Enable file size limits
- [ ] Configure CORS for file uploads

### Email

- [ ] Verify domain with Resend
- [ ] Test email delivery
- [ ] Set up email templates
- [ ] Configure SPF/DKIM records

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Enable performance monitoring

### Google Maps

- [ ] Restrict API key to production domain
- [ ] Set up billing alerts
- [ ] Enable required APIs only
- [ ] Monitor usage

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | ✅ | PostgreSQL connection string | postgresql://... |
| NEXTAUTH_URL | ✅ | Application URL | https://app.com |
| NEXTAUTH_SECRET | ✅ | Auth secret key | abc123... |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | ✅ | Google Maps API key | AIza... |
| STORAGE_ENDPOINT | ✅ | S3-compatible storage URL | https://... |
| STORAGE_BUCKET | ✅ | Storage bucket name | event-files |
| SUPABASE_KEY | If using Supabase | Supabase anon key | eyJ... |
| RESEND_API_KEY | If using email | Resend API key | re_... |
| EMAIL_FROM | If using email | Sender email | no-reply@... |
| DEFAULT_COMMISSION_PCT | No | Default commission % | 10 |

---

## Troubleshooting

### Build Failures

**Error: Prisma Client not generated**
```bash
# Add postinstall script to package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Database Issues

**Error: Can't reach database**
- Check DATABASE_URL format
- Verify database is running
- Check firewall/security groups
- Verify connection pooling settings

### File Upload Issues

**Error: Storage bucket not accessible**
- Verify STORAGE_ENDPOINT is correct
- Check bucket permissions
- Ensure CORS is configured
- Verify API keys

### Email Issues

**Error: Email not sending**
- Verify RESEND_API_KEY
- Check domain verification
- Review email logs in Resend dashboard
- Verify EMAIL_FROM is authorized

---

## Performance Optimization

### Database

```typescript
// Add indexes for common queries
// In your Prisma schema:

@@index([bookingStatus, paymentStatus])
@@index([artistId, dateStart, dateEnd])
```

### Caching

```typescript
// Add Redis caching for API routes
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Cache events list
const cacheKey = 'events:all';
const cached = await redis.get(cacheKey);
if (cached) return cached;

const events = await prisma.event.findMany();
await redis.set(cacheKey, events, { ex: 300 }); // 5 min cache
```

### Image Optimization

```typescript
// In next.config.js
module.exports = {
  images: {
    domains: ['your-storage.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

---

## Scaling Considerations

### When to Scale

- **Vertical**: More CPU/RAM for single server
- **Horizontal**: Multiple servers with load balancer
- **Database**: Read replicas, connection pooling
- **Storage**: CDN for file delivery

### Serverless Functions

Vercel automatically scales functions, but consider:
- Function timeout limits
- Cold start performance
- Connection pooling for database
- Memory limits

---

## Support

- Documentation: Check README.md and IMPLEMENTATION_GUIDE.md
- Issues: Create GitHub issue
- Email: support@flrshowcreate.ro

---

**Last Updated**: November 2025
