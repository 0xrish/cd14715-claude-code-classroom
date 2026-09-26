import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/code-quality-analyzer.prompt.js';

/**
 * Code Quality Analyzer Agent
 *
 * Analyzes source code for security vulnerabilities, performance issues,
 * maintainability concerns, and best practice violations.
 *
 * Includes the Skill tool for invoking Claude Skills (e.g., javascript-best-practices).
 */
export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes code files for security vulnerabilities, performance issues, maintainability concerns, style violations, bug risks, and best practice violations. Use this agent when you need a thorough code quality review of a source file.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: CODE_QUALITY_ANALYZER_PROMPT
};
