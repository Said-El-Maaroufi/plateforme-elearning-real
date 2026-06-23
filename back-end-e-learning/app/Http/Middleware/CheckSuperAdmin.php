<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if($request->user() && $request->user()->isSuperAdmin()){
            return $next($request);
            }
            return response()->json(['message' => "vous n'avez pas le droit"]);
    }
}
