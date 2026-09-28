import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/refactoring-suggester.prompt.js';

/**
 * Refactoring Suggester Agent
 *
 * Identifies opportunities to improve code structure, modernize patterns,
 * and enhance readability with concrete before/after examples.
 *
 * Tool permissions follow the principle of least privilege:
 * - Read: Inspect source code context to understand logic and identify refactoring targets
 * - Grep: Check for duplicated code patterns, function calls, and naming usages across files
 * - Glob: Discover project structure and module boundaries to assess refactoring scope
 * - Skill: Invoke domain-specific Claude Skills (.claude/skills/*) for idiomatic modernization patterns
 */
export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies refactoring opportunities in source code files including extract-function, rename, modernize, simplify, and pattern-improvement suggestions. Provides concrete before/after code examples. Use this agent to find ways to improve code structure and readability.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: REFACTORING_SUGGESTER_PROMPT
};
