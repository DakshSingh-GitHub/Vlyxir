export interface Problem {
    hidden_test_cases: never[];
    id: string;
    title: string;
    description: string;
    difficulty?: string;
    input_format?: string;
    output_format?: string;
    sample_test_cases?: Array<{ input: string; output: string }>;
    sample_test_cases_count?: number;
    hidden_test_cases_count?: number;
    constraints?: Record<string, unknown> | string;
}

export interface TestCaseResult {
    test_case: number;
    status: string;
    input?: string;
    actual_output?: string;
    expected_output?: string;
    error?: string;
    duration?: number;
}

export interface SubmitResponse {
    problem_id: string;
    final_status: string;
    total_duration: number;
    summary: {
        passed: number;
        total: number;
    };
    test_case_results: TestCaseResult[];
}

export type Permission = 'DOCS_INT' | 'ADMIN_VIEW' | 'ADMIN_EDIT';

export interface User {
    id: string;
    username: string;
    password?: string; // Optional for transfer/display
    permissions: Permission[];
    isRoot?: boolean;
    createdAt: number;
}

export interface LeaderboardUser {
    id: string;
    username: string;
    full_name: string;
    total_score: number;
    country?: string;
    rank?: number;
}
