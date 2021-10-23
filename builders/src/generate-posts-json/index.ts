import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import * as fs from 'fs/promises';
import { watch } from 'chokidar';
import { defer, Observable } from 'rxjs';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';

interface Options extends JsonObject {
  markdownPostsPath: string;
  targetJsonPath: string;
  watch: boolean;
}

export default createBuilder(generatePostsJson);

function generatePostsJson(options: Options, context: BuilderContext): Observable<BuilderOutput> {
  const generateFile = async () => {
    const markdownFiles = (await fs.readdir(options.markdownPostsPath, { withFileTypes: true }))
      .filter(value => value.isFile() && value.name.endsWith('.md'))
      .map(value => value.name);

    const contentJson = {
      articles: markdownFiles
    }

    await fs.writeFile(options.targetJsonPath, JSON.stringify(contentJson));
  };

  const generateFile$ = defer(() => generateFile()).pipe(
    map(() => ({ success: true }))
  )

  const folderContentChange$ = new Observable(subscriber => {
    watch(options.markdownPostsPath).on('all', (_, path) => {
      if (path.endsWith('.md')) {
        subscriber.next(path);
      }
    });
  })

  if (options.watch) {
    // watch mode，當內容有變更時會重新產生檔案，由於這個 observable 不會 complete，因此會持續執行
    return folderContentChange$.pipe(
      debounceTime(700),
      tap(() => context.logger.info('產生 json 中...')),
      switchMap(() => generateFile$),
      tap(() => context.logger.info('完成'))
    );
  } else {
    // 不是 watch mode，直接產生檔案並回傳結果，由於這個 observable 會 complete，因此執行完就結束
    context.logger.info('產生 json 中...');
    return generateFile$.pipe(
      tap(() => context.logger.info('完成'))
    );
  }
}
