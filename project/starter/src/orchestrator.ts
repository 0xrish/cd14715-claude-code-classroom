import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Options } from '@anthropic-ai/claude-agent-sdk';
import { ReviewReport, ReviewReportSchema, ReviewReportJSONSchema } from './types/report-types.js';
import { mcpServersConfig } from './config/mcp.config.js';
import { codeQualityAnalyzer, testCoverageAnalyzer, refactoringSuggester } from './agents/index.js';
import { buildOrchestratorPrompt } from './prompts/orchestrator.prompt.js';
import { logger } from './utils/logger.js';

/**
 * Tool permissions explicitly derived from connected MCP servers and core SDK capabilities:
 *
 * 1. Built-in SDK Tools:
 *    - 'Task': Spawns parallel subagents (code-quality-analyzer, test-coverage-analyzer, refactoring-suggester)
 *    - 'Read', 'Grep', 'Glob': Local codebase discovery and context retrieval
 *    - 'Skill': Enables invoking domain-specific Claude Skills (.claude/skills/*)
 *
 * 2. GitHub MCP Server ('github' in mcpServersConfig):
 *    - 'mcp__github__get_pull_request': Fetches PR metadata and description
 *    - 'mcp__github__list_pull_request_files': Lists all changed files in the PR
 *    - 'mcp__github__get_file_contents': Retrieves PR file contents
 *
 * 3. ESLint MCP Server ('eslint' in mcpServersConfig):
 *    - 'mcp__eslint__lint_files': Automated static analysis and lint rule enforcement
 */
export const ORCHESTRATOR_ALLOWED_TOOLS = [
  'Task',
  'Read',
  'Grep',
  'Glob',
  'Skill',
  'mcp__github__get_pull_request',
  'mcp__github__list_pull_request_files',
  'mcp__github__get_file_contents',
  'mcp__eslint__lint_files'
];

/**
 * Orchestrator configuration options
 */
export interface OrchestratorOptions {
  /** Maximum number of turns for multi-agent coordination */
  maxTurns?: number;
  /** Custom MCP server configurations */
  mcpServers?: Options['mcpServers'];
}

/**
 * Main Code Review Orchestrator
 * Coordinates subagents to analyze pull requests and generate comprehensive reports
 */
export class CodeReviewOrchestrator {
  private maxTurns: number;
  private customMcpServers?: Options['mcpServers'];

  constructor(options: OrchestratorOptions = {}) {
    this.maxTurns = options.maxTurns ?? 50;
    this.customMcpServers = options.mcpServers;
  }

  /**
   * Review a pull request using parallel subagent analysis
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param prNumber - Pull request number
   * @returns Complete review report
   */
  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const startTime = Date.now();
    const model = process.env.ANTHROPIC_MODEL;

    if (!model) {
      throw new Error('ANTHROPIC_MODEL environment variable is required');
    }

    logger.info('Starting orchestrated review', { owner, repo, prNumber, model });

    const prompt = buildOrchestratorPrompt(owner, repo, prNumber);

    // Configure MCP servers - merge defaults with any custom servers
    const mcpServers: Options['mcpServers'] = {
      ...mcpServersConfig,
      ...this.customMcpServers
    };

    // Configure the SDK query options with safe permissions (no dangerous bypassing)
    const options: Options = {
      model,
      maxTurns: this.maxTurns,
      mcpServers,
      // Register all three subagents for Task tool invocation
      agents: {
        'code-quality-analyzer': codeQualityAnalyzer,
        'test-coverage-analyzer': testCoverageAnalyzer,
        'refactoring-suggester': refactoringSuggester
      },
      // Allow tools explicitly derived from connected MCP servers & core capabilities
      allowedTools: [...ORCHESTRATOR_ALLOWED_TOOLS],
      // Configure structured output to match ReviewReportSchema
      outputFormat: {
        type: 'json_schema' as const,
        schema: ReviewReportJSONSchema
      },
      cwd: process.env.PROJECT_ROOT || process.cwd()
    };

    let structuredOutput: unknown = null;

    // Execute the query and iterate over results
    const result = query({ prompt, options });

    for await (const message of result) {
      if (message.type === 'result') {
        if (message.subtype === 'success' && message.structured_output) {
          structuredOutput = message.structured_output;
          logger.info('Received structured output from orchestrator', {
            numTurns: message.num_turns,
            durationMs: message.duration_ms,
            costUsd: message.total_cost_usd
          });
        } else if (message.subtype !== 'success') {
          logger.error('Orchestrator query ended with error', {
            subtype: message.subtype,
            errors: 'errors' in message ? message.errors : undefined
          });
        }
      }
    }

    if (!structuredOutput) {
      throw new Error('Orchestrator did not produce structured output');
    }

    // Validate the output against the Zod schema
    const parseResult = ReviewReportSchema.safeParse(structuredOutput);

    if (!parseResult.success) {
      logger.error('Structured output validation failed', {
        errors: parseResult.error.issues
      });
      throw new Error(
        `Output validation failed: ${parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`
      );
    }

    const report = parseResult.data;

    // Update duration with actual elapsed time
    report.metadata.duration = Date.now() - startTime;

    logger.info('Review completed successfully', {
      owner,
      repo,
      prNumber,
      score: report.summary.overallScore,
      duration: report.metadata.duration,
      filesReviewed: report.summary.totalFiles
    });

    return report;
  }
}
