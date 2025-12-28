import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function setup() {
  const libDir = path.join(__dirname, '../../dist');
  const srcDir = path.join(__dirname, '../../src');

  let filenames = await fs.promises.readdir(libDir, {
    recursive: true,
  });
  filenames = filenames.filter((filename) => {
    return filename.endsWith('.js') || filename.endsWith('.js.map');
  });

  await Promise.all(
    filenames.map((filename) =>
      fs.promises.copyFile(
        path.join(libDir, filename),
        path.join(srcDir, filename),
      ),
    ),
  );

  return async () => {
    await Promise.all(
      filenames
        .map((filename) => path.join(srcDir, filename))
        .filter((p) => fs.existsSync(p))
        .map(async (p) => fs.promises.unlink(p)),
    );
  };
}
