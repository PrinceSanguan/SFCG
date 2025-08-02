<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\StudentHonor;
use App\Models\HonorCriterion;
use App\Models\AcademicPeriod;
use App\Models\AcademicLevel;
use App\Models\User;
use App\Models\ActivityLog;
use App\Services\HonorCalculationService;

class HonorController extends Controller
{
    protected $honorCalculationService;

    public function __construct(HonorCalculationService $honorCalculationService)
    {
        $this->honorCalculationService = $honorCalculationService;
    }

    public function index(Request $request)
    {
        // Get honor criteria
        $honorCriteria = HonorCriterion::orderBy('minimum_grade', 'desc')->paginate(20);

        // Get recent honors
        $recentHonors = StudentHonor::with(['student.studentProfile', 'honorCriterion', 'academicPeriod'])
                                   ->where('is_active', true)
                                   ->orderBy('awarded_date', 'desc')
                                   ->limit(10)
                                   ->get();

        // Get statistics
        $stats = $this->honorCalculationService->generateHonorStatistics();

        // Get academic periods
        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        // Get academic levels
        $academicLevels = AcademicLevel::orderBy('name')->get();

        return Inertia::render('Admin/Honors/Index', [
            'honorCriteria' => $honorCriteria,
            'recentHonors' => $recentHonors,
            'stats' => $stats,
            'academicPeriods' => $academicPeriods,
            'academicLevels' => $academicLevels
        ]);
    }

    public function honorRoll(Request $request)
    {
        $academicPeriodId = $request->get('academic_period_id');
        
        if (!$academicPeriodId) {
            $currentPeriod = AcademicPeriod::where('is_active', true)->first();
            $academicPeriodId = $currentPeriod?->id;
        }

        $honorRoll = [];
        $stats = [];

        if ($academicPeriodId) {
            $honorRoll = $this->honorCalculationService->getHonorRollByPeriod($academicPeriodId);
            $stats = $this->honorCalculationService->generateHonorStatistics($academicPeriodId);
        }

        $academicPeriods = AcademicPeriod::orderBy('name')->get();

        return Inertia::render('Admin/Honors/HonorRoll', [
            'honorRoll' => $honorRoll,
            'stats' => $stats,
            'academicPeriods' => $academicPeriods,
            'selectedPeriodId' => $academicPeriodId
        ]);
    }

    public function criteria()
    {
        $criteria = HonorCriterion::orderBy('minimum_grade', 'desc')->paginate(20);
        $academicLevels = AcademicLevel::orderBy('name')->get();

        return Inertia::render('Admin/Honors/Criteria', [
            'criteria' => $criteria,
            'academicLevels' => $academicLevels
        ]);
    }

    public function storeCriteria(Request $request)
    {
        $request->validate([
            'honor_type' => 'required|string|max:255',
            'minimum_grade' => 'required|numeric|min:0|max:100',
            'maximum_grade' => 'nullable|numeric|min:0|max:100|gte:minimum_grade',
            'criteria_description' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request) {
            // Convert empty string to null for maximum_grade
            $maximumGrade = $request->maximum_grade;
            if ($maximumGrade === '' || $maximumGrade === null) {
                $maximumGrade = null;
            }

            $criterion = HonorCriterion::create([
                'honor_type' => $request->honor_type,
                'minimum_grade' => $request->minimum_grade,
                'maximum_grade' => $maximumGrade,
                'criteria_description' => $request->criteria_description,
                'academic_level_id' => $request->academic_level_id,
                'is_active' => $request->boolean('is_active', true),
            ]);

            ActivityLog::logActivity(
                Auth::user(),
                'created',
                'HonorCriterion',
                $criterion->id,
                null,
                $criterion->toArray()
            );
        });

        return redirect()->back()->with('success', 'Honor criteria created successfully.');
    }

    public function updateCriteria(Request $request, HonorCriterion $criterion)
    {
        $request->validate([
            'honor_type' => 'required|string|max:255',
            'minimum_grade' => 'required|numeric|min:0|max:100',
            'maximum_grade' => 'nullable|numeric|min:0|max:100|gte:minimum_grade',
            'criteria_description' => 'required|string',
            'academic_level_id' => 'nullable|exists:academic_levels,id',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request, $criterion) {
            $oldValues = $criterion->toArray();

            // Convert empty string to null for maximum_grade
            $maximumGrade = $request->maximum_grade;
            if ($maximumGrade === '' || $maximumGrade === null) {
                $maximumGrade = null;
            }

            $criterion->update([
                'honor_type' => $request->honor_type,
                'minimum_grade' => $request->minimum_grade,
                'maximum_grade' => $maximumGrade,
                'criteria_description' => $request->criteria_description,
                'academic_level_id' => $request->academic_level_id,
                'is_active' => $request->boolean('is_active', true),
            ]);

            ActivityLog::logActivity(
                Auth::user(),
                'updated',
                'HonorCriterion',
                $criterion->id,
                $oldValues,
                $criterion->toArray()
            );
        });

        return redirect()->back()->with('success', 'Honor criteria updated successfully.');
    }

    public function destroyCriteria(HonorCriterion $criterion)
    {
        DB::transaction(function () use ($criterion) {
            $oldValues = $criterion->toArray();

            // Check if criterion is being used
            $usageCount = StudentHonor::where('honor_criterion_id', $criterion->id)->count();
            
            if ($usageCount > 0) {
                // Soft disable instead of delete
                $criterion->update(['is_active' => false]);
                
                ActivityLog::logActivity(
                    Auth::user(),
                    'disabled',
                    'HonorCriterion',
                    $criterion->id,
                    $oldValues,
                    $criterion->toArray()
                );

                return redirect()->back()->with('warning', 'Criteria disabled because it\'s being used. Cannot delete.');
            }

            ActivityLog::logActivity(
                Auth::user(),
                'deleted',
                'HonorCriterion',
                $criterion->id,
                $oldValues,
                null
            );

            $criterion->delete();
        });

        return redirect()->back()->with('success', 'Honor criteria deleted successfully.');
    }

    public function calculateHonors(Request $request)
    {
        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id'
        ]);

        try {
            $processed = $this->honorCalculationService->calculateAllStudentHonors($request->academic_period_id);

            ActivityLog::logActivity(
                Auth::user(),
                'calculated_honors',
                'StudentHonor',
                null,
                null,
                ['academic_period_id' => $request->academic_period_id, 'students_processed' => $processed]
            );

            return redirect()->back()->with('success', "Honor calculation completed. Processed {$processed} students.");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Honor calculation failed: ' . $e->getMessage());
        }
    }

    public function studentHonors(Request $request)
    {
        $query = StudentHonor::with(['student.studentProfile', 'honorCriterion', 'academicPeriod'])
                            ->where('is_active', true);

        // Apply filters
        if ($request->filled('academic_period_id')) {
            $query->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('honor_type')) {
            $query->whereHas('honorCriterion', function ($q) use ($request) {
                $q->where('honor_type', $request->honor_type);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $studentHonors = $query->orderBy('awarded_date', 'desc')->paginate(50);

        // Get filter options
        $academicPeriods = AcademicPeriod::orderBy('name')->get();
        $honorTypes = HonorCriterion::distinct()->pluck('honor_type');

        return Inertia::render('Admin/Honors/StudentHonors', [
            'studentHonors' => $studentHonors,
            'academicPeriods' => $academicPeriods,
            'honorTypes' => $honorTypes,
            'filters' => $request->only(['academic_period_id', 'honor_type', 'search'])
        ]);
    }

    public function revokeHonor(StudentHonor $honor)
    {
        DB::transaction(function () use ($honor) {
            $oldValues = $honor->toArray();

            $honor->update(['is_active' => false]);

            ActivityLog::logActivity(
                Auth::user(),
                'revoked',
                'StudentHonor',
                $honor->id,
                $oldValues,
                $honor->toArray()
            );
        });

        return redirect()->back()->with('success', 'Honor revoked successfully.');
    }

    public function restoreHonor(StudentHonor $honor)
    {
        DB::transaction(function () use ($honor) {
            $oldValues = $honor->toArray();

            $honor->update(['is_active' => true]);

            ActivityLog::logActivity(
                Auth::user(),
                'restored',
                'StudentHonor',
                $honor->id,
                $oldValues,
                $honor->toArray()
            );
        });

        return redirect()->back()->with('success', 'Honor restored successfully.');
    }

    public function exportHonorRoll(Request $request)
    {
        $request->validate([
            'academic_period_id' => 'required|exists:academic_periods,id',
            'format' => 'required|in:csv,pdf'
        ]);

        $academicPeriod = AcademicPeriod::findOrFail($request->academic_period_id);
        $honorRoll = $this->honorCalculationService->getHonorRollByPeriod($request->academic_period_id);

        if ($request->format === 'csv') {
            return $this->exportHonorRollCsv($honorRoll, $academicPeriod);
        } else {
            return $this->exportHonorRollPdf($honorRoll, $academicPeriod);
        }
    }

    private function exportHonorRollCsv($honorRoll, $academicPeriod)
    {
        $filename = "honor_roll_{$academicPeriod->code}_{$academicPeriod->school_year}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($honorRoll) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Honor Type', 'Student ID', 'Student Name', 'Email', 'Grade Level', 'Section', 'GPA', 'Award Date']);

            foreach ($honorRoll as $honorType => $students) {
                foreach ($students as $honor) {
                    fputcsv($file, [
                        $honorType,
                        $honor->student->studentProfile->student_id ?? '',
                        $honor->student->name,
                        $honor->student->email,
                        $honor->student->studentProfile->grade_level ?? '',
                        $honor->student->studentProfile->section ?? '',
                        number_format($honor->gpa, 2),
                        $honor->awarded_date->format('Y-m-d'),
                    ]);
                }
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportHonorRollPdf($honorRoll, $academicPeriod)
    {
        // This would use a PDF library like dompdf
        // For now, return a placeholder response
        return response()->json(['message' => 'PDF export feature coming soon']);
    }
}
