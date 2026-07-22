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
    public function ajouter(Request $request){

    $validated = $request->validate([
        'title' => 'required|string',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'videos' => 'required|array|min:1',
        'videos.*' => 'file|mimes:mp4,mov,avi|max:512000',
    ]);

    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')->store('images', 'public');
    }

    $course = Course::create([
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'image' => $validated['image'] ?? null,
    ]);

    $files = $validated['videos'];

    // Detection automatique OS (Linux pour Render vs Windows pour Local)
    $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    $ffmpegPath = $isWindows ? base_path('ffmpeg/ffmpeg.exe') : '/usr/bin/ffmpeg';
    $ffprobePath = $isWindows ? base_path('ffmpeg/ffprobe.exe') : '/usr/bin/ffprobe';

    foreach ($files as $key => $file) {
        $path = $file->store('videos', 'public');
        $absolutePath = storage_path('app/public/' . $path);

        try {
            $ffmpeg = FFmpeg::create([
                'ffmpeg.binaries'  => $ffmpegPath,
                'ffprobe.binaries' => $ffprobePath,
                'timeout'          => 3600, // Augmenter le timeout pour les gros fichiers
            ]);

            $videoTrack = $ffmpeg->open($absolutePath);
            $durationInSeconds = $videoTrack->getFormat()->get('duration');
            $duree = round($durationInSeconds);
        } catch (\Exception $e) {
            // En cas de problème de lecture de durée avec FFmpeg, on met une valeur par défaut pour ne pas bloquer l'upload
            $duree = 0;
        }

        Video::create([
            'title' => $file->getClientOriginalName(),
            'file' => $path,
            'course_id' => $course->id,
            'duree_en_seconde' => $duree,
            'order' => $key + 1
        ]);
    }

    return response()->json(['message' => 'Le cours a été bien ajouté'], 201);
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

    $validated = $request->validate([
        // Validation du cours
        'title' => 'required|string',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

        // Validation des vidéos
        'videos' => 'required|array|min:1',
        'videos.*' => [
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
                // 2. CAS DE L'URL (STRING) : Si c'est une chaîne de texte
                else if (is_string($value)) {
                    $exists = DB::table('videos')->where('file', $value)->exists();
                    
                    if (!$exists) {
                        return $fail("Cette URL de vidéo n'existe pas dans notre base de données.");
                    }
                } 
                // 3. CAS INVALIDE
                else {
                    return $fail("Le format envoyé est invalide.");
                }
            }
        ],
    ]);

    // Remplacement de l'image de couverture si un nouveau fichier est fourni
    if ($request->hasFile('image')) {
        if ($course->image && Storage::disk('public')->exists($course->image)) {
            Storage::disk('public')->delete($course->image);
        }
        $validated['image'] = $request->file('image')->store('images', 'public');
    } else {
        $validated['image'] = $course->image;
    }

    // Mise à jour du cours
    $course->update([
        'title' => $validated['title'],
        'description' => $validated['description'],
        'image' => $validated['image']
    ]);

    // Récupération des fichiers vidéos envoyés
    $files = $request->input('videos', []);
    $an_videos = $course->videos;

    // Filtrer les chaînes de caractères (anciennes vidéos conservées)
    $string_files = array_filter($files, function ($file) {
        return is_string($file);
    });

    // Supprimer physiquement et en BDD les vidéos retirées par l'utilisateur
    foreach ($an_videos as $an_video) {
        if (!in_array($an_video->file, $string_files)) {
            if (Storage::disk('public')->exists($an_video->file)) {
                Storage::disk('public')->delete($an_video->file);
            }
            $an_video->delete();
        }
    }

    // Traitement de l'ordre et enregistrement des nouvelles vidéos
    foreach ($files as $key => $file) {
        if (is_string($file)) {
            // Mettre à jour l'ordre des anciennes vidéos
            Video::where('course_id', $course->id)
                ->where('file', $file)
                ->update(['order' => $key + 1]);
        } else {
            // Traiter et enregistrer les nouveaux fichiers téléversés
            if ($request->hasFile("videos.$key")) {
                $fileUploaded = $request->file("videos.$key");

                $path = $fileUploaded->store('videos', 'public');
                $absolutePath = storage_path('app/public/' . $path);
                
                $ffmpegPath = base_path('ffmpeg/ffmpeg.exe');
                $ffprobePath = base_path('ffmpeg/ffprobe.exe');

                $durationInSeconds = 0;
                
                // Extraction de la durée via FFmpeg
                try {
                    $ffmpeg = FFmpeg::create([
                        'ffmpeg.binaries'  => $ffmpegPath,
                        'ffprobe.binaries' => $ffprobePath,
                    ]);
                    $videoTrack = $ffmpeg->open($absolutePath);
                    $durationInSeconds = $videoTrack->getFormat()->get('duration');
                } catch (\Exception $e) {
                    // Si FFmpeg échoue, la durée par défaut est 0 pour éviter de bloquer l'enregistrement
                    Log::error("FFmpeg error: " . $e->getMessage());
                }

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

    return response()->json(['message' => 'Le cours a été bien modifié'], 200);
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


   public function showCourseWorkspace($courseId)
{
    $user = auth()->user(); // 🔥 Récupère l'utilisateur connecté via le Token Sanctum

    // 1. Trouver le cours avec ses vidéos
    $course = Course::with('videos')->find($courseId);

    if (!$course) {
        return response()->json(['message' => 'Cours non trouvé.'], 404);
    }

    // 2. Sécurité : Si l'utilisateur n'est pas Admin, on vérifie s'il est inscrit à ce cours
    if ($user->role !== 'admin' && !$user->is_admin) {
        
        // Vérifie si l'ID du cours est présent dans la relation pivot de l'étudiant
        $hasAccess = $user->courses()->where('course_id', $courseId)->exists();

        if (!$hasAccess) {
            return response()->json([
                'message' => '🔒 Accès refusé. Vous n\'êtes pas inscrit à cette formation.'
            ], 403); // Code 403: Forbidden (Interdit)
        }
    }

    // 3. Si tout est OK (Admin ou inscrit), on renvoie les données
    return response()->json($course, 200);
}

  public function courses(){
    // Le "with('students')" charge automatiquement les utilisateurs inscrits à ce cours
    $courses = Course::all();
    return response()->json($courses);
}
}
