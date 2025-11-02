<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Helpers\CertificateLogoHelper;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all certificate templates
        $templates = DB::table('certificate_templates')->get();

        foreach ($templates as $template) {
            $contentHtml = $template->content_html;

            // Check if logo is already present to avoid duplicate additions
            if (str_contains($contentHtml, 'School Logo') || str_contains($contentHtml, '/image/logo.jpg')) {
                \Log::info("Logo already exists in certificate template ID: {$template->id}");
                continue;
            }

            // Get the centered logo HTML
            $logoHtml = CertificateLogoHelper::getCenteredLogoHtml(80, 80, 20);

            // Prepend logo to the content
            $updatedContent = $logoHtml . $contentHtml;

            // Update the template
            DB::table('certificate_templates')
                ->where('id', $template->id)
                ->update([
                    'content_html' => $updatedContent,
                    'updated_at' => now(),
                ]);

            \Log::info("Added logo to certificate template ID: {$template->id}");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get all certificate templates
        $templates = DB::table('certificate_templates')->get();

        foreach ($templates as $template) {
            $contentHtml = $template->content_html;

            // Remove the logo div if it exists at the beginning
            // Pattern: <div style="text-align: center; margin-bottom: XXpx;">...</div> containing School Logo
            $pattern = '/<div style="text-align: center; margin-bottom: \d+px;">.*?School Logo.*?<\/div>/s';
            $updatedContent = preg_replace($pattern, '', $contentHtml, 1);

            // Only update if content changed
            if ($updatedContent !== $contentHtml) {
                DB::table('certificate_templates')
                    ->where('id', $template->id)
                    ->update([
                        'content_html' => $updatedContent,
                        'updated_at' => now(),
                    ]);

                \Log::info("Removed logo from certificate template ID: {$template->id}");
            }
        }
    }
};
