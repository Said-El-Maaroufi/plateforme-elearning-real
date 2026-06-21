<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Error;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Illuminate\Support\Facades\Auth as SupportFacadesAuth;

use function Laravel\Prompts\error;

class userController extends Controller
{
    /**
     * Display a listing of the resource.
     */



    public function index()
    {
        //
        $users = User::all();
        return response()->json(['users' => $users]);
    }

 

    /**
     * Show the form for creating a new resource.
     */
    

    /**
     * Store a newly created resource in storage.
     */
   

    //POST api/login
    public function login(Request $request){
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => "lidentifiants est incorrect"], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token, 'msg' => 'tu as ete bien connecter']);

      


    }

    //POST api/logout
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

        return response()->json([
            "msg" => "le compte a été creer avec succees",
            "token" =>$token
        ], 201);

        
        
        


    }

    /**
     * Display the specified resource.
     */


    /**
     * Show the form for editing the specified resource.
     */
}
