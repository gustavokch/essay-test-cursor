import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import type { AppConfig } from '../config.js';
import { retryWithExponentialBackoff } from '../utils/retry.js';

export interface EssayResult {
  content: string;
  model: string;
}

export async function generateEssay(
  prompt: string,
  config: AppConfig,
  language?: string
): Promise<EssayResult> {
  const openrouter = createOpenRouter({
    apiKey: config.openRouterApiKey,
  });
  const model = openrouter.chat(config.essayModel);

  const languageInstruction = language
    ? `\n\nImportant: Please write the essay in ${language}.`
    : '';

  const result = await retryWithExponentialBackoff(
    () =>
      generateText({
        model,
        messages: [
          {
            role: 'user',
            content: `Write a comprehensive essay on the following topic:\n\n${prompt}\n\nPlease write a well-structured essay with an introduction, body paragraphs, and a conclusion.${languageInstruction}`,
          },
        ],
      }),
    config.retryConfig
  );

  return {
    content: result.text,
    model: config.essayModel,
  };
}

export async function reviewEssay(
  essay: string,
  originalPrompt: string,
  config: AppConfig,
  language?: string
): Promise<EssayResult> {
  const openrouter = createOpenRouter({
    apiKey: config.openRouterApiKey,
  });
  const model = openrouter.chat(config.reviewModel);

  const languageInstruction = language
    ? `\n\nNote: The essay is written in ${language}. Please provide your feedback in the same language.`
    : '';

  const reviewPrompt = `You are an expert essay reviewer. Please review the following essay and provide constructive feedback.\n\nOriginal Prompt: ${originalPrompt}\n\nEssay to Review:\n\n${essay}\n\nPlease provide detailed feedback covering:\n1. Content quality and relevance to the prompt\n2. Structure and organization\n3. Clarity and coherence\n4. Areas for improvement\n5. Specific suggestions for enhancement\n\nFormat your feedback in a clear, actionable manner.${languageInstruction}`;

  const result = await retryWithExponentialBackoff(
    () =>
      generateText({
        model,
        messages: [
          {
            role: 'user',
            content: reviewPrompt,
          },
        ],
      }),
    config.retryConfig
  );

  return {
    content: result.text,
    model: config.reviewModel,
  };
}

export async function updateEssayWithFeedback(
  originalEssay: string,
  feedback: string,
  originalPrompt: string,
  config: AppConfig,
  language?: string
): Promise<EssayResult> {
  const openrouter = createOpenRouter({
    apiKey: config.openRouterApiKey,
  });
  const model = openrouter.chat(config.essayModel);

  const languageInstruction = language
    ? `\n\nImportant: Please write the revised essay in ${language}.`
    : '';

  const updatePrompt = `You wrote the following essay based on this prompt:\n\nOriginal Prompt: ${originalPrompt}\n\nYour Original Essay:\n\n${originalEssay}\n\nYou received the following feedback:\n\n${feedback}\n\nPlease revise your essay incorporating the feedback. Maintain the core content and structure while addressing the suggestions provided.${languageInstruction}`;

  const result = await retryWithExponentialBackoff(
    () =>
      generateText({
        model,
        messages: [
          {
            role: 'user',
            content: updatePrompt,
          },
        ],
      }),
    config.retryConfig
  );

  return {
    content: result.text,
    model: config.essayModel,
  };
}

