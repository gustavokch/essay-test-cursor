import { getConfig } from './config.js';
import {
  generateEssay,
  reviewEssay,
  updateEssayWithFeedback,
} from './services/essayService.js';
import { saveMarkdownFile, generateTimestamp } from './utils/fileUtils.js';

interface EssayWorkflowResult {
  originalEssay: EssayFile;
  feedback: EssayFile;
  updatedEssay: EssayFile;
}

interface EssayFile {
  content: string;
  filename: string;
  filepath: string;
  model: string;
}

async function runEssayWorkflow(prompt: string): Promise<EssayWorkflowResult> {
  const config = getConfig();
  const timestamp = generateTimestamp();

  console.log('🚀 Starting essay generation workflow...');
  console.log(`📝 Prompt: ${prompt}\n`);

  // Step 1: Generate initial essay
  console.log('📖 Step 1: Generating essay...');
  const essayResult = await generateEssay(prompt, config);
  const essayFilename = `essay-${timestamp}.md`;
  const essayFilepath = await saveMarkdownFile(
    `# Essay\n\n**Model:** ${essayResult.model}\n**Generated:** ${new Date().toISOString()}\n**Prompt:** ${prompt}\n\n---\n\n${essayResult.content}`,
    essayFilename
  );
  console.log(`✅ Essay saved to: ${essayFilepath}\n`);

  // Step 2: Review the essay
  console.log('🔍 Step 2: Reviewing essay...');
  const reviewResult = await reviewEssay(essayResult.content, prompt, config);
  const reviewFilename = `feedback-${timestamp}.md`;
  const reviewFilepath = await saveMarkdownFile(
    `# Essay Feedback\n\n**Review Model:** ${reviewResult.model}\n**Generated:** ${new Date().toISOString()}\n**Original Essay Model:** ${essayResult.model}\n\n---\n\n${reviewResult.content}`,
    reviewFilename
  );
  console.log(`✅ Feedback saved to: ${reviewFilepath}\n`);

  // Step 3: Update essay with feedback
  console.log('✏️  Step 3: Updating essay with feedback...');
  const updatedResult = await updateEssayWithFeedback(
    essayResult.content,
    reviewResult.content,
    prompt,
    config
  );
  const updatedFilename = `essay-updated-${timestamp}.md`;
  const updatedFilepath = await saveMarkdownFile(
    `# Updated Essay\n\n**Model:** ${updatedResult.model}\n**Generated:** ${new Date().toISOString()}\n**Original Prompt:** ${prompt}\n\n---\n\n${updatedResult.content}`,
    updatedFilename
  );
  console.log(`✅ Updated essay saved to: ${updatedFilepath}\n`);

  return {
    originalEssay: {
      content: essayResult.content,
      filename: essayFilename,
      filepath: essayFilepath,
      model: essayResult.model,
    },
    feedback: {
      content: reviewResult.content,
      filename: reviewFilename,
      filepath: reviewFilepath,
      model: reviewResult.model,
    },
    updatedEssay: {
      content: updatedResult.content,
      filename: updatedFilename,
      filepath: updatedFilepath,
      model: updatedResult.model,
    },
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Please provide an essay prompt as an argument.');
    console.log('\nUsage: bun run dev "Your essay prompt here"');
    console.log('   or: bun start "Your essay prompt here"');
    process.exit(1);
  }

  const prompt = args.join(' ');

  try {
    const result = await runEssayWorkflow(prompt);

    console.log('✨ Workflow completed successfully!\n');
    console.log('📁 Generated files:');
    console.log(`   - ${result.originalEssay.filepath}`);
    console.log(`   - ${result.feedback.filepath}`);
    console.log(`   - ${result.updatedEssay.filepath}`);
  } catch (error) {
    console.error('❌ Error during workflow execution:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

