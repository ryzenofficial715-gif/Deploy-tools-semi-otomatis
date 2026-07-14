// ============================================
// DEPLOY TOOL - Semi Otomatis
// Auto ZIP Multi-File | Created by Ryzen
// ============================================

let uploadedFiles = []; // { name, content, size }

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const previewFrame = document.getElementById('previewFrame');
const btnPreview = document.getElementById('btnPreview');
const btnUseCode = document.getElementById('btnUseCode');
const btnDeployVercel = document.getElementById('btnDeployVercel');
const btnDeployNetlify = document.getElementById('btnDeployNetlify');
const infoBox = document.getElementById('infoBox');
const htmlEditor = document.getElementById('htmlEditor');
const cssEditor = document.getElementById('cssEditor');
const jsEditor = document.getElementById('jsEditor');

// ============================================
// Tab Switching
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// ============================================
// Upload File
// ============================================
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

async function handleFiles(files) {
    for (const file of files) {
        if (uploadedFiles.find(f => f.name === file.name && f.size === file.size)) continue;
        const content = await readFile(file);
        uploadedFiles.push({
            name: file.name,
            content: content,
            size: file.size,
        });
    }
    renderFileList();
}

function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

// ============================================
// Render File List
// ============================================
function renderFileList() {
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '<p style="color:#666;font-size:0.8em;text-align:center;">Belum ada file</p>';
        return;
    }

    const totalSize = uploadedFiles.reduce((s, f) => s + (f.size || f.content.length), 0);

    fileList.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#888; font-size:0.75em;">
            <span>${uploadedFiles.length} file</span>
            <span>Total: ${formatSize(totalSize)}</span>
        </div>
        ${uploadedFiles.map((f, i) => `
            <div class="file-item">
                <div class="file-info">
                    <span>${getFileIcon(f.name)}</span>
                    <span class="file-name" title="${f.name}">${f.name}</span>
                    <span class="file-size">${formatSize(f.size || f.content.length)}</span>
                </div>
                <button class="remove" onclick="removeFile(${i})">✕</button>
            </div>
        `).join('')}
    `;
}

function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { html: '🌐', htm: '🌐', css: '🎨', js: '⚡', json: '📋', md: '📝', txt: '📄', svg: '🖼️', zip: '📦' };
    return icons[ext] || '📄';
}

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// Use Code from Editor
// ============================================
btnUseCode.addEventListener('click', () => {
    const htmlCode = htmlEditor.value.trim();
    const cssCode = cssEditor.value.trim();
    const jsCode = jsEditor.value.trim();

    if (!htmlCode && !cssCode && !jsCode) {
        showToast('⚠️ Isi minimal satu editor dulu!');
        return;
    }

    uploadedFiles = [];

    if (htmlCode) {
        uploadedFiles.push({ name: 'index.html', content: htmlCode, size: htmlCode.length });
    }
    if (cssCode) {
        uploadedFiles.push({ name: 'style.css', content: cssCode, size: cssCode.length });
    }
    if (jsCode) {
        uploadedFiles.push({ name: 'script.js', content: jsCode, size: jsCode.length });
    }

    renderFileList();
    updatePreview();
    showToast('✅ Kode siap!');
});

// ============================================
// Preview
// ============================================
btnPreview.addEventListener('click', updatePreview);

function updatePreview() {
    const htmlFile = uploadedFiles.find(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    const cssFile = uploadedFiles.find(f => f.name.endsWith('.css'));
    const jsFile = uploadedFiles.find(f => f.name.endsWith('.js'));

    if (htmlFile) {
        let html = htmlFile.content;
        if (cssFile) {
            html = html.replace('</head>', `<style>${cssFile.content}</style></head>`);
            if (!html.includes('<style>')) {
                html = html.replace('<head>', `<head><style>${cssFile.content}</style>`);
            }
        }
        if (jsFile) {
            html = html.replace('</body>', `<script>${jsFile.content}</script></body>`);
        }
        previewFrame.srcdoc = html;
    } else if (uploadedFiles.length > 0) {
        const ext = uploadedFiles[0].name.split('.').pop();
        if (ext === 'css') {
            previewFrame.srcdoc = `<html><head><style>${uploadedFiles[0].content}</style></head><body><h1 style="color:#666;font-family:sans-serif;padding:40px;">Preview CSS</h1></body></html>`;
        } else if (ext === 'js') {
            previewFrame.srcdoc = `<html><body><h1 style="color:#666;font-family:sans-serif;padding:40px;">Preview JS - Buka Console</h1><script>${uploadedFiles[0].content}</script></body></html>`;
        } else {
            previewFrame.srcdoc = `<pre style="padding:20px;font-family:monospace;background:#111;color:#0f0;">${escapeHtml(uploadedFiles[0].content)}</pre>`;
        }
    } else {
        previewFrame.srcdoc = "<html><body style='display:flex;align-items:center;justify-content:center;height:100%;background:#f5f5f5;color:#999;font-family:sans-serif;'><p>👆 Masukkan kode dulu</p></body></html>";
    }
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================
// Generate & Download ZIP
// ============================================
async function generateZip() {
    const zip = new JSZip();
    uploadedFiles.forEach(f => {
        zip.file(f.name, f.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
}

function downloadZip(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// Deploy to Vercel
// ============================================
btnDeployVercel.addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        infoBox.innerHTML = '⚠️ <span>Upload file atau tulis kode dulu!</span>';
        infoBox.style.borderColor = 'var(--danger)';
        return;
    }

    infoBox.innerHTML = '📦 <span>Membuat ZIP...</span>';
    infoBox.style.borderColor = '#3a3a55';

    const blob = await generateZip();
    downloadZip(blob);

    infoBox.innerHTML = '✅ <span>ZIP terdownload!</span> Sekarang <b>drag & drop</b> file <b>project.zip</b> ke halaman Vercel.';
    infoBox.classList.add('success');
    showToast('📦 ZIP terdownload! Drag & drop ke Vercel.');

    setTimeout(() => {
        window.open('https://vercel.com/drop', '_blank');
    }, 500);
});

// ============================================
// Deploy to Netlify
// ============================================
btnDeployNetlify.addEventListener('click', async () => {
    if (uploadedFiles.length === 0) {
        infoBox.innerHTML = '⚠️ <span>Upload file atau tulis kode dulu!</span>';
        infoBox.style.borderColor = 'var(--danger)';
        return;
    }

    infoBox.innerHTML = '📦 <span>Membuat ZIP...</span>';
    infoBox.style.borderColor = '#3a3a55';

    const blob = await generateZip();
    downloadZip(blob);

    infoBox.innerHTML = '✅ <span>ZIP terdownload!</span> Sekarang <b>drag & drop</b> file <b>project.zip</b> ke halaman Netlify.';
    infoBox.classList.add('success');
    showToast('📦 ZIP terdownload! Drag & drop ke Netlify.');

    setTimeout(() => {
        window.open('https://app.netlify.com/drop', '_blank');
    }, 500);
});

// ============================================
// Toast
// ============================================
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

console.log('🚀 Deploy Tool - Semi Otomatis Ready');
console.log('💡 Upload file atau tulis kode → Preview → Deploy');
console.log('Created by Ryzen');
