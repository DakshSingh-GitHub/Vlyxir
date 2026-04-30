import { getCachedProblems, setCachedProblems, getCachedProblemById, setCachedProblemById } from "../utils/cache";
import { SubmitResponse, Problem } from "../types/types";

const LOCAL_URL = "http://localhost:5000";
const REMOTE_URL = "https://code-judge-6fm6.vercel.app";

function errorToString(err: unknown): string {
	const error = err as Record<string, unknown>;
	if (!error) return "Unknown error";
	if (typeof error === 'string') return error;
	if (error.error && typeof error.error === 'string') return error.error;
	if (error.message && typeof error.message === 'string') return error.message;
	if (error.detail) {
		if (typeof error.detail === 'string') return error.detail;
		return JSON.stringify(error.detail);
	}
	return JSON.stringify(error);
}

let resolvedBaseUrl: string | null = null;

async function getBaseUrl() {
	if (resolvedBaseUrl) return resolvedBaseUrl;

	try {
		// Quick ping to check if local backend is alive
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 1500);

		await fetch(`${LOCAL_URL}/`, {
			method: 'GET',
			signal: controller.signal
		});

		clearTimeout(timeoutId);
		resolvedBaseUrl = LOCAL_URL;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		console.warn("Local backend not found, falling back to remote:", REMOTE_URL);
		resolvedBaseUrl = REMOTE_URL;
	}

	return resolvedBaseUrl;
}

export async function getProblems(skipCache: boolean = false, onBackgroundUpdate?: (data: { problems: Problem[] }) => void) {
	const baseUrl = await getBaseUrl();
	if (!skipCache) {
		const cached = getCachedProblems();
		if (cached) {
			// Fetch in background to update cache for next time
			fetch(`${baseUrl}/problems`)
				.then(res => res.json())
				.then(data => {
					setCachedProblems(data);
					if (onBackgroundUpdate) onBackgroundUpdate(data);
				})
				.catch(console.error);
			return cached;
		}
	}

	const res = await fetch(`${baseUrl}/problems`);
	const data = await res.json();
	setCachedProblems(data);
	return data;
}

export async function getProblemById(id: string, onBackgroundUpdate?: (data: Problem) => void) {
	const baseUrl = await getBaseUrl();
	const cached = getCachedProblemById(id);
	if (cached) {
		// Fetch in background to update cache
		fetch(`${baseUrl}/problems/${id}`)
			.then(res => res.json())
			.then(data => {
				setCachedProblemById(id, data);
				if (onBackgroundUpdate) onBackgroundUpdate(data);
			})
			.catch(console.error);
		return cached;
	}

	const res = await fetch(`${baseUrl}/problems/${id}`);
	const data = await res.json();
	setCachedProblemById(id, data);
	return data;
}

export async function submitCode(problemId: string, code: string, testOnly: boolean = false): Promise<SubmitResponse> {
	const { getSystemConfig } = await import("../utils/storage");
	if (getSystemConfig().maintenanceMode) {
		throw new Error("⚠️ System Maintenance: Submissions are currently paused.");
	}

	const baseUrl = await getBaseUrl();
	const res = await fetch(`${baseUrl}/submit`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			problem_id: problemId,
			code: code,
			test_only: testOnly,
		})
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(errorToString(err));
	}

	return res.json();
}

export async function runCode(code: string, input: string = "") {
	const { getSystemConfig } = await import("../utils/storage");
	if (getSystemConfig().maintenanceMode) {
		throw new Error("⚠️ System Maintenance: Execution is currently paused.");
	}

	const baseUrl = await getBaseUrl();
	const res = await fetch(`${baseUrl}/run`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			code: code,
			input: input,
		})
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(errorToString(err));
	}

	return res.json();
}
