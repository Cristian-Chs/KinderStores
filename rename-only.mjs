import fs from 'fs';
import path from 'path';

const dir = 'public/Productos';
const files = fs.readdirSync(dir);

// Group files: basenames that are not already "producto_N"
// We want to skip those already renamed to avoid double counting or errors
const oldFiles = files.filter(f => !f.startsWith('producto_'));

// Sort main images (exclude thumbs)
const mainImages = oldFiles.filter(f => f.endsWith('.jpg') && !f.includes('_thumb'));
mainImages.sort();

console.log(`Renaming ${mainImages.length} images...`);

// Find the next available number (if some were already renamed)
const renamedFiles = files.filter(f => f.startsWith('producto_') && !f.includes('_thumb'));
let counter = renamedFiles.length + 1;

for (const file of mainImages) {
    const ext = path.extname(file);
    const newBaseName = `producto_${counter}`;
    const newName = `${newBaseName}${ext}`;
    
    console.log(`Renaming ${file} to ${newName}`);
    
    try {
        fs.renameSync(path.join(dir, file), path.join(dir, newName));
        
        // Thumbnail
        const thumbName = file.replace(ext, `_thumb${ext}`);
        if (fs.existsSync(path.join(dir, thumbName))) {
            fs.renameSync(path.join(dir, thumbName), path.join(dir, `${newBaseName}_thumb${ext}`));
        }
    } catch (e) {
        console.error(`Failed to rename ${file}:`, e.message);
    }
    
    counter++;
}

console.log("Renaming finished.");
