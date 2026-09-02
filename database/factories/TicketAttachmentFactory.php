<?php

namespace Database\Factories;

use App\Models\TicketAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketAttachment>
 */
class TicketAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'original_name' => fake()->word().'.png',
            'file_name' => 'ticket-attachments/'.fake()->uuid().'.png',
            'mime_type' => 'image/png',
            'size' => 1024,
        ];
    }
}
