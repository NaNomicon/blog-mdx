# Cloudflare Analytics Setup Guide

This guide will help you set up Cloudflare Analytics for your blog to track website performance and visitor metrics.

## 🚀 Quick Setup

### Step 1: Get Your Cloudflare Analytics Token

1. **Log in to Cloudflare Dashboard**

   - Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Log in with your Cloudflare account

2. **Navigate to Web Analytics**

   - Click on **Analytics & Logs** in the sidebar
   - Select **Web Analytics**

3. **Add Your Site**

   - Click **Add a site**
   - Enter your hostname: `nandev.net`
   - Click **Done**

4. **Get Your Token**
   - After adding the site, click **Manage site**
   - Copy the JavaScript snippet provided
   - Extract the token from the snippet (it looks like: `"token": "abc123def456..."`)

### Step 2: Configure Your Environment

1. **Create Environment File**

   ```bash
   # Copy the example file to create your local environment file
   cp .env.example .env.local
   ```

2. **Add Your Token**

   ```bash
   # Edit .env.local and replace the empty value with your actual token
   # NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_actual_token_here
   ```

   Replace `your_actual_token_here` with the actual token from Step 1.

### Step 3: Deploy and Verify

1. **Build and Deploy**

   ```bash
   pnpm build
   pnpm start
   ```

2. **Verify Installation**
   - Open your website in a browser
   - Open Developer Tools (F12)
   - Check the Console for: "Cloudflare Analytics loaded successfully"
   - Check Network tab for requests to `cloudflareinsights.com`

## 🔧 Configuration Options

### Environment Variables

| Variable                                 | Description                     | Required |
| ---------------------------------------- | ------------------------------- | -------- |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Your Cloudflare Analytics token | Yes      |

### Advanced Configuration

The analytics script includes these default settings:

- **Defer Loading**: Script loads after page content
- **Error Handling**: Logs errors if script fails to load
- **Duplicate Prevention**: Prevents multiple script injections
- **Analytics Enabled**: Tracks page views and performance metrics

## 📊 What Gets Tracked

Cloudflare Analytics automatically tracks:

- **Page Views**: Number of visits to each page
- **Unique Visitors**: Number of unique users
- **Page Load Time**: Performance metrics
- **Core Web Vitals**: LCP, FID, CLS metrics
- **Referrers**: Where visitors come from
- **Countries**: Geographic distribution of visitors
- **Browsers**: Browser usage statistics
- **Devices**: Desktop vs mobile usage

## 🔍 Viewing Your Analytics

1. **Access Dashboard**

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Analytics & Logs** → **Web Analytics**
   - Select your site

2. **Available Metrics**
   - **Traffic**: Page views, unique visitors, bounce rate
   - **Performance**: Page load times, Core Web Vitals
   - **Popular Pages**: Most visited pages
   - **Referrers**: Traffic sources
   - **Countries**: Visitor locations
   - **Browsers & OS**: Technology usage

## 🛠️ Troubleshooting

### Analytics Not Working?

1. **Check Token**

   ```bash
   # Verify your token is set
   echo $NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN
   ```

2. **Check Browser Console**

   - Look for error messages
   - Verify "Cloudflare Analytics loaded successfully" appears

3. **Check Network Requests**

   - Open Developer Tools → Network tab
   - Look for requests to `static.cloudflareinsights.com`

4. **Verify Environment**
   ```bash
   # Make sure .env.local is in your .gitignore
   grep -q "\.env\.local" .gitignore && echo "✅ Properly ignored" || echo "❌ Add .env.local to .gitignore"
   ```

### Common Issues

| Issue                | Solution                                                |
| -------------------- | ------------------------------------------------------- |
| No data in dashboard | Wait 5-10 minutes for data to appear                    |
| Script not loading   | Check token format and network connectivity             |
| Console errors       | Verify token is correct and site is added to Cloudflare |
| Duplicate tracking   | Clear browser cache and reload                          |

## 🔒 Privacy & Security

### Privacy Features

- **No Cookies**: Cloudflare Analytics doesn't use cookies
- **No Fingerprinting**: Doesn't track individual users
- **GDPR Compliant**: Respects user privacy
- **No Personal Data**: Only aggregated metrics

### Security

- **Token Security**: Keep your token in environment variables
- **HTTPS Only**: Analytics only work over HTTPS
- **CSP Compatible**: Works with Content Security Policies

## 📈 Best Practices

1. **Monitor Regularly**: Check analytics weekly for insights
2. **Set Goals**: Define what metrics matter for your blog
3. **Compare Periods**: Look at trends over time
4. **Optimize Performance**: Use Core Web Vitals to improve UX
5. **Content Strategy**: Use popular pages data to guide content creation

## 🚀 Next Steps

After setup, consider:

1. **Set up Alerts**: Configure notifications for traffic spikes
2. **Export Data**: Use Cloudflare's GraphQL API for custom reports
3. **Integrate with Other Tools**: Combine with Google Search Console
4. **Performance Optimization**: Use insights to improve site speed

## 📚 Additional Resources

- [Cloudflare Analytics Documentation](https://developers.cloudflare.com/web-analytics/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Privacy-First Analytics](https://blog.cloudflare.com/privacy-first-web-analytics/)

---

**Need Help?** Check the troubleshooting section above or refer to the [Cloudflare Community](https://community.cloudflare.com/).
