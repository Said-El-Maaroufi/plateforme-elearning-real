<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    //

    public function courses(){
    $courses = Course::all();

    return response()->json(['courses' => $courses], 201);

    
    }


    public function users(){
        $users = User::all();
        return response()->json($users, 200);
    }

    public function show($id){
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    


    public function login(Request $request){
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt($credentials, $remember)) {
            return response()->json(['message' => "l'identifiants est incorrect"], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([$token], 200);

    }

    public function logout(Request $request){
        $request->user()->tokens()->delete();
        return response()->json(['message', 'deconnecter']);

    }

    //POST api/register
    public function register(Request $request){


        $validate = $request->validate([
            'name' => 'required|string|min:3',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed'
            ]);

            $validate['password'] = bcrypt($validate['password']);
            
            $user = User::create($validate);
            $token = $user->createToken("auth_token")->plainTextToken;
            // $token = $user->createToken("auth_token")->plainTextToken;

            
        //connecte automatique sans verifier le password

        return response()->json(
            [$token]
        , 201);

        
        
        


    }

}
