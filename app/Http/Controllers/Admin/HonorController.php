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
        // Get honor criteria with academic level relationship
        $honorCriteria = HonorCriterion::with('academicLevel')->orderBy('minimum_grade', 'desc')->paginate(20);

        // Get recent honors
        $recentHonors = StudentHonor::with(['student.studentProfile', 'honorCriterion', 'academicPeriod'])
                                   ->where('is_active', true)
                                   ->orderBy('awarded_date', 'desc')
                                   ->limit(10)
                                   ->get();

        // Get statistics (scope to selected period if provided)
        $stats = $this->honorCalculationService->generateHonorStatistics($request->get('academic_period_id'));

        // Get academic periods with level for clearer UI grouping (avoid duplicate-looking names)
        $academicPeriods = AcademicPeriod::with('academicLevel')
            ->orderBy('school_year', 'desc')
            ->orderBy('name')
            ->get();

        // Get academic levels
        $academicLevels = AcademicLevel::orderBy('name')->get();

        // Get rankings by academic level (respect selected period if provided)
        $rankingsByLevel = $this->getHonorRankingsByLevel($request->get('academic_period_id'));

        // Get the period with the most honor students for default links
        $periodWithMostHonors = StudentHonor::select('academic_period_id')
            ->where('is_active', true)
            ->where('is_approved', true)
            ->groupBy('academic_period_id')
            ->orderByRaw('COUNT(*) DESC')
            ->first();
        
        $defaultPeriodId = null;
        if ($periodWithMostHonors) {
            $defaultPeriodId = $periodWithMostHonors->academic_period_id;
        } else {
            // Fallback to active period or most recent
            $currentPeriod = AcademicPeriod::where('is_active', true)->first();
            if (!$currentPeriod) {
                $currentPeriod = AcademicPeriod::orderBy('created_at', 'desc')->first();
            }
            $defaultPeriodId = $currentPeriod?->id;
        }

        return Inertia::render('Admin/Honors/Index', [
            'honorCriteria' => $honorCriteria,
            'recentHonors' => $recentHonors,
            'stats' => $stats,
            'academicPeriods' => $academicPeriods,
            'academicLevels' => $academicLevels,
            'rankingsByLevel' => $rankingsByLevel,
            'currentPeriodId' => $defaultPeriodId
        ]);
    }

    private function getHonorRankingsByLevel($academicPeriodId = null)
    {
        $rankings = [];
        $academicLevels = AcademicLevel::all();

        foreach ($academicLevels as $level) {
            $honors = StudentHonor::with(['student.studentProfile'])
                ->whereHas('student.studentProfile', function ($query) use ($level) {
                    $query->where('academic_level_id', $level->id);
                })
                ->where('is_active', true)
                // Show calculated honors regardless of approval so admins can review
                ->when($academicPeriodId, function ($q) use ($academicPeriodId) {
                    $q->where('academic_period_id', $academicPeriodId);
                })
                ->orderBy('gpa', 'desc')
                ->orderBy('awarded_date', 'desc')
                ->limit(10)
                ->get();

            $rankings[$level->name] = [
                'level_id' => $level->id,
                'level_name' => $level->name,
                'total_honors' => $honors->count(),
                'top_students' => $honors->take(5)->map(function ($honor) {
                    return [
                        'student_name' => $honor->student->name,
                        'student_id' => $honor->student->studentProfile->student_id ?? 'N/A',
                        'grade_level' => $honor->student->studentProfile->grade_level ?? 'N/A',
                        'honor_type' => $honor->honor_type,
                        'gpa' => $honor->gpa,
                        'awarded_date' => $honor->awarded_date,
                    ];
                }),
                'honor_distribution' => $honors->groupBy('honor_type')->map->count(),
                'average_gpa' => $honors->avg('gpa') ? round($honors->avg('gpa'), 2) : 0,
                'highest_gpa' => $honors->max('gpa') ? round($honors->max('gpa'), 2) : 0,
            ];
        }

        return $rankings;
    }

    public function honorRoll(Request $request)
    {
        $academicPeriodId = $request->get('academic_period_id');
        $academicLevelId = $request->get('level');
        $approvedOnly = $request->boolean('approved_only', false);
        
        // If no period selected, we aggregate across all periods

        $honorRoll = [];
        $stats = [];
        $selectedLevel = null;

        // If a period is chosen and there are no honors yet for it, compute now for convenience
        if ($academicPeriodId) {
            $existingCount = StudentHonor::where('academic_period_id', $academicPeriodId)->count();
            if ($existingCount === 0) {
                $period = AcademicPeriod::find($academicPeriodId);
                if ($period) {
                    $this->honorCalculationService->calculateAllStudentHonors($period);
                }
            }
        }

        // Build honor roll. Null period aggregates across all periods.
        $honorRoll = $this->getDetailedHonorRoll($academicPeriodId, $academicLevelId, $approvedOnly);
        $stats = $this->honorCalculationService->generateHonorStatistics($academicPeriodId);
        if ($academicLevelId) {
            $selectedLevel = AcademicLevel::find($academicLevelId);
        }

        $academicPeriods = AcademicPeriod::with('academicLevel')
            ->orderBy('school_year', 'desc')
            ->orderBy('name')
            ->get();
        $academicLevels = AcademicLevel::orderBy('name')->get();

        return Inertia::render('Admin/Honors/HonorRoll', [
            'honorRoll' => $honorRoll,
            'stats' => $stats,
            'academicPeriods' => $academicPeriods,
            'academicLevels' => $academicLevels,
            'selectedPeriodId' => $academicPeriodId,
            'selectedLevelId' => $academicLevelId,
            'selectedLevel' => $selectedLevel,
            'approvedOnly' => $approvedOnly,
        ]);
    }

    private function getDetailedHonorRoll($academicPeriodId, $academicLevelId = null, $approvedOnly = false)
    {
        $query = StudentHonor::with(['student.studentProfile.academicLevel', 'honorCriterion', 'academicPeriod'])
            ->where('is_active', true);

        if ($academicPeriodId) {
            $query->where('academic_period_id', $academicPeriodId);
        }

        if ($approvedOnly) {
            $query->where('is_approved', true);
        }

        // Filter by academic level if specified
        if ($academicLevelId) {
            $query->whereHas('student.studentProfile', function ($q) use ($academicLevelId) {
                $q->where('academic_level_id', $academicLevelId);
            });
        }

        $honors = $query->orderBy('gpa', 'desc')
            ->orderBy('awarded_date', 'desc')
            ->get();

        // Group by academic level for better organization
        $groupedHonors = $honors->groupBy(function ($honor) {
            return $honor->student->studentProfile->academicLevel->name ?? 'Unknown';
        });

        // Transform the data for frontend consumption
        $result = [];
        foreach ($groupedHonors as $levelName => $levelHonors) {
            $result[$levelName] = [
                'level_name' => $levelName,
                'total_students' => $levelHonors->count(),
                'average_gpa' => round($levelHonors->avg('gpa'), 2),
                'highest_gpa' => round($levelHonors->max('gpa'), 2),
                'students' => $levelHonors->map(function ($honor, $index) {
                    return [
                        'rank' => $index + 1,
                        'student_id' => $honor->student->studentProfile->student_id ?? 'N/A',
                        'student_name' => $honor->student->name,
                        'grade_level' => $honor->student->studentProfile->grade_level ?? 'N/A',
                        'honor_type' => $honor->honor_type,
                        'honor_display' => $this->getHonorDisplayName($honor->honor_type),
                        'gpa' => $honor->gpa,
                        'awarded_date' => $honor->awarded_date,
                        'certificate_title' => $honor->certificate_title,
                    ];
                }),
                'honor_distribution' => $levelHonors->groupBy('honor_type')->map->count(),
            ];
        }

        return $result;
    }

    private function getHonorDisplayName($honorType)
    {
        $displayNames = [
            'with_honors' => 'With Honors',
            'with_high_honors' => 'With High Honors',
            'with_highest_honors' => 'With Highest Honors',
            'deans_list' => "Dean's List",
            'cum_laude' => 'Cum Laude',
            'magna_cum_laude' => 'Magna Cum Laude',
            'summa_cum_laude' => 'Summa Cum Laude',
            'college_honors' => 'College Honors',
        ];

        return $displayNames[$honorType] ?? ucwords(str_replace('_', ' ', $honorType));
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
            $academicPeriod = AcademicPeriod::findOrFail($request->academic_period_id);
            $processed = $this->honorCalculationService->calculateAllStudentHonors($academicPeriod);

            ActivityLog::logActivity(
                Auth::user(),
                'calculated_honors',
                'StudentHonor',
                null,
                null,
                ['academic_period_id' => $request->academic_period_id, 'students_processed' => $processed]
            );

            // Redirect back to honors index with the selected period applied as a filter
            return redirect()->route('admin.honors.index', ['academic_period_id' => $request->academic_period_id])
                ->with('success', "Honor calculation completed. Processed {$processed} students.");
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
