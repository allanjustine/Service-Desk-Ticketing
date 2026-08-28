<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'requester_name' => ['required', 'string', 'max:255'],
            'branch_name' => ['required', 'string', 'max:255'],
            'branch_code' => ['required', 'string', 'max:30'],
            'concern' => ['required', 'string', Rule::in([
                'Computer / Laptop',
                'Printer',
                'Internet / Network',
                'Email / Account',
                'Others',
            ])],
            'concern_description' => ['required', 'string', 'min:10', 'max:5000'],
            'anydesk_id' => ['required', 'string', 'max:30', 'regex:/^[0-9]+$/'],
            'urgent' => ['required', 'boolean'],
        ];
    }
}
