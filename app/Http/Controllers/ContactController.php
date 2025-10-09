<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $contacts = Contact::where('user_id', Auth::id())
            ->where(function ($q) use ($request) {
                if ($search = $request->get('search')) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('mobile', 'like', "%{$search}%");
                }
            })
            ->orderBy('created_at', 'DESC')
            ->paginate(10);

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => ['nullable', 'string', 'max:255'],
            'email'  => ['required', 'email', 'max:255', Rule::unique('contacts', 'email')->where(fn($q) => $q->where('user_id', 1))],
            'mobile' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
        ]);
        $validated['user_id'] = Auth::id();
        Contact::create($validated);

        return redirect()->route('contacts.index')->with('success', 'Contact created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $contact = Contact::where('user_id', 1)->findOrFail($id);

        $validated = $request->validate([
            'name'   => ['nullable', 'string', 'max:255'],
            'email'  => ['required', 'email', 'max:255', Rule::unique('contacts', 'email')->ignore($contact->id)->where(fn($q) => $q->where('user_id', 1))],
            'mobile' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
        ]);
        $validated['user_id'] = Auth::id();
        $contact->update($validated);

        return redirect()->route('contacts.index')->with('success', 'Contact updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::where('user_id', 1)->findOrFail($id);
        $contact->delete();

        return redirect()->route('contacts.index')->with('success', 'Contact deleted successfully.');
    }
}
