<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    //
    protected $fillable = ['title', 'file', 'course_id', 'duree_en_seconde', 'order' ];

    public function course(): BelongsTo{
        return $this->belongsTo(Course::class);
    }
}
