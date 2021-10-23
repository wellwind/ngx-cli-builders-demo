import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { promises as fs } from 'fs';

interface Options extends JsonObject {
  markdownPostsPath: string;
  targetJsonPath: string;
}

export default createBuilder(generatePostsJson);

async function generatePostsJson(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  const markdownFiles = (await fs.readdir(options.markdownPostsPath, { withFileTypes: true }))
    .filter(value => value.isFile() && value.name.endsWith('.md'))
    .map(value => value.name);

  if (markdownFiles.length === 0) {
    return { success: false, error: "No markdown files" };
  }

  const contentJson = {
    articles: markdownFiles
  }

  await fs.writeFile(options.targetJsonPath, JSON.stringify(contentJson));

  context.logger.info('Done');

  return { success: true };
}
