import * as fs from 'fs';
import * as path from 'path';

const execPath = process.cwd();
// Array of accepted file extensions
const ACCEPTED_EXTENSIONS = ['.cs', '.txt', '.json', '.md', '.ts', '.tsx', '.js', '.jsx'];
// Directories to skip
const SKIP_DIRS = ['node_modules', 'obj', 'bin', 'testing', '.git', 'dist', 'build', '.next'];

// Get source and destination directories from command-line arguments
const sourceDir = process.argv[2];
const destDir = process.argv[3];

if (!sourceDir || !destDir) {
  console.error('Usage: yarn dump <source_directory> <destination_directory>');
  process.exit(1);
}

// Ensure the source directory exists
if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory does not exist: ${sourceDir}`);
  process.exit(1);
}

// Ensure the destination directory exists
try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
} catch (error) {
  console.error(`Error creating destination directory: ${error}`);
  process.exit(1);
}

console.log(`Starting to process files from: ${sourceDir}`);
console.log(`Accepted extensions: ${ACCEPTED_EXTENSIONS.join(', ')}`);
console.log(`Destination directory: ${destDir}`);
console.log();

let processedCount = 0;
let errorCount = 0;

// Copy files with accepted extensions while avoiding specified directories
const processDirectory = (sourceDir: string) => {
  try {
    const filesAndDirs = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const item of filesAndDirs) {
      const itemPath = path.join(sourceDir, item.name);

      // Skip specified directories
      if (item.isDirectory() && SKIP_DIRS.includes(item.name)) {
        continue;
      }

      // Recursively process directories
      if (item.isDirectory()) {
        processDirectory(itemPath);
        continue;
      }

      // Process files with accepted extensions
      if (item.isFile() && ACCEPTED_EXTENSIONS.includes(path.extname(item.name))) {
        try {
          processedCount++;
          const relativePath = path.relative(execPath, itemPath);
          const destFilePath = handleFileNameConflicts(destDir, path.basename(itemPath));

          // Create a temporary file with the original path as a comment
          const tempFilePath = path.join(
            destDir,
            `temp_${processedCount}${path.extname(itemPath)}`
          );
          const fileContent = `// Original path: ${relativePath}\n${fs.readFileSync(itemPath, 'utf-8')}`;

          fs.writeFileSync(tempFilePath, fileContent);
          fs.renameSync(tempFilePath, destFilePath);

          console.log(`Processed: ${relativePath}`);
        } catch (error) {
          errorCount++;
          console.error(`Error processing file ${itemPath}: ${error}`);
        }
      }
    }
  } catch (error) {
    errorCount++;
    console.error(`Error processing directory ${sourceDir}: ${error}`);
  }
};

// Handle file name conflicts by appending a counter to the file name
const handleFileNameConflicts = (directory: string, fileName: string): string => {
  const baseName = path.basename(fileName, path.extname(fileName));
  const extension = path.extname(fileName);
  let finalPath = path.join(directory, fileName);
  let counter = 0;

  while (fs.existsSync(finalPath)) {
    counter++;
    finalPath = path.join(directory, `${baseName}_${counter}${extension}`);
  }

  return finalPath;
};

// Process the specified source directory
try {
  processDirectory(sourceDir);
} catch (error) {
  console.error(`Error processing source directory: ${error}`);
  process.exit(1);
}

console.log('\nProcessing complete:');
console.log(`- Successfully processed: ${processedCount} files`);
console.log(`- Errors encountered: ${errorCount}`);

if (errorCount > 0) {
  process.exit(1);
}
