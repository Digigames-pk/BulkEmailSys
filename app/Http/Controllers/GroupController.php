<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Group;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $groups = Group::where('user_id', Auth::id())
            ->withCount('contacts')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Groups/Index', [
            'groups' => $groups
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $contacts = Contact::where('user_id', Auth::id())
            ->select('id', 'name', 'email', 'mobile', 'gender')
            ->orderBy('name')
            ->get();

        return Inertia::render('Groups/Create', [
            'contacts' => $contacts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'contact_ids' => 'nullable|array',
            'contact_ids.*' => 'exists:contacts,id'
        ]);

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? '#3B82F6',
            'user_id' => Auth::id(),
        ]);

        // Add contacts to the group if provided
        if ($request->has('contact_ids') && is_array($request->contact_ids)) {


            // Ensure all contacts belong to the authenticated user
            $validContactIds = Contact::where('user_id', Auth::id())
                ->whereIn('id', $request->contact_ids)
                ->pluck('id')
                ->toArray();



            if (!empty($validContactIds)) {
                $group->contacts()->attach($validContactIds);
            }
        }

        return redirect()->route('groups.index')
            ->with('success', 'Group created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Group $group)
    {
        // Ensure user can only view their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->load(['contacts' => function ($query) {
            $query->orderBy('name');
        }]);

        return Inertia::render('Groups/Show', [
            'group' => $group
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Group $group)
    {
        // Ensure user can only edit their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $contacts = Contact::where('user_id', Auth::id())
            ->select('id', 'name', 'email', 'mobile', 'gender')
            ->orderBy('name')
            ->get();

        // Load the group's contacts relationship
        $group->load('contacts');

        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'contacts' => $contacts
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Group $group)
    {


        // Ensure user can only update their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'contact_ids' => 'nullable|array',
        ]);
        dd($request->all());
        $group->update([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? $group->color,
        ]);

        // Update contacts if provided
        if ($request->has('contact_ids') && is_array($request->contact_ids)) {

            // Ensure all contacts belong to the authenticated user
            $validContactIds = Contact::where('user_id', Auth::id())
                ->whereIn('id', $request->contact_ids)
                ->pluck('id')
                ->toArray();



            if (!empty($validContactIds)) {
                $group->contacts()->sync($validContactIds);
            }
        }

        return redirect()->route('groups.index')
            ->with('success', 'Group updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        // Ensure user can only delete their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->delete();

        return redirect()->route('groups.index')
            ->with('success', 'Group deleted successfully.');
    }

    /**
     * Add contacts to a group.
     */
    public function addContacts(Request $request, Group $group)
    {
        // Ensure user can only update their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'contact_ids' => 'required|array',
            'contact_ids.*' => 'exists:contacts,id'
        ]);

        $group->contacts()->syncWithoutDetaching($request->contact_ids);

        return back()->with('success', 'Contacts added to group successfully.');
    }

    /**
     * Remove contacts from a group.
     */
    public function removeContacts(Request $request, Group $group)
    {
        // Ensure user can only update their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'contact_ids' => 'required|array',
            'contact_ids.*' => 'exists:contacts,id'
        ]);

        $group->contacts()->detach($request->contact_ids);

        return back()->with('success', 'Contacts removed from group successfully.');
    }

    /**
     * Get contacts not in the group for selection.
     */
    public function getAvailableContacts(Group $group)
    {
        // Ensure user can only view their own groups
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $perPage = 10;
        $page = request('page', 1);

        $availableContacts = Contact::where('user_id', Auth::id())
            ->select('id', 'name', 'email', 'mobile', 'gender')
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $availableContacts->items(),
            'current_page' => $availableContacts->currentPage(),
            'last_page' => $availableContacts->lastPage(),
            'per_page' => $availableContacts->perPage(),
            'total' => $availableContacts->total(),
            'has_more' => $availableContacts->hasMorePages(),
        ]);
    }

    /**
     * Get all contacts for selection (for create/edit forms).
     */
    public function getAllContacts()
    {
        $perPage = 10;
        $page = request('page', 1);

        $contacts = Contact::where('user_id', Auth::id())
            ->select('id', 'name', 'email', 'mobile', 'gender')
            ->orderBy('name');

        return response()->json([
            'data' => $contacts->items(),
            'current_page' => $contacts->currentPage(),
            'last_page' => $contacts->lastPage(),
            'per_page' => $contacts->perPage(),
            'total' => $contacts->total(),
            'has_more' => $contacts->hasMorePages(),
        ]);
    }
}
