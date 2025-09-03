# Live Server Email Fix Guide

## 🔍 **Current Status:**
- ✅ **Local**: Email working perfectly
- ❌ **Live Server**: Email not sending

## 🚨 **Common Live Server Issues:**

### 1. **Environment File Not Updated**
Make sure your live server's `.env` file has the exact same configuration:

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

# Production Settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-actual-domain.com
```

### 2. **Configuration Cache Not Cleared**
Run these commands on your live server:
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### 3. **cPanel/iFastNet Specific Issues**

#### **Check SMTP Settings in cPanel:**
1. Go to cPanel → Email Accounts
2. Make sure SMTP is enabled
3. Check if there are any email restrictions

#### **Check Outbound Ports:**
- Port 587 might be blocked
- Try port 465 with SSL instead

#### **Check Firewall:**
- Some hosting providers block SMTP ports
- Contact support if needed

### 4. **Alternative Gmail Configuration**
If port 587 doesn't work, try this configuration:

```env
MAIL_MAILER=gmail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=hansel.canete24@gmail.com
MAIL_PASSWORD=zgvshkdfzsvwdarp
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="hansel.canete24@gmail.com"
MAIL_FROM_NAME="SFCG System"
```

### 5. **Queue Configuration**
Since your emails use `ShouldQueue`, make sure:

```env
QUEUE_CONNECTION=database
```

And run the queue worker:
```bash
php artisan queue:work
```

## 🛠️ **Step-by-Step Live Server Fix:**

### **Step 1: Upload Files**
Make sure all updated files are uploaded to your live server:
- `config/mail.php`
- All `app/Mail/*.php` files
- `app/Console/Commands/TestEmailCommand.php`

### **Step 2: Update .env File**
Edit your live server's `.env` file with the Gmail configuration above.

### **Step 3: Clear All Caches**
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

### **Step 4: Test Email**
```bash
php artisan email:test hansel.canete24@gmail.com
```

### **Step 5: Check Logs**
```bash
tail -f storage/logs/laravel.log
```

## 🔧 **Alternative Solutions:**

### **Option 1: Use cPanel Email Service**
If Gmail SMTP is blocked, use your hosting provider's email:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="SFCG System"
```

### **Option 2: Use SendGrid/Mailgun**
For more reliable email delivery:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="SFCG System"
```

## 🧪 **Testing Commands:**

### **Test SMTP Connection:**
```bash
php test_email_config.php
```

### **Test Laravel Email:**
```bash
php artisan email:test hansel.canete24@gmail.com
```

### **Check Configuration:**
```bash
php artisan tinker
```
Then in tinker:
```php
config('mail.default')
config('mail.mailers.gmail')
```

## 📞 **If Still Not Working:**

1. **Contact your hosting provider** about SMTP restrictions
2. **Check if port 587/465 is blocked**
3. **Try using your hosting provider's email service**
4. **Consider using a third-party email service** like SendGrid

## 🎯 **Quick Fix Checklist:**

- [ ] .env file updated on live server
- [ ] All caches cleared
- [ ] Files uploaded to live server
- [ ] SMTP ports not blocked
- [ ] Queue worker running (if using queues)
- [ ] Gmail app password correct
- [ ] 2FA enabled on Gmail account
