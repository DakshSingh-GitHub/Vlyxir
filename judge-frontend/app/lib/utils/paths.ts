export const CODE_JUDGE_PATH = "/code-judge";
export const CODE_JUDGE_MDE_PATH = "/arena";
export const CODE_IDE_PATH = "/code-ide";
export const CODE_IDE_MDE_PATH = "/forge";
export const CODE_ANALYSIS_PATH = "/code-analysis";
export const CODE_ANALYSIS_MDE_PATH = "/insights";

export function getCodeJudgePath(useNewUi: boolean) {
  return useNewUi ? CODE_JUDGE_MDE_PATH : CODE_JUDGE_PATH;
}

export function isCodeJudgePath(pathname: string | null | undefined) {
  return pathname === CODE_JUDGE_PATH || pathname === CODE_JUDGE_MDE_PATH;
}

export function getCodeIdePath(useNewUi: boolean) {
  return useNewUi ? CODE_IDE_MDE_PATH : CODE_IDE_PATH;
}

export function isCodeIdePath(pathname: string | null | undefined) {
  return pathname === CODE_IDE_PATH || pathname === CODE_IDE_MDE_PATH;
}

export function getCodeAnalysisPath(useNewUi: boolean) {
  return useNewUi ? CODE_ANALYSIS_MDE_PATH : CODE_ANALYSIS_PATH;
}

export function isCodeAnalysisPath(pathname: string | null | undefined) {
  return pathname === CODE_ANALYSIS_PATH || pathname === CODE_ANALYSIS_MDE_PATH;
}

export function isForumPath(pathname: string | null | undefined) {
  return pathname?.startsWith("/forum");
}

export function isLearnPath(pathname: string | null | undefined) {
  return pathname?.startsWith("/learn");
}

