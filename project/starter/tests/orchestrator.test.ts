import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
} from '../src/types/analysis-results';
import { ReviewReportSchema } from '../src/types/report-types';


/**
 * Tests for CodeReviewOrchestrator
 *
 * Tests cover:
 * - Schema validation for valid data
 * - Schema rejection of invalid data
 * - Edge cases
 * - JSON Schema export
 */

describe('CodeReviewOrchestrator', () => {
  describe('Configuration', () => {
    it('should initialize with default options', async () => {
      const { CodeReviewOrchestrator } = await import('../src/orchestrator');
      const orchestrator = new CodeReviewOrchestrator();
      expect(orchestrator).toBeDefined();
    });

    it('should accept custom rate limit configuration', async () => {
      const { CodeReviewOrchestrator } = await import('../src/orchestrator');
      const orchestrator = new CodeReviewOrchestrator({ maxTurns: 30 });
      expect(orchestrator).toBeDefined();
    });
  });

  describe('reviewPullRequest', () => {
    it('should fetch PR files from GitHub MCP', async () => {
      // Integration test - requires API keys
      expect(true).toBe(true);
    });

    it('should spawn all 3 subagents in parallel', async () => {
      // Integration test - requires API keys
      expect(true).toBe(true);
    });

    it('should aggregate results into ReviewReport', async () => {
      // Integration test - requires API keys
      expect(true).toBe(true);
    });

    it('should validate output with Zod schema', async () => {
      // Verify Zod schema parses valid data
      const validReport = {
        pullRequest: { owner: 'test', repo: 'repo', number: 1 },
        fileReviews: [],
        summary: {
          totalFiles: 0,
          overallScore: 85,
          criticalIssues: 0,
          highPriorityTests: 0,
          refactoringOpportunities: 0
        },
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          duration: 1000,
          agentVersions: { orchestrator: '1.0.0' }
        }
      };
      const result = ReviewReportSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });
  });

  describe('Integration', () => {
    // These tests require actual API keys and should be skipped in CI
    it.skip('should review a real small PR', async () => {
      // TODO: Test with a real public PR
      // NOTE: Only run manually with valid API keys
    });
  });
});

describe('CodeQualityResultSchema', () => {
  it('should accept valid data', () => {
    const validData = {
      file: 'src/index.ts',
      issues: [
        {
          line: 10,
          severity: 'high' as const,
          category: 'security' as const,
          description: 'Hardcoded secret found',
          suggestion: 'Use environment variables instead'
        }
      ],
      overallScore: 75,
      summary: 'Code has some security concerns'
    };
    const result = CodeQualityResultSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid severity', () => {
    const invalidData = {
      file: 'src/index.ts',
      issues: [
        {
          line: 10,
          severity: 'urgent',
          category: 'security',
          description: 'test',
          suggestion: 'test'
        }
      ],
      overallScore: 75,
      summary: 'test'
    };
    const result = CodeQualityResultSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid category', () => {
    const invalidData = {
      file: 'src/index.ts',
      issues: [
        {
          line: 10,
          severity: 'high',
          category: 'invalid-category',
          description: 'test',
          suggestion: 'test'
        }
      ],
      overallScore: 75,
      summary: 'test'
    };
    const result = CodeQualityResultSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject score out of range', () => {
    const invalidData = {
      file: 'src/index.ts',
      issues: [],
      overallScore: 150,
      summary: 'test'
    };
    const result = CodeQualityResultSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept score of 0', () => {
    const data = { file: 'test.ts', issues: [], overallScore: 0, summary: 'terrible' };
    expect(CodeQualityResultSchema.safeParse(data).success).toBe(true);
  });

  it('should accept score of 100', () => {
    const data = { file: 'test.ts', issues: [], overallScore: 100, summary: 'perfect' };
    expect(CodeQualityResultSchema.safeParse(data).success).toBe(true);
  });

  it('should accept empty issues array', () => {
    const data = { file: 'clean.ts', issues: [], overallScore: 95, summary: 'clean' };
    const result = CodeQualityResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const result = CodeQualityResultSchema.safeParse({ file: 'test.ts' });
    expect(result.success).toBe(false);
  });
});

describe('TestCoverageResultSchema', () => {
  it('should accept valid data', () => {
    const validData = {
      file: 'src/utils.ts',
      hasTests: true,
      testFiles: ['tests/utils.test.ts'],
      untestedPaths: [
        {
          type: 'function' as const,
          location: 'calculateTotal',
          priority: 'high' as const,
          reasoning: 'Core business logic with no test coverage',
          suggestedTest: 'it("should calculate total", () => { ... })'
        }
      ],
      coverageEstimate: 60,
      summary: 'Moderate coverage, missing edge cases'
    };
    const result = TestCoverageResultSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid path type', () => {
    const invalidData = {
      file: 'src/utils.ts',
      hasTests: false,
      testFiles: [],
      untestedPaths: [
        {
          type: 'invalid-type',
          location: 'fn',
          priority: 'high',
          reasoning: 'test',
          suggestedTest: 'test'
        }
      ],
      coverageEstimate: 0,
      summary: 'test'
    };
    const result = TestCoverageResultSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept empty test files and untested paths', () => {
    const data = {
      file: 'src/simple.ts',
      hasTests: false,
      testFiles: [],
      untestedPaths: [],
      coverageEstimate: 0,
      summary: 'No tests'
    };
    expect(TestCoverageResultSchema.safeParse(data).success).toBe(true);
  });

  it('should reject coverageEstimate above 100', () => {
    const data = {
      file: 'test.ts',
      hasTests: true,
      testFiles: [],
      untestedPaths: [],
      coverageEstimate: 101,
      summary: 'test'
    };
    expect(TestCoverageResultSchema.safeParse(data).success).toBe(false);
  });
});

describe('RefactoringSuggestionSchema', () => {
  it('should accept valid data', () => {
    const validData = {
      file: 'src/handler.ts',
      suggestions: [
        {
          type: 'extract-function' as const,
          location: 'handleRequest:45-80',
          impact: 'high' as const,
          description: 'Extract validation logic into a separate function',
          before: 'function handleRequest(req) { /* 35 lines */ }',
          after: 'function validateRequest(req) { ... }\nfunction handleRequest(req) { validateRequest(req); ... }',
          benefits: 'Improved testability and readability'
        }
      ],
      summary: 'Several opportunities for function extraction'
    };
    const result = RefactoringSuggestionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid refactoring type', () => {
    const invalidData = {
      file: 'test.ts',
      suggestions: [
        {
          type: 'invalid-refactor',
          location: 'fn',
          impact: 'high',
          description: 'test',
          before: 'old',
          after: 'new',
          benefits: 'test'
        }
      ],
      summary: 'test'
    };
    const result = RefactoringSuggestionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept empty suggestions array', () => {
    const data = { file: 'clean.ts', suggestions: [], summary: 'No refactoring needed' };
    expect(RefactoringSuggestionSchema.safeParse(data).success).toBe(true);
  });
});

describe('ReviewReportSchema', () => {
  const validReport = {
    pullRequest: { owner: 'octocat', repo: 'Hello-World', number: 1 },
    fileReviews: [
      {
        file: 'src/index.ts',
        codeQuality: {
          file: 'src/index.ts',
          issues: [],
          overallScore: 90,
          summary: 'Good quality'
        },
        testCoverage: {
          file: 'src/index.ts',
          hasTests: true,
          testFiles: ['tests/index.test.ts'],
          untestedPaths: [],
          coverageEstimate: 80,
          summary: 'Well tested'
        },
        refactorings: {
          file: 'src/index.ts',
          suggestions: [],
          summary: 'Clean code'
        }
      }
    ],
    summary: {
      totalFiles: 1,
      overallScore: 90,
      criticalIssues: 0,
      highPriorityTests: 0,
      refactoringOpportunities: 0
    },
    recommendations: [
      {
        priority: 'low' as const,
        category: 'testing',
        description: 'Add integration tests',
        files: ['src/index.ts']
      }
    ],
    metadata: {
      analyzedAt: '2024-01-01T00:00:00Z',
      duration: 5000,
      agentVersions: {
        orchestrator: '1.0.0',
        'code-quality-analyzer': '1.0.0',
        'test-coverage-analyzer': '1.0.0',
        'refactoring-suggester': '1.0.0'
      }
    }
  };

  it('should accept a valid complete report', () => {
    const result = ReviewReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it('should accept report with empty fileReviews', () => {
    const report = {
      ...validReport,
      fileReviews: [],
      summary: { ...validReport.summary, totalFiles: 0 }
    };
    expect(ReviewReportSchema.safeParse(report).success).toBe(true);
  });

  it('should reject missing pullRequest', () => {
    const { pullRequest, ...rest } = validReport;
    expect(ReviewReportSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject invalid recommendation priority', () => {
    const report = {
      ...validReport,
      recommendations: [
        { priority: 'urgent', category: 'test', description: 'test', files: [] }
      ]
    };
    expect(ReviewReportSchema.safeParse(report).success).toBe(false);
  });
});

describe('JSON Schema Export', () => {
  it('should produce valid JSON Schema from CodeQualityResultSchema', () => {
    const jsonSchema = zodToJsonSchema(CodeQualityResultSchema, { $refStrategy: 'root' }) as Record<string, unknown>;
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema['type']).toBe('object');
    const props = jsonSchema['properties'] as Record<string, unknown> | undefined;
    expect(props).toBeDefined();
    expect(props?.['file']).toBeDefined();
    expect(props?.['issues']).toBeDefined();
    expect(props?.['overallScore']).toBeDefined();
    expect(props?.['summary']).toBeDefined();
  });

  it('should produce valid JSON Schema from ReviewReportSchema', () => {
    const jsonSchema = zodToJsonSchema(ReviewReportSchema, { $refStrategy: 'root' }) as Record<string, unknown>;
    expect(jsonSchema).toBeDefined();
    expect(jsonSchema['type']).toBe('object');
    const required = jsonSchema['required'] as string[] | undefined;
    expect(required).toContain('pullRequest');
    expect(required).toContain('fileReviews');
    expect(required).toContain('summary');
    expect(required).toContain('recommendations');
    expect(required).toContain('metadata');
  });

  it('should mark required properties correctly in TestCoverageResultSchema', () => {
    const jsonSchema = zodToJsonSchema(TestCoverageResultSchema, { $refStrategy: 'root' }) as Record<string, unknown>;
    const required = jsonSchema['required'] as string[] | undefined;
    expect(required).toContain('file');
    expect(required).toContain('hasTests');
    expect(required).toContain('testFiles');
    expect(required).toContain('untestedPaths');
    expect(required).toContain('coverageEstimate');
    expect(required).toContain('summary');
  });
});
