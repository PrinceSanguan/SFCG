<?php

namespace App\Providers;

use App\Models\HonorResult;
use App\Services\CertificateGenerationService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class CertificateServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Listen for honor result creation and automatically generate certificates
        HonorResult::created(function (HonorResult $honorResult) {
            $this->generateCertificateForHonorResult($honorResult);
        });

        // Listen for honor result updates (in case GPA changes and affects honor qualification)
        HonorResult::updated(function (HonorResult $honorResult) {
            $this->generateCertificateForHonorResult($honorResult);
        });
    }

    /**
     * Generate certificate for a newly created or updated honor result
     */
    private function generateCertificateForHonorResult(HonorResult $honorResult): void
    {
        try {
            $service = app(CertificateGenerationService::class);
            $certificate = $service->generateHonorCertificate($honorResult);
            
            if ($certificate) {
                Log::info("Certificate automatically generated for honor result {$honorResult->id}: {$certificate->serial_number}");
            } else {
                Log::warning("Failed to automatically generate certificate for honor result {$honorResult->id}");
            }
        } catch (\Exception $e) {
            Log::error("Error in automatic certificate generation for honor result {$honorResult->id}: " . $e->getMessage());
        }
    }
}

