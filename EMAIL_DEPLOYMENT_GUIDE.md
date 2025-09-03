# Email Configuration Deployment Guide

## Issues Fixed

1. **Updated default mailer** in `config/mail.php` to use 'gmail' instead of 'log'
2. **Standardized all mail classes** to use `config('mail.from.address')` instead of hardcoded emails
3. **Fixed inconsistent "from" addresses** across all email classes

## Environment Variables for Live Deployment

Add these variables to your `.env` file on the live server:

```env
# Email Configuration - Gmail SMTP
MAIL_MAILER=gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=hansel.canete24@gmail.com
MAIL_PASSWORD=zgvshkdfzsvwdarp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hansel.canete24@gmail.com"
MAIL_FROM_NAME="SFCG System"

# Make sure these are also set for production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
```

## Files Modified

1. **config/mail.php** - Changed default mailer to 'gmail'
2. **app/Mail/GeneralAnnouncementEmail.php** - Updated to use config
3. **app/Mail/WelcomeEmail.php** - Updated to use config and better subject
4. **app/Mail/GradeUpdateEmail.php** - Updated to use config
5. **app/Mail/HonorQualificationEmail.php** - Updated to use config
6. **app/Mail/ParentHonorNotificationEmail.php** - Updated to use config
7. **app/Mail/ParentAccountCreatedEmail.php** - Already using config correctly

## Deployment Steps

1. **Update your .env file** on the live server with the email configuration above
2. **Clear config cache**: `php artisan config:clear`
3. **Test email functionality** using the test command below

## Testing Email Functionality

Run this command to test email sending:

```bash
php artisan tinker
```

Then in tinker:
```php
use App\Mail\WelcomeEmail;
use App\Models\User;

$user = User::first();
Mail::to('test@example.com')->send(new WelcomeEmail($user));
```

## Troubleshooting

If emails still don't work:

1. **Check Gmail App Password**: Make sure the app password `zgvshkdfzsvwdarp` is correct (no spaces)
2. **Verify Gmail Settings**: Ensure 2-factor authentication is enabled and app password is generated
3. **Check Server Logs**: Look at `storage/logs/laravel.log` for email errors
4. **Test SMTP Connection**: Use a tool like `telnet smtp.gmail.com 587` to verify connectivity
5. **Check Firewall**: Ensure port 587 is not blocked on your server

## cPanel Specific Notes

For cPanel hosting:
- Make sure SMTP is enabled in cPanel
- Check if there are any email restrictions
- Verify that outbound port 587 is allowed
- Consider using cPanel's email service if Gmail SMTP is blocked

## Queue Configuration

Since your mail classes implement `ShouldQueue`, make sure:
1. **Queue driver** is set to `database` or `redis` in production
2. **Queue worker** is running: `php artisan queue:work`
3. **Failed jobs table** exists: `php artisan queue:failed-table && php artisan migrate`
