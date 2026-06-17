<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{

// CREATION
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

    // Affichage
    public function index() {
        $courses = Course::all();
        return response()->json($courses);

    }

// affichage unifier
    public function show($id){
        $course = Course::findOrFail($id);
        $course_videos = $course->videos()->get();
        return response()->json(['course' => $course, 'course_videos' => $course_videos]);
    }


    // modification
    public function edit(Request $request, $id){
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            // validation de cour
            'title' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

            // validation de videos
            'videos' => 'required|array',
            'videos.*' => 'nullable',
        ]);

        // suppression de l'image

        if($request->hasFile('image')){

        if($course->image && Storage::disk('public')->exists($course->image)){
            Storage::disk('public')->delete($course->image);
        }
            
        $validated['image'] = $request->file('image')->store('images', 'public');

        }else{
            $validated['image'] = $course->image;
        } 

        // le mise a jour du cour 
        
        $course->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image' => $validated['image']
        ]);


       
            
        // recuperation des fichiers videos
        $files = $request->all()['videos'] ?? [];
        $an_videos = $course->videos;

        // filtrer les fichiers string
        $string_files = array_filter($files, function($file){
            return is_string($file);
        });

        foreach ($an_videos as $an_video) {
            // supprimer les fichiers videos 
            if(!in_array($an_video->file, $string_files)){
                if(Storage::disk('public')->exists($an_video->file)){
                    Storage::disk('public')->delete($an_video->file);
                }
                //supprimer la ligne dans la table videos
                $an_video->delete();
            }
        }
        


        foreach ($files as $key => $file) {
            if(is_string($file)){
                    
                    continue;
                    
                
            }else{

            // modifier l'ordre
                Video::where('course_id', $course->id)
                ->where('file', $file)
                ->update(['order' => $key + 1]);

                if($request->hasFile("videos.$key")){
                $fileUploaded = $request->file("videos.$key");
                
                $path = $fileUploaded->store('videos', 'public');
                Video::create([
                    'title' => $fileUploaded->getClientOriginalName(),
                    'file' => $path,
                    'course_id' => $course->id,
                    'duree_en_seconde' => 0,
                    'order' => $key + 1
                    
                    ]);
                    }
                    }
        }
        
        
        return response()->json(['message' => 'le cours a ete bien modifier'], 200);
        }
    }



