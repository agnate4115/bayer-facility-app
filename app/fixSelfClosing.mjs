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

  // fix: `/ className="something">` -> `className="something" />`
  content = content.replace(/\/\s*(className=(["']).*?\2)>/g, '$1 />');
  
  // fix `<tag ... className="something" />>` -> `/>`
  content = content.replace(/\/>>/g, '/>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed self-closing tags in ${file}`);
  }
}
