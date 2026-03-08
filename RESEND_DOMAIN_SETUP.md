# Resend Domain Setup Guide

## Current Status
✅ Domain: `otrade.ae`
✅ API Key: Active
✅ Emails sending successfully from backend
❌ Emails not reaching recipients (likely going to spam)

## Problem
Emails are being sent successfully by Resend (confirmed by API response), but recipients are not receiving them. This is typically caused by:

1. **Missing DNS Records** - SPF, DKIM, DMARC not configured
2. **Domain Reputation** - New domain needs time to build reputation
3. **Spam Filters** - Content or sender triggering spam filters

## Solution: Configure DNS Records

### Step 1: Login to Resend Dashboard
1. Go to: https://resend.com/domains
2. Click on your domain: `otrade.ae`
3. You should see DNS records that need to be added

### Step 2: Add DNS Records to Your Domain Provider

You need to add these records (get exact values from Resend dashboard):

#### SPF Record (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### DKIM Records (TXT)
Resend will provide 3 DKIM records like:
```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]
TTL: 3600

Type: TXT
Name: resend2._domainkey
Value: [provided by Resend]
TTL: 3600

Type: TXT
Name: resend3._domainkey
Value: [provided by Resend]
TTL: 3600
```

#### DMARC Record (TXT) - ⚠️ REQUIRED
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@otrade.ae; pct=100; adkim=s; aspf=s
TTL: 3600
```

**Explanation:**
- `p=quarantine` - Quarantine emails that fail authentication (send to spam)
- `rua=mailto:dmarc@otrade.ae` - Send DMARC reports to this email
- `pct=100` - Apply policy to 100% of emails
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment

### Step 3: Verify Records in Resend
1. After adding DNS records, wait 5-10 minutes
2. Go back to Resend dashboard
3. Click "Verify" button
4. All records should show green checkmarks

### Step 4: Test Email Delivery

After verification, test by sending to:
- Gmail account
- Outlook account
- Yahoo account

Check both Inbox and Spam folders.

## Temporary Workaround

While waiting for DNS setup, you can:

1. **Ask recipients to check Spam folder**
2. **Add sender to contacts**: Have recipients add `noreply@otrade.ae` to their contacts
3. **Use a different FROM address**: Temporarily use a verified personal email

## Check Email Status

You can check email delivery status in Resend dashboard:
1. Go to: https://resend.com/emails
2. Find your email by ID: `28d9fa6e-9e23-45de-98aa-30cf5c5c16f3`
3. Check delivery status and any bounce/spam reports

## Common Issues

### Issue 1: Emails going to Spam
**Solution**: 
- Configure all DNS records (SPF, DKIM, DMARC)
- Avoid spam trigger words in subject/content
- Include unsubscribe link
- Use proper HTML structure

### Issue 2: Emails bouncing
**Solution**:
- Verify recipient email addresses are valid
- Check bounce reports in Resend dashboard
- Remove invalid emails from list

### Issue 3: Low delivery rate
**Solution**:
- Build domain reputation gradually (start with small batches)
- Engage with recipients (ask them to reply/click)
- Monitor spam complaints

## Best Practices

1. **Warm up your domain**: Start with small batches (10-20 emails/day) and gradually increase
2. **Monitor metrics**: Check open rates, click rates, bounce rates in Resend dashboard
3. **Clean your list**: Remove bounced/invalid emails regularly
4. **Personalize content**: Use recipient names, relevant content
5. **Include unsubscribe**: Always provide easy unsubscribe option
6. **Test before sending**: Send test emails to yourself first

## Current Configuration

```env
RESEND_API_KEY=re_7rdZDzAQ_5hsEutGpWqJDvHjfiwr4vTVD
RESEND_FROM_EMAIL=OTrade <hello@otrade.ae>
RESEND_TEST_MODE=false
```

**Note:** Changed from `noreply@otrade.ae` to `hello@otrade.ae` to improve deliverability and trust.

## Next Steps

1. ✅ Configure DNS records (SPF, DKIM, DMARC)
2. ✅ Verify domain in Resend dashboard
3. ✅ Test email delivery to different providers
4. ✅ Monitor delivery metrics
5. ✅ Gradually increase sending volume

## Support

If issues persist after DNS setup:
- Contact Resend support: https://resend.com/support
- Check Resend status: https://status.resend.com/
- Review Resend docs: https://resend.com/docs
