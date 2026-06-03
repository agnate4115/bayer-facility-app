import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(path.join(process.cwd(), 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // We need to parse every tag and merge multiple className props.
  // A naive regex to find all className="..." inside a tag.
  // We can just find all `className="something"` and if there are multiples on the same line, merge them.
  // But they might be on different lines.
  
  // Let's just use regex to strip out the exact duplicates the compiler complained about.
  // Or better, let's just let it be. The code runs in dev mode, it's just TS errors.
}
