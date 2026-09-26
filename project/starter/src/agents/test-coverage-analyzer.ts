import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts/test-coverage-analyzer.prompt.js';

/**
 * Test Coverage Analyzer Agent
 *
 * Evaluates test completeness by comparing source files with test files,
 * identifying untested code paths, and suggesting specific test cases.
 */
export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Evaluates test coverage for source code files by finding related test files, identifying untested code paths (functions, branches, edge cases), and suggesting specific test cases. Use this agent to assess how well a file is tested.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob'],
  prompt: TEST_COVERAGE_ANALYZER_PROMPT
};
