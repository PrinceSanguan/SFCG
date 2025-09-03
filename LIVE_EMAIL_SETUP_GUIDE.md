# Live Server Email Configuration Guide

## Environment Variables Setup for cPanel/iFastNet

You need to add these environment variables to your live server's `.env` file:

### Required Environment Variables

```env
# Mail Configuration
MAIL_MAILER=gmail
MAIL_FROM_ADDRESS=hansel.canete24@gmail.com
MAIL_FROM_NAME="SFCG"

# Gmail SMTP Configuration
GMAIL_USERNAME=hansel.canete24@gmail.com
GMAIL_PASSWORD=zgvs hkdf zsvw darp

# App Configuration
APP_URL=https://sfcg.psanguan.com
APP_NAME="SFCG"
```

## Steps to Configure on cPanel/iFastNet:

### 1. Access Your cPanel
- Log into your cPanel account
- Navigate to "File Manager"

### 2. Edit .env File
- Go to your website's root directory (usually `public_html` or `public_html/sfcg`)
- Find the `.env` file
- Edit it and add the environment variables above

### 3. Clear Laravel Cache
After updating the `.env` file, you need to clear Laravel's cache:

```bash
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

### 4. Verify Gmail App Password
Make sure you're using an **App Password** for Gmail, not your regular password:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Generate an App Password for "Mail"
4. Use that App Password in the `GMAIL_PASSWORD` variable

### 5. Test Email Configuration
You can test the email configuration by running:

```bash
php artisan tinker
```

Then in tinker:
```php
Mail::raw('Test email', function ($message) {
    $message->to('your-test-email@example.com')->subject('Test Email');
});
```

## Important Notes:

1. **Security**: Never commit your `.env` file to version control
2. **App Passwords**: Use Gmail App Passwords, not your regular Gmail password
3. **Queue Workers**: If you're using queues, make sure queue workers are running on your server
4. **Firewall**: Ensure your server allows outbound connections on port 587 (SMTP)

## Troubleshooting:

### If emails still don't work:

1. **Check Laravel Logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Test SMTP Connection**:
   ```bash
   php artisan tinker
   ```
   ```php
   config('mail.mailers.gmail')
   ```

3. **Verify Environment Variables**:
   ```bash
   php artisan tinker
   ```
   ```php
   env('GMAIL_USERNAME')
   env('GMAIL_PASSWORD')
   ```

4. **Check Queue Status** (if using queues):
   ```bash
   php artisan queue:work --verbose
   ```

## Alternative: Using cPanel Email Instead of Gmail

If Gmail continues to have issues, you can configure your server's email:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.sfcg.psanguan.com
MAIL_PORT=587
MAIL_USERNAME=your-email@sfcg.psanguan.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@sfcg.psanguan.com
MAIL_FROM_NAME="SFCG"
```

Contact your hosting provider (iFastNet) for the correct SMTP settings for your domain.
