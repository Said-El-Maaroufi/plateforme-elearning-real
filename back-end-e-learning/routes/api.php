<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\userController;
use App\Http\Middleware\CheckSuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/user', function () {
    return Auth::user();
})->middleware('auth:sanctum');





// courses crud
Route::middleware(['auth:sanctum', 'admin'])->group(function(){

    Route::post('/ajouter', [CourseController::class, 'ajouter']);
    Route::get('/index', [CourseController::class, 'index']);
    Route::get('/course/{id}', [CourseController::class, 'show']);
    Route::get('/course/{id}/edit', [CourseController::class, 'showEdit']);
    Route::delete('/course/{id}', [CourseController::class, 'delete']);
    Route::put('/course/{id}/edit', [CourseController::class, 'edit']);
    Route::get('/users', [userController::class, 'index']);
    Route::get('/user/{id}', [userController::class, 'show']);
    Route::get('/accee/{id}', [userController::class, 'getAccee']);
    Route::post('/accee/update', [userController::class, 'updateAccee']);
    
    });

// Routes publiques — pas de token nécessaire 
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login',    [AuthController::class, 'login']);





// Routes protégées — token obligatoire

Route::middleware("auth:sanctum")->group(function(){

    Route::get('/courses', [CourseController::class, 'courses']);
    Route::get('/cour/{courseId}', [CourseController::class, 'showCourseWorkspace']);
    });
    

    // reserver au super admin

Route::middleware(['auth:sanctum','super_admin'])->group(function () {
    // Toutes les routes ici sont ultra-sécurisées
    Route::post('/superadmin/prof', [userController::class, 'createProf']);
    Route::delete('/superadmin/prof/{id}', [userController::class, 'deleteProf']);
    Route::get('/superadmin/profs', [UserController::class, 'getProfs']);
    Route::get('/superadmin/prof/{id}', [UserController::class, 'getProf']);
    // Route::get('/superadmin/global-stats', [DashboardController::class, 'globalStats']);

});





