import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts/test-coverage-analyzer.prompt.js';

/**
 * Test Coverage Analyzer Agent
 *
 * Evaluates test completeness by comparing source files with test files,
 * identifying untested code paths, and suggesting specific test cases.
 *
 * Tool permissions follow the principle of least privilege:
 * - Read: Read source files and existing test suite implementations
 * - Grep: Search for test suite definitions (describe, it, test), assertions, and mocks
 * - Glob: Discover related test files matching naming patterns (*.test.ts, *.spec.ts, __tests__/)
 * - Skill: Invoke domain-specific Claude Skills (.claude/skills/*) to evaluate type boundaries and security test cases
 */
export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Evaluates test coverage for source code files by finding related test files, identifying untested code paths (functions, branches, edge cases), and suggesting specific test cases. Use this agent to assess how well a file is tested.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: TEST_COVERAGE_ANALYZER_PROMPT
};
