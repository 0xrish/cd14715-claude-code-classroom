import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/refactoring-suggester.prompt.js';

/**
 * Refactoring Suggester Agent
 *
 * Identifies opportunities to improve code structure, modernize patterns,
 * and enhance readability with concrete before/after examples.
 */
export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies refactoring opportunities in source code files including extract-function, rename, modernize, simplify, and pattern-improvement suggestions. Provides concrete before/after code examples. Use this agent to find ways to improve code structure and readability.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob'],
  prompt: REFACTORING_SUGGESTER_PROMPT
};
