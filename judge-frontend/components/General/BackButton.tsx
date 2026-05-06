"use client";

import Link from "next/link";

export function BackButton() {
    return (
        <Link
            href="/"
            className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
            <svg
                className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            Back to Home
        </Link>
    );
}
