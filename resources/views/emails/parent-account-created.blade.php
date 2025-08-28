<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parent Account Created</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        .muted { color: #6b7280; }
        .btn { display: inline-block; background: #16a34a; color: white; padding: 10px 16px; border-radius: 6px; text-decoration: none; }
        .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    </style>
    <!-- Do not inline secrets; show password once -->
</head>
<body>
<div class="container">
    <h2>Hello {{ $parent->name }},</h2>
    <div class="card">
        <p>Your parent account has been created successfully.</p>
        <p><strong>Login email:</strong> <span class="code">{{ $parent->email }}</span></p>
        <p><strong>Temporary password:</strong> <span class="code">{{ $plainPassword }}</span></p>
        <p class="muted">For security, please log in and change your password immediately after your first login.</p>
        <p>
            <a href="https://sfcg.psanguan.com/login" class="btn">Go to Login</a>
        </p>
    </div>
    <p class="muted">If you did not request this account, please contact support.</p>
    <p class="muted">&mdash; {{ config('app.name') }}</p>
    </div>
</body>
</html>


