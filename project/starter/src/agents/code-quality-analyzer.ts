import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/code-quality-analyzer.prompt.js';

/**
 * Code Quality Analyzer Agent
 *
 * Analyzes source code for security vulnerabilities, performance issues,
 * maintainability concerns, and best practice violations.
 *
 * Tool permissions follow the principle of least privilege:
 * - Read: Inspect source code file contents for line-by-line quality and security analysis
 * - Grep: Search for syntax patterns, insecure API usages, and deprecated method calls
 * - Glob: Discover relevant files and configuration across the codebase
 * - Skill: Invoke domain-specific Claude Skills (.claude/skills/*) such as typescript-patterns,
 *   javascript-best-practices, python-code-review, and security-analysis
 */
export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes code files for security vulnerabilities, performance issues, maintainability concerns, style violations, bug risks, and best practice violations. Use this agent when you need a thorough code quality review of a source file.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: CODE_QUALITY_ANALYZER_PROMPT
};
