# =============================================
# robots.txt for Nairaly.com
# Optimized for Nigerian tech & blog content
# Last updated: March 2026
# =============================================

User-agent: *
Allow: /

# Disallow sensitive or admin areas
Disallow: /api/
Disallow: /_next/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /private/
Disallow: /preview/

# Disallow duplicate or low-value pages
Disallow: /*?topic=null
Disallow: /*?*
Disallow: /article/*?*

# Allow specific query parameters that are important
Allow: /?topic=
Allow: /article/

# Sitemap reference
Sitemap: https://nairaly.com/sitemap.xml

# Crawl-delay (optional - helpful for smaller sites)
# Crawl-delay: 1

# =============================================
# Specific rules for major crawlers
# =============================================

User-agent: Googlebot
Allow: /
Sitemap: https://nairaly.com/sitemap.xml

User-agent: Googlebot-Image
Allow: /
Sitemap: https://nairaly.com/sitemap.xml

User-agent: Bingbot
Allow: /
Sitemap: https://nairaly.com/sitemap.xml

# Block aggressive AI crawlers if desired (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /