<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    // public function view(User $user, Course $course): bool
    // {
    //     // 1. Si c'est le Super Admin ou l'Enseignant qui a créé le cours, on autorise toujours !
    //     if ($user->role === 'super_admin' || $user->id === $course->teacher_id) {
    //         return true;
    //     }

    //     // 2. On vérifie si l'étudiant est inscrit (existe dans la table pivot)
    //     // et on retourne TRUE s'il y est, FALSE s'il n'y est pas.
    //     return $course->students()->where('user_id', $user->id)->exists();
    // }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return false;
    }
}
