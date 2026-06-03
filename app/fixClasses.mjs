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

  // Find tags with multiple className="..."
  // This is a bit tricky because of newlines in props.
  // We'll split the file by '<' and '>' to process tags.
  // To avoid breaking on arrow functions (e.g., `<T>`), we use a heuristic:
  // A tag starts with a letter, optionally has a namespace or dash.
  let regex = /<([A-Za-z][A-Za-z0-9_.-]*)([^>]*?)>/g;
  
  content = content.replace(regex, (match, tag, propsStr) => {
    // Check if there are multiple className="..."
    let classMatches = [...propsStr.matchAll(/\bclassName=(["'])(.*?)\1/g)];
    if (classMatches.length <= 1) return match;

    // We have duplicates!
    let mergedClasses = [];
    let newProps = propsStr.replace(/\bclassName=(["'])(.*?)\1/g, (m, quote, cls) => {
      mergedClasses.push(cls);
      return ''; // remove all
    });

    // append merged className
    let combined = mergedClasses.join(' ').replace(/\s+/g, ' ').trim();
    return `<${tag}${newProps} className="${combined}">`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Fixed duplicates in ${file}`);
  }
}
