import fs from 'fs';
import path from 'path';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Helper to read .env.local robustly
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    const firstEq = trimmedLine.indexOf('=');
    if (firstEq !== -1) {
        const key = trimmedLine.substring(0, firstEq).trim();
        const value = trimmedLine.substring(firstEq + 1).trim();
        env[key] = value;
    }
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log config keys to verify they are all there
Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`${key}: ${value ? 'OK' : 'MISSING'}`);
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const dir = 'public/Productos';
    const files = fs.readdirSync(dir);
    
    files.sort();

    const mainImages = files.filter(f => f.endsWith('.jpg') && !f.includes('_thumb') && f.startsWith('producto_'));
    
    console.log(`Found ${mainImages.length} already renamed images or ones to process.`);

    if (mainImages.length === 0) {
        // If not yet renamed, look for the old ones
        const oldImages = files.filter(f => f.endsWith('.jpg') && !f.includes('_thumb') && !f.startsWith('producto_'));
        console.log(`Found ${oldImages.length} old images to rename.`);
        
        let counter = 1;
        for (const file of oldImages) {
            const ext = path.extname(file);
            const newBaseName = `producto_${counter}`;
            const newName = `${newBaseName}${ext}`;
            const oldPath = path.join(dir, file);
            const newPath = path.join(dir, newName);

            fs.renameSync(oldPath, newPath);

            const thumbName = file.replace(ext, `_thumb${ext}`);
            if (files.includes(thumbName)) {
                const oldThumbPath = path.join(dir, thumbName);
                const newThumbPath = path.join(dir, `${newBaseName}_thumb${ext}`);
                fs.renameSync(oldThumbPath, newThumbPath);
            }
            mainImages.push(newName);
            counter++;
        }
    }

    let counter = 1;
    for (const file of mainImages) {
        try {
            const productData = {
                title: `Foto ${counter}`,
                description: `Descripción ${counter}`,
                price: Number(counter),
                category: "Cuadernos",
                imageUrl: `/Productos/${file}`,
                createdAt: Date.now(),
                sales: 0
            };
            
            console.log(`Adding ${file}...`);
            await addDoc(collection(db, "products"), productData);
            console.log(`Success: ${file}`);
        } catch (e) {
            console.error(`Error adding ${file}:`, e.message);
            // If we get an error, let's stop and see why
            process.exit(1);
        }
        counter++;
    }

    console.log("Done!");
    process.exit(0);
}

run().catch(console.error);
