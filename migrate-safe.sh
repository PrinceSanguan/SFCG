#!/bin/bash

echo "🔧 Safe Migration Script for MySQL Key Length Issues"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan file not found. Please run this script from your Laravel project root."
    exit 1
fi

echo "📋 Current migration status:"
php artisan migrate:status

echo ""
echo "🔄 Running migrations with optimized column lengths:"
php artisan migrate --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All migrations completed successfully!"
    echo ""
    echo "📊 Final migration status:"
    php artisan migrate:status
else
    echo ""
    echo "❌ Some migrations failed. Checking status:"
    php artisan migrate:status
    echo ""
    echo "🔍 To debug specific migrations, run:"
    echo "   php artisan migrate:status --pending"
fi
