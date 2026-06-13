<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    //

    protected $fillable = ['title', 'image', 'videos', 'description'];

    public function users(){
        return $this->belongsToMany(User::class);
    }

    public function videos(){
        return $this->hasMany(Video::class);
    }

}
