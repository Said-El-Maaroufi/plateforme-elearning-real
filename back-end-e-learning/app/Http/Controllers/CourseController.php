<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Video;
use Illuminate\Http\Request;

class CourseController extends Controller
{


    public function ajouter(Request $request)
    {

        $validated = $request->validate([
            // validation de cour
            'title' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

            // validation de video
            'videos' => 'required|array|min:1',
            'videos.*' => 'file|mimes:mp4,mov,avi|max:20480',
        ]);

        if($request->hasFile('image')){
            $validated['image'] = $request->file('image')->store('images', 'public');
        }        


        $course = Course::create($validated);

        $files = $validated['videos'];

        foreach ($files as $key => $file) {

            $path = $file->store('videos', 'public');
            Video::create([
                'title' => $file->getClientOriginalName(),
                // getClientOriginalName()
                'file' => $path,
                'course_id' => $course->id,
                'duree_en_seconde' => 0,
                'order' => $key + 1

            ]);
        }

        return response()->json(['message' => 'le cours a ete bien ajouter'], 201);
    }

    public function index() {
        $courses = Course::all();

        return response()->json(['courses' => $courses]);

    }
}


