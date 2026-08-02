export interface GeneratedFile {
  path: string;
  language: string;
  code: string;
  roleId?: string;
  runId?: string;
  createdAt?: number;
}

/** Extracts code files from the file-by-file format requested in Code mode. */
export const extractGeneratedFiles = (output: string): GeneratedFile[] => {
  const files: GeneratedFile[] = [];
  const fence = /(?:^|\n)(?:#{1,4}\s*)?(?:File|Path)\s*:\s*`?([^`\n]+)`?[^\n]*\n```([\w+-]*)(?:\s+[^\n]*)?\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(output))) {
    files.push({ path: match[1].trim(), language: match[2] || match[1].split('.').pop() || 'text', code: match[3].trim() });
  }
  if (files.length) return files;
  const generic = /```([\w+-]*)\n([\s\S]*?)```/g;
  let index = 1;
  while ((match = generic.exec(output))) {
    files.push({ path: `generated-file-${index++}.${match[1] || 'txt'}`, language: match[1] || 'text', code: match[2].trim() });
  }
  return files;
};
