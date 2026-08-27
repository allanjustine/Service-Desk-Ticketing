<?php

namespace App\Models;

use Database\Factories\TicketFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $requester_name
 * @property string $branch_name
 * @property string $branch_code
 * @property string $concern
 * @property string $concern_description
 * @property string $anydesk_id
 * @property string $status
 * @property string|null $resolution_notes
 */
#[Fillable([
    'requester_name',
    'branch_name',
    'branch_code',
    'concern',
    'concern_description',
    'anydesk_id',
    'status',
    'resolution_notes',
])]
class Ticket extends Model
{
    /** @use HasFactory<TicketFactory> */
    use HasFactory, HasUuids;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
