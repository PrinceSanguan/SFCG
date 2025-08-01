<?php

namespace App\Http\Controllers;

use App\Models\GeneratedCertificate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CertificateImageController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = GeneratedCertificate::with(['student.studentProfile', 'certificateTemplate', 'academicPeriod']);

        // Filter based on user role
        if ($user->user_role === 'student') {
            $query->where('student_id', $user->id);
        } elseif ($user->user_role === 'admin') {
            // Admin can see all certificates
        } else {
            // Other roles can only see certificates they're involved with
            $query->where(function ($q) use ($user) {
                $q->where('generated_by', $user->id)
                  ->orWhere('uploaded_by', $user->id)
                  ->orWhere('approved_by', $user->id);
            });
        }

        // Apply filters
        if ($request->filled('upload_status')) {
            $query->where('upload_status', $request->upload_status);
        }

        if ($request->filled('certificate_type')) {
            $query->where('certificate_type', $request->certificate_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('certificate_number', 'like', "%{$search}%");
        }

        $certificates = $query->orderBy('created_at', 'desc')->paginate(20);

        // Get filter options
        $uploadStatuses = ['pending', 'uploaded', 'approved', 'rejected'];
        $certificateTypes = GeneratedCertificate::distinct('certificate_type')->pluck('certificate_type');
        $usageTypes = ['academic', 'employment', 'personal', 'other'];

        return Inertia::render('Certificates/ImageUploads', [
            'certificates' => $certificates,
            'uploadStatuses' => $uploadStatuses,
            'certificateTypes' => $certificateTypes,
            'usageTypes' => $usageTypes,
            'filters' => $request->only(['upload_status', 'certificate_type', 'search']),
            'userRole' => $user->user_role,
        ]);
    }

    public function upload(Request $request, GeneratedCertificate $certificate)
    {
        // Check if user can upload to this certificate
        $user = Auth::user();
        if ($user->user_role === 'student' && $certificate->student_id !== $user->id) {
            return back()->with('error', 'You can only upload certificates assigned to you.');
        }

        if (!$certificate->canBeUploaded()) {
            return back()->with('error', 'This certificate cannot be uploaded at this time.');
        }

        $request->validate([
            'certificate_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max
            'usage_type' => 'required|in:academic,employment,personal,other',
            'usage_notes' => 'nullable|string|max:1000',
        ]);

        try {
            // Store the image
            $imagePath = $request->file('certificate_image')->store('certificate-images', 'public');

            // Update the certificate
            $certificate->update([
                'certificate_image_path' => $imagePath,
                'upload_status' => 'uploaded',
                'uploaded_at' => now(),
                'uploaded_by' => $user->id,
                'usage_type' => $request->usage_type,
                'usage_notes' => $request->usage_notes,
            ]);

            return back()->with('success', 'Certificate image uploaded successfully. Waiting for approval.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error uploading certificate image: ' . $e->getMessage());
        }
    }

    public function approve(Request $request, GeneratedCertificate $certificate)
    {
        // Only admins can approve certificates
        if (Auth::user()->user_role !== 'admin') {
            return back()->with('error', 'Only administrators can approve certificates.');
        }

        if (!$certificate->canBeApproved()) {
            return back()->with('error', 'This certificate cannot be approved at this time.');
        }

        $request->validate([
            'upload_notes' => 'nullable|string|max:1000',
        ]);

        $certificate->update([
            'upload_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::user()->id,
            'upload_notes' => $request->upload_notes,
        ]);

        return back()->with('success', 'Certificate approved successfully.');
    }

    public function reject(Request $request, GeneratedCertificate $certificate)
    {
        // Only admins can reject certificates
        if (Auth::user()->user_role !== 'admin') {
            return back()->with('error', 'Only administrators can reject certificates.');
        }

        $request->validate([
            'upload_notes' => 'required|string|max:1000',
        ]);

        // Delete the uploaded image
        if ($certificate->certificate_image_path && Storage::disk('public')->exists($certificate->certificate_image_path)) {
            Storage::disk('public')->delete($certificate->certificate_image_path);
        }

        $certificate->update([
            'upload_status' => 'rejected',
            'upload_notes' => $request->upload_notes,
            'certificate_image_path' => null,
        ]);

        return back()->with('success', 'Certificate rejected. Student can upload a new image.');
    }

    public function showImage(GeneratedCertificate $certificate)
    {
        if (!$certificate->hasImage()) {
            abort(404, 'Certificate image not found.');
        }

        // Check if user has permission to view this image
        $user = Auth::user();
        if ($user->user_role === 'student' && $certificate->student_id !== $user->id) {
            abort(403, 'You can only view your own certificates.');
        }

        return response()->file(storage_path('app/public/' . $certificate->certificate_image_path));
    }

    public function downloadImage(GeneratedCertificate $certificate)
    {
        if (!$certificate->hasImage()) {
            return back()->with('error', 'Certificate image not found.');
        }

        // Check if user has permission to download this image
        $user = Auth::user();
        if ($user->user_role === 'student' && $certificate->student_id !== $user->id) {
            return back()->with('error', 'You can only download your own certificates.');
        }

        $filename = "certificate_{$certificate->certificate_number}.jpg";
        return response()->download(storage_path('app/public/' . $certificate->certificate_image_path), $filename);
    }

    public function deleteImage(GeneratedCertificate $certificate)
    {
        $user = Auth::user();
        
        // Check permissions
        if ($user->user_role === 'student' && $certificate->student_id !== $user->id) {
            return back()->with('error', 'You can only delete your own certificates.');
        }

        if ($user->user_role !== 'admin' && $certificate->upload_status === 'approved') {
            return back()->with('error', 'Approved certificates cannot be deleted.');
        }

        try {
            // Delete the image file
            if ($certificate->certificate_image_path && Storage::disk('public')->exists($certificate->certificate_image_path)) {
                Storage::disk('public')->delete($certificate->certificate_image_path);
            }

            // Reset the certificate
            $certificate->update([
                'certificate_image_path' => null,
                'upload_status' => 'pending',
                'upload_notes' => null,
                'uploaded_at' => null,
                'uploaded_by' => null,
                'approved_by' => null,
                'approved_at' => null,
                'usage_type' => null,
                'usage_notes' => null,
            ]);

            return back()->with('success', 'Certificate image deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error deleting certificate image: ' . $e->getMessage());
        }
    }

    public function bulkApprove(Request $request)
    {
        if (Auth::user()->user_role !== 'admin') {
            return back()->with('error', 'Only administrators can approve certificates.');
        }

        $request->validate([
            'certificate_ids' => 'required|array',
            'certificate_ids.*' => 'exists:generated_certificates,id',
        ]);

        $certificates = GeneratedCertificate::whereIn('id', $request->certificate_ids)
            ->where('upload_status', 'uploaded')
            ->get();

        foreach ($certificates as $certificate) {
            $certificate->update([
                'upload_status' => 'approved',
                'approved_at' => now(),
                'approved_by' => Auth::user()->id,
            ]);
        }

        return back()->with('success', count($certificates) . ' certificates approved successfully.');
    }

    public function bulkReject(Request $request)
    {
        if (Auth::user()->user_role !== 'admin') {
            return back()->with('error', 'Only administrators can reject certificates.');
        }

        $request->validate([
            'certificate_ids' => 'required|array',
            'certificate_ids.*' => 'exists:generated_certificates,id',
            'upload_notes' => 'required|string|max:1000',
        ]);

        $certificates = GeneratedCertificate::whereIn('id', $request->certificate_ids)
            ->where('upload_status', 'uploaded')
            ->get();

        foreach ($certificates as $certificate) {
            // Delete the uploaded image
            if ($certificate->certificate_image_path && Storage::disk('public')->exists($certificate->certificate_image_path)) {
                Storage::disk('public')->delete($certificate->certificate_image_path);
            }

            $certificate->update([
                'upload_status' => 'rejected',
                'upload_notes' => $request->upload_notes,
                'certificate_image_path' => null,
            ]);
        }

        return back()->with('success', count($certificates) . ' certificates rejected successfully.');
    }
}
