<?php

namespace App\Helpers;

class CertificateLogoHelper
{
    /**
     * Get the base64-encoded logo for embedding in certificates
     *
     * @param int $width Logo width in pixels (default: 80)
     * @param int $height Logo height in pixels (default: 80)
     * @return string HTML img tag with base64-encoded logo
     */
    public static function getLogoHtml(int $width = 80, int $height = 80): string
    {
        $logoPath = public_path('image/logo.jpg');

        // Check if logo file exists
        if (!file_exists($logoPath)) {
            \Log::warning('Certificate logo not found at: ' . $logoPath);
            return '';
        }

        // Read the logo file and encode it to base64
        $logoData = file_get_contents($logoPath);
        $base64Logo = base64_encode($logoData);

        // Determine MIME type
        $mimeType = mime_content_type($logoPath) ?: 'image/jpeg';

        // Return HTML img tag with inline base64 data
        return sprintf(
            '<img src="data:%s;base64,%s" style="width: %dpx; height: %dpx; object-fit: cover; border-radius: 50%%;" alt="School Logo" />',
            $mimeType,
            $base64Logo,
            $width,
            $height
        );
    }

    /**
     * Get centered logo HTML for certificate letterhead
     *
     * @param int $width Logo width in pixels (default: 80)
     * @param int $height Logo height in pixels (default: 80)
     * @param int $marginBottom Margin bottom in pixels (default: 20)
     * @return string HTML div with centered logo
     */
    public static function getCenteredLogoHtml(int $width = 80, int $height = 80, int $marginBottom = 20): string
    {
        $logoImg = self::getLogoHtml($width, $height);

        if (empty($logoImg)) {
            return '';
        }

        return sprintf(
            '<div style="text-align: center; margin-bottom: %dpx;">%s</div>',
            $marginBottom,
            $logoImg
        );
    }

    /**
     * Get the raw base64-encoded logo data
     *
     * @return string Base64-encoded logo data
     */
    public static function getBase64Logo(): string
    {
        $logoPath = public_path('image/logo.jpg');

        if (!file_exists($logoPath)) {
            \Log::warning('Certificate logo not found at: ' . $logoPath);
            return '';
        }

        $logoData = file_get_contents($logoPath);
        return base64_encode($logoData);
    }
}
