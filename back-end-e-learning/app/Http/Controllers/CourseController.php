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
        'title' => 'required|string',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        'videos' => 'nullable|array',
        'videos.*' => 'file|mimes:mp4,mov,avi|max:512000',
    ]);

    // Update de l'image si fournie
    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')->store('images', 'public');
        $course->image = $validated['image'];
    }

    $course->title = $validated['title'];
    $course->description = $validated['description'] ?? null;
    $course->save();

    // Détection OS pour les binaire FFmpeg (Linux dans Docker/Render vs Windows en Local)
    $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    $ffmpegPath = $isWindows ? base_path('ffmpeg/ffmpeg.exe') : '/usr/bin/ffmpeg';
    $ffprobePath = $isWindows ? base_path('ffmpeg/ffprobe.exe') : '/usr/bin/ffprobe';

    // Ajout de nouvelles vidéos si transmises
    if ($request->hasFile('videos')) {
        // On récupère le dernier ordre pour continuer la séquence
        $lastOrder = $course->videos()->max('order') ?? 0;

        foreach ($request->file('videos') as $key => $file) {
            $path = $file->store('videos', 'public');
            $absolutePath = storage_path('app/public/' . $path);

            try {
                $ffmpeg = \FFMpeg\FFMpeg::create([
                    'ffmpeg.binaries'  => $ffmpegPath,
                    'ffprobe.binaries' => $ffprobePath,
                    'timeout'          => 3600,
                ]);

                $videoTrack = $ffmpeg->open($absolutePath);
                $durationInSeconds = $videoTrack->getFormat()->get('duration');
                $duree = round($durationInSeconds);
            } catch (\Exception $e) {
                $duree = 0;
            }

            Video::create([
                'title' => $file->getClientOriginalName(),
                'file' => $path,
                'course_id' => $course->id,
                'duree_en_seconde' => $duree,
                'order' => $lastOrder + $key + 1
            ]);
        }
    }

    return response()->json([
        'message' => 'Le cours a été mis à jour avec succès',
        'course' => $course->load('videos')
    ], 200);
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
