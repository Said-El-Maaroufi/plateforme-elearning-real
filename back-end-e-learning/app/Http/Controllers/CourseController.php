<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CourseController extends Controller
{
   

    public function ajouter(Request $request){

        $validated = $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'videos' => 'required|array|min:1',
            'videos.*' => 'file|mimes:mp4,mov,avi|max:20480'
        ]);


        return response()->json(['message' => $validated]);
    }

  
    
}
