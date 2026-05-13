<?php

namespace Padosoft\AiActComplianceAdmin;

use Illuminate\Support\ServiceProvider;

class AiActComplianceAdminServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/../dist' => public_path('vendor/ai-act-compliance-admin'),
        ], 'ai-act-compliance-admin-assets');

        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ai-act-compliance-admin');
    }
}
