<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Video;
use FFMpeg\FFMpeg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    // _______________________________________________________________________________________________
                                            // AJOUTER
    // CREATION des courses
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

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('images', 'public');
        }


        $course = Course::create($validated);

        $files = $validated['videos'];


        foreach ($files as $key => $file) {

            $path = $file->store('videos', 'public');
            $absolutePath = storage_path('app/public/' . $path);
            // On pointe vers le dossier "ffmpeg" que tu viens de créer à la racine du projet
            $ffmpegPath = base_path('ffmpeg/ffmpeg.exe');
            $ffprobePath = base_path('ffmpeg/ffprobe.exe');

            // On initialise FFmpeg avec ces chemins locaux
            $ffmpeg = FFmpeg::create([
            'ffmpeg.binaries'  => $ffmpegPath,
            'ffprobe.binaries' => $ffprobePath,
            ]);
            $videoTrack = $ffmpeg->open($absolutePath);
            $durationInSeconds = $videoTrack->getFormat()->get('duration');
            Video::create([
                'title' => $file->getClientOriginalName(),
                // getClientOriginalName                ()
                'file' => $path,
                'course_id' => $course->id,
                'duree_en_seconde' => round($durationInSeconds),
                'order' => $key + 1

            ]);
        }

        return response()->json(['message' => 'le cours a ete bien ajouter'], 201);
    }
    // ____________________________________________________________________________________________________________________
                                            // INDEX
    // Affichage des courses
    public function index()
    {
        $courses = Course::all();
        return response()->json($courses);
    }

    // ____________________________________________________________________________________________________________________
                                                // SHOW
    // affichage unifier
    public function show($id)
    {
        $course = Course::withSum('videos', 'duree_en_seconde')->findOrFail($id);
        $nbr_videos = $course->videos()->count();
        $nbr_participants = $course->users()->count();
        return response()->json(['course' => $course, "nbr_videos" => $nbr_videos, "nbr_participants" => $nbr_participants]);
    }
    // ____________________________________________________________________________________________________________________
                                            // SHOWEDIT
    public function showEdit($id){
        $course = Course::findOrFail($id);
        $course_videos = $course->videos;
        return response()->json(['course' => $course, 'course_videos' => $course_videos]);
    } 

    // ____________________________________________________________________________________________________________________
                                            // EDIT

    // modification
    public function edit(Request $request, $id)
    {
        $course = Course::findOrFail($id);


        $validated = $request->validate(
            [
                // validation de cour
                'title' => 'required|string',
                'description' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

                // validation de videos
                'videos' => 'required|array|min:1',
                'videos.*' => [
                    // verification est passage des fichiers retournees
                    function ($attribute, $value, $fail) {
            // 1. CAS DU FICHIER : Si c'est un fichier uploadé
            if (request()->hasFile($attribute)) {
                $file = request()->file($attribute);
                $allowedMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
                
                if (!in_array($file->getMimeType(), $allowedMimes)) {
                    return $fail("Le fichier doit être une vidéo au format mp4, mov ou avi.");
                }
                if ($file->getSize() > 20480 * 1024) {
                    return $fail("La vidéo ne doit pas dépasser 20 Mo.");
                }
            } 
            // 2. CAS DE L'URL (STRING) : Si c'est du texte
            else if (is_string($value)) {
                
                // On vérifie strictement que cette URL existe déjà dans ta table 'videos'
                $exists = DB::table('videos')->where('file', $value)->exists();
                
                if (!$exists) {
                    return $fail("Cette URL de vidéo n'existe pas dans notre base de données.");
                }
            } 
            // 3. CAS DANGEREUX : Ce n'est ni l'un ni l'autre
            else {
                return $fail("Le format envoyé est invalide.");
            }
        }
                ],
                
            ]

        );

        // suppression de l'image

        if ($request->hasFile('image')) {

            if ($course->image && Storage::disk('public')->exists($course->image)) {
                Storage::disk('public')->delete($course->image);
            }

            $validated['image'] = $request->file('image')->store('images', 'public');
        } else {
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
        $string_files = array_filter($files, function ($file) {
            return is_string($file);
        });

        foreach ($an_videos as $an_video) {
            // supprimer les fichiers videos 
            if (!in_array($an_video->file, $string_files)) {
                if (Storage::disk('public')->exists($an_video->file)) {
                    Storage::disk('public')->delete($an_video->file);
                }
                //supprimer la ligne dans la table videos
                $an_video->delete();
            }
        }



        foreach ($files as $key => $file) {
            // verifier s'il y'a des ancinnes videos pour ne pas le r'ajouter autre fois 
            if (is_string($file)) {
                // modifier l'ordre pour les anciennes videos
                Video::where('course_id', $course->id)
                    ->where('file', $file)
                    ->update(['order' => $key + 1]);
            } else {

                // enregistrer les vouveaux videos
                if ($request->hasFile("videos.$key")) {
                    $fileUploaded = $request->file("videos.$key");

                    $path = $fileUploaded->store('videos', 'public');
                    $absolutePath = storage_path('app/public/' . $path);
                    $ffmpegPath = base_path('ffmpeg/ffmpeg.exe');
                    $ffprobePath = base_path('ffmpeg/ffprobe.exe');

            // On initialise FFmpeg avec ces chemins locaux
            $ffmpeg = FFmpeg::create([
            'ffmpeg.binaries'  => $ffmpegPath,
            'ffprobe.binaries' => $ffprobePath,
            ]);
            $videoTrack = $ffmpeg->open($absolutePath);
            $durationInSeconds = $videoTrack->getFormat()->get('duration');
                    $videoTrack = $ffmpeg->open($absolutePath);
                    $durationInSeconds = $videoTrack->getFormat()->get('duration');
                    Video::create([
                        'title' => $fileUploaded->getClientOriginalName(),
                        'file' => $path,
                        'course_id' => $course->id,
                        'duree_en_seconde' => round($durationInSeconds),
                        'order' => $key + 1

                    ]);
                }
            }
        }


        return response()->json(['message' => 'le cours a ete bien modifier'], 200);
    }

    // ____________________________________________________________________________________________________________________
                                                // DELETE
    // supprimer un video
    public function delete($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        return response()->json(["message" => "le cour a ete supprimer avec succes"]);
    }


    public function getCourseWithVideos($id) {
    // On récupère le cours par son ID avec ses vidéos associées
    // (Remplace 'videos' par le nom de ta relation dans le modèle Course)
    $course = Course::with('videos')->find($id);

    if (!$course) {
        return response()->json(['message' => 'Cours non trouvé'], 404);
    }

    return response()->json($course);
}

  public function courses(){
    // Le "with('students')" charge automatiquement les utilisateurs inscrits à ce cours
    $courses = Course::all();
    return response()->json($courses);
}
}
