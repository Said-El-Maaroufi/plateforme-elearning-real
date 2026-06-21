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
        $users = User::where('role', '!=', 'admin')->get();
        return response()->json(['users' => $users]);
    }

    public function getAccee($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Récupérer tous les cours pour alimenter la liste déroulante (select)
        $courses = Course::all(['id', 'title']);

        return response()->json([
            'user' => $user,
            'courses' => $courses
        ], 200);
    }

    public function updateAccee(Request $request)
{
    $request->validate([
        'user_id'   => 'required|exists:users,id',
        'course_id' => 'required|exists:courses,id',
        'action'    => 'required|in:donner,retirer'
    ]);

    $user = User::findOrFail($request->user_id);
    $courseId = $request->course_id;

    // Vérifier si l'utilisateur est déjà inscrit à ce cours
    $hasAccess = $user->courses()->where('course_id', $courseId)->exists();

    if ($request->action === 'donner') {
        if ($hasAccess) {
            return response()->json(['message' => 'Cet utilisateur possède déjà l\'accès à ce cours.'], 400);
        }
        
        // Crée la ligne dans la table pivot
        $user->courses()->attach($courseId);
        return response()->json(['message' => 'Accès accordé avec succès !']);
    }

    if ($request->action === 'retirer') {
        if (!$hasAccess) {
            return response()->json(['message' => 'Cet utilisateur n\'a pas accès à ce cours.'], 400);
        }

        // Supprime la ligne dans la table pivot
        $user->courses()->detach($courseId);
        return response()->json(['message' => 'Accès retiré avec succès !']);
    }
}



    /**
     * Show the form for creating a new resource.
     */


    /**
     * Store a newly created resource in storage.
     */


    //POST api/login
    public function login(Request $request)
    {
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
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message', 'deconnecter']);
    }

    //POST api/register
    public function register(Request $request)
    {


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
            "token" => $token
        ], 201);
    }

    public function show($id)
    {

        $user = User::with('courses')->find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json([
            'user' => $user,
            'courses' => $user->courses // Liste des cours où l'utilisateur est inscrit
        ], 200);
    }

    /**
     * Display the specified resource.
     */


    /**
     * Show the form for editing the specified resource.
     */
}
