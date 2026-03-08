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

export type Permission = 'DOCS_INT' | 'ADMIN_VIEW' | 'ADMIN_EDIT';

export interface User {
    id: string;
    username: string;
    password?: string; // Optional for transfer/display
    permissions: Permission[];
    isRoot?: boolean;
    createdAt: number;
}
