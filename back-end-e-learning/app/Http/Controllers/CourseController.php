<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
   

    public function ajouter(Request $request){

        $validatedCourse = $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $validatedVideo = $request->validate([
            'videos' => 'required|array|min:1',
            'course_id' => 'exists:courses,id',
            'videos.*' => 'file|mimes:mp4,mov,avi|max:20480',
        ]);

        $files = $validatedVideo['videos.*'];

        

        

       
        $course = Course::create($validatedCourse);





        
    }

  
    
}
