import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveMarkdownFile(
  content: string,
  filename: string,
  outputDir: string = 'output'
): Promise<string> {
  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Create full file path
    const filePath = join(outputDir, filename);

    // Write file
    await writeFile(filePath, content, 'utf-8');

    return filePath;
  } catch (error) {
    throw new Error(`Failed to save markdown file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

