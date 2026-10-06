import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function resolve(specifier, context, nextResolve) {
  try { return await nextResolve(specifier, context); }
  catch (error) {
    if (!specifier.startsWith('.') || !['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT'].includes(error.code)) throw error;
    try { return await nextResolve(`${specifier}.ts`, context); }
    catch { return nextResolve(`${specifier}/index.ts`, context); }
  }
}
export async function load(url, context, nextLoad) {
  if (!url.endsWith('.ts')) return nextLoad(url, context);
  const source = ts.transpileModule(await readFile(new URL(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return { format: 'module', source, shortCircuit: true };
}
