<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'], // Condition de vérification
            [
                'name' => 'Admin',
                'password' => Hash::make('Admin1234'), // Change ce mot de passe
                'role' => 'admin', // Si tu as une colonne role dans ta table users
            ]
        );

            
    }
}
