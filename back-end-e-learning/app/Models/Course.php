<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    //

    protected $fillable = ['title', 'image', 'description'];

    public function users(): BelongsToMany{
        return $this->belongsToMany(User::class);
    }

    public function videos(): HasMany{
        return $this->hasMany(Video::class)->orderBy('order', 'asc');
    }

}
