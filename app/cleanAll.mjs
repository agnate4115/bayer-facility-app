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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(path.join(process.cwd(), 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // 1. Remove all dark: classes globally
  // Matches dark: followed by word characters, dashes, brackets, slashes, hash, percent
  content = content.replace(/\bdark:[a-zA-Z0-9\-\[\]\/#%]+\b/g, '');

  // 2. Fix multiple classNames in tags (handling multi-line tags)
  // [^>] doesn't rely on dot, so it inherently handles newlines.
  const regex = /<([A-Za-z][A-Za-z0-9_.-]*)([^>]*?)>/g;
  content = content.replace(regex, (match, tag, propsStr) => {
    // find all classNames
    let classMatches = [...propsStr.matchAll(/\bclassName=(["'])(.*?)\1/g)];
    if (classMatches.length <= 1) return match;

    let mergedClasses = [];
    let newProps = propsStr.replace(/\bclassName=(["'])(.*?)\1/g, (m, quote, cls) => {
      if (cls.trim() !== '') {
        mergedClasses.push(cls.trim());
      }
      return ''; // remove it
    });

    if (mergedClasses.length > 0) {
      let combined = mergedClasses.join(' ').replace(/\s+/g, ' ').trim();
      return `<${tag}${newProps} className="${combined}">`;
    } else {
      return `<${tag}${newProps}>`;
    }
  });
  
  // 3. Remove stray `className=""` anywhere just in case
  content = content.replace(/\bclassName=(["'])(\1)/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Cleaned ${file}`);
  }
}
