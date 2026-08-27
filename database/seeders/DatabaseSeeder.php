<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'IT Admin',
            'email' => 'itadmin@gmail.com',
            'is_it' => true,
            'branch_name' => 'Head Office',
            'branch_code' => 'HO',
        ]);
    }
}
