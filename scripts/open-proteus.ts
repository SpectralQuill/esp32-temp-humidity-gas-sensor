// open-latest-proteus.ts
import { exec, spawn } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';

// All possible Proteus executable paths
const PROTEUS_PATHS = [
    // Proteus 9
    'C:\\Program Files\\Labcenter Electronics\\Proteus 9 Professional\\BIN\\PDS.EXE',
    'C:\\Program Files (x86)\\Labcenter Electronics\\Proteus 9 Professional\\BIN\\PDS.EXE',
    
    // Proteus 8
    'C:\\Program Files\\Labcenter Electronics\\Proteus 8 Professional\\BIN\\PDS.EXE',
    'C:\\Program Files (x86)\\Labcenter Electronics\\Proteus 8 Professional\\BIN\\PDS.EXE',
    
    // Proteus 7
    'C:\\Program Files\\Labcenter Electronics\\Proteus 7 Professional\\BIN\\ISIS.EXE',
    'C:\\Program Files (x86)\\Labcenter Electronics\\Proteus 7 Professional\\BIN\\ISIS.EXE',
    
    // Proteus 6
    'C:\\Program Files\\Labcenter Electronics\\Proteus 6 Professional\\BIN\\ISIS.EXE',
    'C:\\Program Files (x86)\\Labcenter Electronics\\Proteus 6 Professional\\BIN\\ISIS.EXE',
    
    // Alternative locations
    'D:\\Program Files\\Labcenter Electronics\\Proteus 8 Professional\\BIN\\PDS.EXE',
    'E:\\Program Files\\Labcenter Electronics\\Proteus 8 Professional\\BIN\\PDS.EXE',
];

// Regex to match versioned files like "project_v1.pdsprj", "circuit_v2.3.pdsprj"
const VERSION_PATTERN = /v(\d+(\.\d+)?)\.pdsprj$/i;

function findProteusExecutable(): string | null {
    for (const path of PROTEUS_PATHS) {
        if (existsSync(path)) {
            return path;
        }
    }
    return null;
}

function getLatestVersionedFile(proteusFolder: string = 'proteus'): string | null {
    try {
        const folderPath = resolve(proteusFolder);
        
        if (!existsSync(folderPath)) {
            console.error(`❌ Folder not found: ${folderPath}`);
            return null;
        }
        
        // Get all .pdsprj files matching version pattern
        const files = readdirSync(folderPath)
        .filter(file => file.toLowerCase().endsWith('.pdsprj') && VERSION_PATTERN.test(file))
        .map(file => ({
            name: file,
            path: join(folderPath, file),
            modified: statSync(join(folderPath, file)).mtime.getTime(),
            version: parseFloat(file.match(VERSION_PATTERN)![1])
        }))
        .sort((a, b) => {
            // Sort by version number (descending) first, then by modification date
            if (b.version !== a.version) {
                return b.version - a.version;
            }
            return b.modified - a.modified;
        });
        
        if (files.length === 0) {
            console.log(`📁 No versioned .pdsprj files found in "${proteusFolder}/"`);
            console.log(`   Looking for files matching pattern: *_v[number].pdsprj`);
            return null;
        }
        
        console.log(`📊 Found ${files.length} versioned Proteus files:`);
        files.forEach((file, index) => {
            const date = new Date(file.modified).toLocaleDateString();
            console.log(`   ${index + 1}. ${file.name} (v${file.version}, modified: ${date})`);
        });
        
        return files[0].path;
        
    } catch (error) {
        console.error('❌ Error reading Proteus folder:', error instanceof Error ? error.message : error);
        return null;
    }
}

function openFileWithProteus(filePath: string): void {
    const proteusPath = findProteusExecutable();

    if (!proteusPath) {
        console.error('❌ Proteus not found! Tried these locations:');
        PROTEUS_PATHS.forEach(path => console.log(`   • ${path}`));
        console.log(`\n📁 You can open the file manually: ${filePath}`);
        return;
    }

    console.log(`🚀 Opening with: ${proteusPath}`);
    console.log(`📂 File: ${filePath}`);

    // Open with Proteus
    const command = `"${proteusPath}" "${filePath}"`;

    exec(command, (error) => {
        if (error) {
            console.error(`❌ Failed to open: ${error.message}`);
            console.log(`💡 Try opening manually from: ${filePath}`);
        } else {
            console.log('✅ Proteus launched successfully');
        }
    });
}

// function openFileWithProteus(filePath: string): void {
//   const proteusPath = findProteusExecutable();

//   if (!proteusPath) {
//     console.error('❌ Proteus not found!');
//     PROTEUS_PATHS.forEach(path => console.log(`   • ${path}`));
//     console.log(`\n📁 File location: ${filePath}`);
//     return;
//   }

//   console.log(`🚀 Opening with: ${proteusPath}`);
//   console.log(`📂 File: ${filePath}`);

//   try {
//     // Launch Proteus as a detached process
//     const proteusProcess = spawn(proteusPath, [filePath], {
//       detached: true,      // Detach from parent process
//       stdio: 'ignore',     // Don't attach stdin/stdout/stderr
//       windowsHide: true    // Hide the terminal window on Windows
//     });

//     // Unref the child process so parent can exit independently
//     proteusProcess.unref();

//     console.log('✅ Proteus launched in background');
//     console.log('📝 Script will now exit - Proteus will stay open');

//     // Exit immediately
//     process.exit(0);

//   } catch (error) {
//     console.error(`❌ Failed to launch Proteus: ${error instanceof Error ? error.message : error}`);
//     console.log(`💡 Try opening manually: ${filePath}`);
//     process.exit(1);
//   }
// }

// function openFileWithProteus(filePath: string): void {
//     const proteusPath = findProteusExecutable();
    
//     if (!proteusPath) {
//         console.error('❌ Proteus not found in these locations:');
//         PROTEUS_PATHS.forEach(p => console.log(`   ${p}`));
//         console.log(`\n📁 You can manually open: ${filePath}`);
//         process.exit(1);
//     }
    
//     console.log(`🚀 Opening: ${filePath}`);
//     console.log(`🔧 Using: ${proteusPath}`);
    
//     try {
//         // Launch Proteus - use 'cmd /c' to properly handle Windows paths with spaces
//         const command = `"${proteusPath}" "${filePath}"`;
        
//         // Method 1: Using cmd /c (most reliable on Windows)
//         const proteus = spawn('cmd.exe', ['/c', command], {
//             detached: true,
//             stdio: 'ignore',
//             windowsHide: true
//         });
        
//         // Alternative: Direct spawn (might work depending on Proteus version)
//         // const proteus = spawn(proteusPath, [filePath], {
//         //   detached: true,
//         //   stdio: 'ignore',
//         //   windowsHide: true,
//         //   shell: true  // Try with shell: true if above doesn't work
//         // });
        
//         // Give it time to launch
//         console.log('⏳ Launching Proteus...');
        
//         // Wait a bit before exiting
//         setTimeout(() => {
//             console.log('✅ Proteus should now be open');
//             console.log('📝 Script exiting - Proteus remains open');
//             process.exit(0);
//         }, 3000); // 3 seconds should be enough
        
//         // Optional: Listen for errors
//         proteus.on('error', (error) => {
//             console.error('❌ Failed to launch Proteus:', error.message);
//             process.exit(1);
//         });
        
//         // Unref to allow Node.js to exit
//         proteus.unref();
        
//     } catch (error) {
//         console.error('❌ Failed to launch:', error instanceof Error ? error.message : error);
//         process.exit(1);
//     }
// }

// Main execution
console.log('🔌 Proteus Latest Version Opener');
console.log('='.repeat(50));

const latestFile = getLatestVersionedFile('proteus');

if (latestFile) {
    console.log(`\n🎯 Opening latest version: ${latestFile}`);
    openFileWithProteus(latestFile);
} else {
    // Fallback: try to find any .pdsprj file
    try {
        const fallbackFolder = resolve('proteus');
        if (existsSync(fallbackFolder)) {
            const allFiles = readdirSync(fallbackFolder)
            .filter(file => file.toLowerCase().endsWith('.pdsprj'))
            .map(file => join(fallbackFolder, file));
            
            if (allFiles.length > 0) {
                console.log(`\n📁 Found non-versioned files:`);
                allFiles.forEach(file => console.log(`   • ${file}`));
                console.log(`\n💡 Tip: Rename files to match *_v1.pdsprj pattern for auto-detection`);
            }
        }
    } catch {
        // Ignore errors in fallback
    }
    
    process.exit(1);
}
