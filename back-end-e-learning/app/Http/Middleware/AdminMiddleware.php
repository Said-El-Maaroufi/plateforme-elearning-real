<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
   public function handle(Request $request, Closure $next): Response
    {
        // 1. On vérifie si l'utilisateur est connecté et si son rôle est bien admin
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request);
        }

        // 2. Si ce n'est pas un admin, on renvoie une erreur 403 (Interdit) au format JSON pour React
        return response()->json([
            'message' => 'Accès refusé. Vous devez être administrateur.'
        ], 403);
    }
}
