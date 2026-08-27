<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignIdFor(User::class)->nullable()->constrained()->nullOnDelete();
            $table->string('requester_name');
            $table->string('branch_name');
            $table->string('branch_code');
            $table->string('concern');
            $table->text('concern_description');
            $table->string('anydesk_id');
            $table->string('status')->default('pending')->index();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
