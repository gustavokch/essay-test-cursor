import { config } from 'dotenv';
import type { RetryConfig } from './utils/retry.js';

config();

export interface AppConfig {
  openRouterApiKey: string;
  essayModel: string;
  reviewModel: string;
  retryConfig: RetryConfig;
}

export function getConfig(): AppConfig {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const essayModel = process.env.ESSAY_MODEL;
  const reviewModel = process.env.REVIEW_MODEL;

  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is required in .env file');
  }

  if (!essayModel) {
    throw new Error('ESSAY_MODEL is required in .env file');
  }

  if (!reviewModel) {
    throw new Error('REVIEW_MODEL is required in .env file');
  }

  // Parse retry configuration with defaults
  const defaultRetryDelay = parseInt(process.env.DEFAULT_RETRY_DELAY || '10000', 10); // 10 seconds default
  const maxRetryDelay = 45000; // 45 seconds max
  const retryAttempts = parseInt(process.env.RETRY_ATTEMPTS || '5', 10); // 5 attempts default

  if (isNaN(defaultRetryDelay) || defaultRetryDelay < 0) {
    throw new Error('DEFAULT_RETRY_DELAY must be a positive number (in milliseconds)');
  }

  if (isNaN(retryAttempts) || retryAttempts < 1) {
    throw new Error('RETRY_ATTEMPTS must be a positive integer');
  }

  return {
    openRouterApiKey,
    essayModel,
    reviewModel,
    retryConfig: {
      maxAttempts: retryAttempts,
      initialDelayMs: defaultRetryDelay,
      maxDelayMs: maxRetryDelay,
    },
  };
}

