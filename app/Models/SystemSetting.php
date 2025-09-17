<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value, ?string $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'description' => $description,
            ]
        );
    }

    /**
     * Check if maintenance mode is enabled.
     */
    public static function isMaintenanceMode(): bool
    {
        return static::get('maintenance_mode', 'false') === 'true';
    }

    /**
     * Enable maintenance mode.
     */
    public static function enableMaintenanceMode()
    {
        return static::set('maintenance_mode', 'true', 'System maintenance mode - when enabled, blocks all user logins');
    }

    /**
     * Disable maintenance mode.
     */
    public static function disableMaintenanceMode()
    {
        return static::set('maintenance_mode', 'false', 'System maintenance mode - when enabled, blocks all user logins');
    }

    /**
     * Toggle maintenance mode.
     */
    public static function toggleMaintenanceMode(): bool
    {
        $currentState = static::isMaintenanceMode();
        
        if ($currentState) {
            static::disableMaintenanceMode();
            return false; // Now disabled
        } else {
            static::enableMaintenanceMode();
            return true; // Now enabled
        }
    }
}