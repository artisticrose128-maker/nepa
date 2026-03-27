# RSS Feed Support Feature

## Overview
This feature adds RSS feed generation capabilities to the NEPA platform, allowing users and systems to subscribe to real-time updates about payments, bills, reports, and other platform activities.

## Features

### Available RSS Feeds

1. **Recent Payments Feed** - `/api/rss/payments`
   - Lists recent payment transactions
   - Supports filtering by payment status (SUCCESS, FAILED, PENDING)
   - Includes transaction details, amounts, and blockchain information

2. **Recent Bills Feed** - `/api/rss/bills`
   - Lists recent utility bills
   - Supports filtering by bill status (PENDING, PAID, OVERDUE)
   - Includes bill amounts, due dates, and utility provider information

3. **Recent Reports Feed** - `/api/rss/reports`
   - Lists recently generated reports
   - Supports filtering by report type (REVENUE, USER_GROWTH, BILLS)
   - Includes report metadata and generation timestamps

4. **Combined Activity Feed** - `/api/rss/activity`
   - Aggregates all platform activity (payments, bills, reports)
   - Provides a comprehensive view of recent platform usage
   - Ideal for monitoring overall system activity

5. **User-Specific Activity Feed** - `/api/rss/user/{userId}`
   - Shows activity for a specific user
   - Combines user's payments, bills, and generated reports
   - Useful for personal activity tracking

## API Endpoints

### Query Parameters

All endpoints support the following query parameters:

- `limit` (integer, default: 50, max: 200-300) - Maximum number of items to return
- `status` (string) - Filter by status (varies by endpoint)
- `type` (string) - Filter by type (reports endpoint only)

### Response Format

All endpoints return valid RSS 2.0 XML with the following structure:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Feed Title</title>
    <description>Feed Description</description>
    <link>https://nepa.io</link>
    <ttl>60</ttl>
    <!-- Items -->
  </channel>
</rss>
```

### Example Usage

#### Get Recent Payments
```bash
curl "https://api.nepa.io/api/rss/payments?limit=20&status=SUCCESS"
```

#### Get User Activity
```bash
curl "https://api.nepa.io/api/rss/user/user-123?limit=50"
```

#### Get Combined Activity
```bash
curl "https://api.nepa.io/api/rss/activity?limit=100"
```

## Integration Examples

### RSS Reader Integration
Users can add these feeds to any RSS reader application:

- Feedly: `https://api.nepa.io/api/rss/activity`
- Inoreader: `https://api.nepa.io/api/rss/payments`
- RSS clients: Any standard RSS 2.0 compatible reader

### Programmatic Integration

#### JavaScript/Node.js
```javascript
const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL('https://api.nepa.io/api/rss/payments');
  console.log(feed.title);
  feed.items.forEach(item => {
    console.log(item.title + ': ' + item.link);
  });
})();
```

#### Python
```python
import feedparser

feed = feedparser.parse('https://api.nepa.io/api/rss/activity')
for entry in feed.entries:
    print(f"{entry.title}: {entry.link}")
```

#### PHP
```php
$feed = simplexml_load_file('https://api.nepa.io/api/rss/bills');
foreach ($feed->channel->item as $item) {
    echo $item->title . ': ' . $item->link . "\n";
}
```

## Caching

- RSS feeds include `<ttl>60</ttl>` (time to live) for 1-hour caching
- Clients should respect the TTL directive for optimal performance
- Server-side caching may be implemented for high-traffic deployments

## Security Considerations

- RSS feeds are publicly accessible by default
- User-specific feeds require valid user IDs
- Sensitive information is filtered from RSS content
- Rate limiting applies to all RSS endpoints

## Performance

- Feeds are generated on-demand with database queries
- Consider implementing caching for high-traffic scenarios
- Large result sets are paginated via the limit parameter
- Database indexes are utilized for optimal query performance

## Monitoring

- RSS feed requests are logged in the audit system
- Performance metrics can be tracked via monitoring endpoints
- Error rates and response times should be monitored

## Future Enhancements

1. **Authentication Support** - Private feeds requiring API keys
2. **Webhook Integration** - Push notifications for new feed items
3. **Custom Feed Builder** - User-defined feed configurations
4. **Feed Analytics** - Usage statistics and popular feeds
5. **CDN Integration** - Global distribution for better performance

## Dependencies

- `rss` package for RSS generation
- `@types/rss` for TypeScript support
- Existing Prisma database models
- Express.js routing middleware

## Testing

Run the RSS feed tests:

```bash
npm test -- tests/rss.test.ts
```

Test coverage includes:
- RSS XML structure validation
- Parameter handling
- Error scenarios
- Content verification

## Deployment Notes

- Ensure `SITE_URL` environment variable is set for proper link generation
- Database connection required for feed content
- Consider CDN configuration for feed distribution
- Monitor feed generation performance in production
