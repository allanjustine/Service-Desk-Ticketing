<?php

namespace Database\Factories;

use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Ticket> */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'ticket_code' => fake()->unique()->regexify('SMCT-[A-Z0-9]{8}'),
            'requester_name' => fake()->name(),
            'branch_name' => fake()->company(),
            'branch_code' => fake()->numerify('BR-###'),
            'concern' => 'Computer / Laptop',
            'concern_description' => fake()->sentence(),
            'anydesk_id' => fake()->numerify('#########'),
            'status' => 'pending',
            'urgent' => false,
            'resolution_notes' => null,
        ];
    }
}
