import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 * Usage: npm run dev <owner> <repo> <pr-number>
 */
async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error('❌ Missing required arguments');
    console.error('Usage: npm run dev -- <owner> <repo> <pr-number>');
    console.error('Example: npm run dev -- octocat Hello-World 1');
    process.exit(1);
  }

  const prNumber = parseInt(prStr, 10);
  if (isNaN(prNumber) || prNumber <= 0) {
    console.error('❌ PR number must be a positive integer');
    console.error(`Received: "${prStr}"`);
    process.exit(1);
  }

  // Validate authentication (choose ONE method)
  const hasAnthropicAPI = !!process.env.ANTHROPIC_API_KEY;
  const hasAWSCredentials = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

  if (!hasAnthropicAPI && !hasAWSCredentials) {
    console.error('❌ Authentication required. Set one of:');
    console.error('  - ANTHROPIC_API_KEY, or');
    console.error('  - AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION');
    process.exit(1);
  }

  if (hasAWSCredentials) {
    if (!process.env.AWS_REGION) {
      console.error('❌ AWS_REGION is required when using AWS Bedrock authentication');
      process.exit(1);
    }
    console.log('🔐 Using AWS Bedrock authentication');
  } else {
    console.log('🔐 Using Anthropic API authentication');
  }

  // Validate ANTHROPIC_MODEL environment variable
  if (!process.env.ANTHROPIC_MODEL) {
    console.error('❌ ANTHROPIC_MODEL environment variable is required');
    console.error('Set it in your .env file:');
    console.error('  - For Anthropic API: ANTHROPIC_MODEL=claude-sonnet-4-5-20250929');
    console.error('  - For AWS Bedrock: ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-5-20250929-v1:0');
    process.exit(1);
  }

  console.log(`\n🔍 Reviewing PR: ${owner}/${repo}#${prNumber}`);
  console.log(`📋 Model: ${process.env.ANTHROPIC_MODEL}\n`);

  try {
    // Create orchestrator instance and run review
    const orchestrator = new CodeReviewOrchestrator();
    const result = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    // Generate formatted reports
    const reportGenerator = new ReportGenerator();
    const reportsDir = path.join(process.cwd(), 'reports');

    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const baseFilename = `${owner}_${repo}_${prNumber}`;

    // Generate and save Markdown report
    const markdownReport = reportGenerator.generateMarkdownReport(result);
    const mdPath = path.join(reportsDir, `${baseFilename}.md`);
    fs.writeFileSync(mdPath, markdownReport, 'utf-8');
    console.log(`📄 Markdown report saved: ${mdPath}`);

    // Generate and save HTML report
    const htmlReport = reportGenerator.generateHTMLReport(result);
    const htmlPath = path.join(reportsDir, `${baseFilename}.html`);
    fs.writeFileSync(htmlPath, htmlReport, 'utf-8');
    console.log(`🌐 HTML report saved: ${htmlPath}`);

    // Generate and save JSON report
    const jsonReport = reportGenerator.generateJSONReport(result);
    const jsonPath = path.join(reportsDir, `${baseFilename}.json`);
    fs.writeFileSync(jsonPath, jsonReport, 'utf-8');
    console.log(`📊 JSON report saved: ${jsonPath}`);

    console.log(`\n✅ Review complete! Overall score: ${result.summary.overallScore}/100`);
    console.log(`📁 Reports saved to: ${reportsDir}`);
  } catch (error) {
    logger.error('Review failed', { error: error instanceof Error ? error.message : String(error) });
    console.error(`\n❌ Review failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
