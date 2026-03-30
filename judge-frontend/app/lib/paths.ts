export const CODE_JUDGE_PATH = "/code-judge";
export const CODE_JUDGE_MDE_PATH = "/code-judge-mde";

export function getCodeJudgePath(useNewUi: boolean) {
  return useNewUi ? CODE_JUDGE_MDE_PATH : CODE_JUDGE_PATH;
}

export function isCodeJudgePath(pathname: string | null | undefined) {
  return pathname === CODE_JUDGE_PATH || pathname === CODE_JUDGE_MDE_PATH;
}
