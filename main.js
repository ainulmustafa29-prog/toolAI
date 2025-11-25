// Load auth.js script dynamically if not already loaded
function loadAuthScript() {
    if (!document.querySelector('script[src="auth.js"]')) {
        const script = document.createElement('script');
        script.src = 'auth.js';
        script.onload = function() {
            // Initialize auth after script loads
            if (typeof initAuth === 'function') {
                setTimeout(() => {
                    initAuth();
                }, 100);
            }
        };
        document.head.appendChild(script);
    } else if (typeof initAuth === 'function') {
        // Script already loaded, just initialize
        setTimeout(() => {
            initAuth();
        }, 100);
    }
}

// Dynamic Header and Footer Inclusion
document.addEventListener('DOMContentLoaded', function() {
    // Load auth.js first
    loadAuthScript();
    
    // Load Header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initializeDarkMode();
            initializeNavbar();
            // Initialize authentication after header loads
            setTimeout(() => {
                if (typeof initAuth === 'function') {
                    initAuth();
                } else {
                    // Retry if auth.js hasn't loaded yet
                    setTimeout(() => {
                        if (typeof initAuth === 'function') {
                            initAuth();
                        }
                    }, 500);
                }
            }, 200);
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
            initializeNewsletter();
        })
        .catch(error => console.error('Error loading footer:', error));
});

// Dark Mode Toggle
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<span id="darkModeIcon">☀️</span>';
        }
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.getElementById('darkModeIcon');
            if (icon) {
                icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
        });
    }
}

// Initialize Dark Mode on page load
function initializeDarkModeOnLoad() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const icon = document.getElementById('darkModeIcon');
        if (icon) {
            icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Initialize on page load
initializeDarkModeOnLoad();

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById('toolSearch');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTools(this.value.toLowerCase());
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterTools(this.value.toLowerCase());
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.getElementById('toolSearch');
            if (searchInput) {
                filterTools(searchInput.value.toLowerCase());
            }
        });
    }
}

function filterTools(searchTerm) {
    const toolCards = document.querySelectorAll('.tool-card');
    let visibleCount = 0;
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('h5').textContent.toLowerCase();
        const toolDesc = card.querySelector('p').textContent.toLowerCase();
        const matches = toolName.includes(searchTerm) || toolDesc.includes(searchTerm);
        
        if (matches) {
            card.style.display = 'block';
            card.classList.add('fade-in');
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show message if no results
    const noResultsMsg = document.getElementById('noResults');
    if (visibleCount === 0 && searchTerm) {
        if (!noResultsMsg) {
            const msg = document.createElement('div');
            msg.id = 'noResults';
            msg.className = 'alert alert-info text-center mt-4';
            msg.innerHTML = '<h5>No tools found matching "' + searchTerm + '"</h5><p>Try a different search term.</p>';
            const container = document.querySelector('.tools-grid-container');
            if (container) {
                container.parentNode.insertBefore(msg, container.nextSibling);
            }
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Initialize Navbar
function initializeNavbar() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar-collapse');
        const toggle = document.querySelector('.navbar-toggler');
        if (navbar && navbar.classList.contains('show') && !navbar.contains(event.target) && !toggle.contains(event.target)) {
            toggle.click();
        }
    });
}

// Newsletter Subscription
function initializeNewsletter() {
    const newsletterBtn = document.getElementById('newsletterBtn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            const email = document.getElementById('newsletterEmail').value;
            if (email && validateEmail(email)) {
                alert('Thank you for subscribing! You will receive updates at ' + email);
                document.getElementById('newsletterEmail').value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// File Upload and Processing Functions
function initializeFileUpload(uploadAreaId, originalPreviewId, processedPreviewId, processFunction, allowedFileType) {
    const uploadArea = document.getElementById(uploadAreaId);
    const originalPreview = document.getElementById(originalPreviewId);
    const processedPreview = document.getElementById(processedPreviewId);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    
    // Set file type restrictions
    if (allowedFileType === 'image') {
        fileInput.accept = 'image/*';
    } else if (allowedFileType === 'video') {
        // Accept various video formats
        fileInput.accept = 'video/*,.mp4,.webm,.ogg,.mov,.avi,.wmv,.flv,.mkv,.m4v,.3gp';
    }
    
    if (uploadArea) {
        uploadArea.appendChild(fileInput);
        
        // Ensure upload area is clickable
        uploadArea.style.cursor = 'pointer';
        
        // Click to upload - make entire upload area clickable
        uploadArea.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button, link, or the file input itself
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && 
                !e.target.closest('button') && !e.target.closest('a') &&
                e.target !== fileInput && e.target.tagName !== 'INPUT') {
                
                // Stop immediate propagation to prevent backup handlers from firing
                e.stopImmediatePropagation();
                
                // Allow clicking anywhere in the upload area
                try {
                    // Directly trigger the file input click
                    fileInput.click();
                } catch (err) {
                    console.error('Error clicking file input:', err);
                    // Fallback: try with a small delay
                    setTimeout(() => {
                        try {
                            fileInput.click();
                        } catch (err2) {
                            console.error('Error in fallback click:', err2);
                        }
                    }, 10);
                }
            }
        }, true); // Use capture phase to fire before backup handlers
        
        // Drag and drop handlers
        let dragCounter = 0;
        
        uploadArea.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            // Only remove dragover when we've actually left the upload area
            if (dragCounter === 0) {
                uploadArea.classList.remove('dragover');
            }
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter = 0;
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                
                // Validate file type before processing
                let isValid = false;
                if (allowedFileType === 'image') {
                    isValid = file.type.startsWith('image/') || 
                             /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
                    if (!isValid) {
                        alert('Please drop an image file only. Video files are not allowed.');
                        return;
                    }
                } else if (allowedFileType === 'video') {
                    isValid = file.type.startsWith('video/') || 
                             /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name);
                    if (!isValid) {
                        alert('Please drop a video file only. Image files are not allowed.');
                        return;
                    }
                }
                
                if (isValid) {
                    handleFile(file, originalPreview, processedPreview, processFunction, allowedFileType);
                }
            }
        });
        
        // Prevent default drag behavior on document to avoid browser opening files
        // But allow it on the upload area
        document.addEventListener('dragover', (e) => {
            // Only prevent default if not over upload area
            if (!uploadArea.contains(e.target)) {
                e.preventDefault();
            }
        }, false);
        
        document.addEventListener('drop', (e) => {
            // Only prevent default if not over upload area
            if (!uploadArea.contains(e.target)) {
                e.preventDefault();
            }
        }, false);
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0], originalPreview, processedPreview, processFunction, allowedFileType);
            }
        });
    }
}

function handleFile(file, originalPreview, processedPreview, processFunction, allowedFileType) {
    // Validate file type (check both MIME type and file extension)
    if (allowedFileType === 'image') {
        const isImage = file.type.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
        if (!isImage) {
            alert('Please upload an image file only. Video files are not allowed.');
            return;
        }
    } else if (allowedFileType === 'video') {
        const isVideo = file.type.startsWith('video/') || 
                       /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name);
        if (!isVideo) {
            alert('Please upload a video file only. Image files are not allowed.');
            return;
        }
    }
    
    // Show original file
    displayFile(file, originalPreview);
    
    // Process file
    if (processFunction) {
        processFunction(file, processedPreview);
    } else {
        // Default: just copy to processed preview
        displayFile(file, processedPreview);
    }
}

function displayFile(file, previewElement) {
    if (!previewElement) return;
    
    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
        reader.onload = function(e) {
            previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv|m4v|3gp)$/i.test(file.name)) {
        // Use object URL for videos (more efficient for large files)
        const videoUrl = URL.createObjectURL(file);
        previewElement.innerHTML = `<video src="${videoUrl}" controls style="max-width: 100%; max-height: 100%;"></video>`;
        // Clean up the object URL when video is removed
        const video = previewElement.querySelector('video');
        if (video) {
            video.addEventListener('loadstart', function() {
                // Keep the URL while video is loading
            });
            video.addEventListener('error', function(e) {
                console.error('Video load error:', e);
                previewElement.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-video" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                        <p style="font-weight: 600; margin-bottom: 10px;">${file.name}</p>
                        <p style="color: var(--text-color); opacity: 0.7;">Video file loaded. Use the process button to remove background.</p>
                    </div>
                `;
            });
            // Note: URL will be revoked when new content is loaded or page unloads
        }
    } else if (file.type.startsWith('audio/')) {
        reader.onload = function(e) {
            previewElement.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-music" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                    <p style="font-weight: 600; margin-bottom: 10px;">${file.name}</p>
                    <audio src="${e.target.result}" controls style="width: 100%;"></audio>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        previewElement.innerHTML = `
            <div class="file-preview-placeholder">
                <i class="fas fa-file" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                <p style="font-weight: 600;">${file.name}</p>
                <p style="opacity: 0.7;">File type: ${file.type || 'Unknown'}</p>
            </div>
        `;
    }
}

// Download processed file
function downloadFile(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
// Video-to-Audio Conversion Helpers
const AUDIO_CONVERSION_CONFIG = {
    mp3: { mime: 'audio/mpeg', args: ['-vn', '-c:a', 'libmp3lame', '-b:a', '192k'] },
    wav: { mime: 'audio/wav', args: ['-vn', '-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '2'] },
    aac: { mime: 'audio/aac', args: ['-vn', '-c:a', 'aac', '-b:a', '192k'] },
    aiff: { mime: 'audio/aiff', args: ['-vn', '-c:a', 'pcm_s16be', '-ar', '44100', '-ac', '2'] },
    alac: { mime: 'audio/mp4', args: ['-vn', '-c:a', 'alac'] },
    flac: { mime: 'audio/flac', args: ['-vn', '-c:a', 'flac'] },
    m4a: { mime: 'audio/mp4', args: ['-vn', '-c:a', 'aac', '-b:a', '192k', '-f', 'ipod'] },
    ogg: { mime: 'audio/ogg', args: ['-vn', '-c:a', 'libvorbis', '-qscale:a', '5'] },
    wma: { mime: 'audio/x-ms-wma', args: ['-vn', '-c:a', 'wmav2', '-b:a', '192k'] }
};

const FFmpegLoader = (() => {
    let scriptPromise = null;
    let readyPromise = null;
    let ffmpegInstance = null;
    const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.4/dist/';
    const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.4/dist/ffmpeg.min.js';

    const loadScript = () => {
        if (window.FFmpeg && window.FFmpeg.createFFmpeg) {
            return Promise.resolve();
        }
        if (!scriptPromise) {
            scriptPromise = new Promise((resolve, reject) => {
                const existing = document.querySelector('script[data-ffmpeg-loader="true"]');
                if (existing) {
                    existing.addEventListener('load', resolve, { once: true });
                    existing.addEventListener('error', () => reject(new Error('Failed to load FFmpeg.')), { once: true });
                    return;
                }
                const script = document.createElement('script');
                script.src = SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                script.dataset.ffmpegLoader = 'true';
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load FFmpeg.'));
                document.head.appendChild(script);
            });
        }
        return scriptPromise;
    };

    const ensureReady = async () => {
        if (ffmpegInstance) return ffmpegInstance;
        if (!readyPromise) {
            readyPromise = (async () => {
                await loadScript();
                if (!window.FFmpeg || !window.FFmpeg.createFFmpeg) {
                    throw new Error('FFmpeg is unavailable in this browser.');
                }
                const { createFFmpeg } = window.FFmpeg;
                const instance = createFFmpeg({
                    log: false,
                    corePath: `${CORE_BASE}ffmpeg-core.js`,
                    wasmPath: `${CORE_BASE}ffmpeg-core.wasm`,
                    workerPath: `${CORE_BASE}ffmpeg-core.worker.js`,
                    mainName: 'ffmpeg-core'
                });
                await instance.load();
                ffmpegInstance = instance;
                return ffmpegInstance;
            })();
        }
        return readyPromise;
    };

    return { ensureReady };
})();

async function convertVideoToAudioBlob(file, targetFormat) {
    const formatKey = (targetFormat || '').toLowerCase();
    const config = AUDIO_CONVERSION_CONFIG[formatKey];
    if (!config) {
        throw new Error(`Unsupported format: ${targetFormat}`);
    }
    if (!file) {
        throw new Error('No file selected for conversion.');
    }

    const ffmpeg = await FFmpegLoader.ensureReady();
    const inputExt = file.name.split('.').pop() || 'mp4';
    const inputName = `input_${Date.now()}.${inputExt}`;
    const outputName = `output.${formatKey}`;

    const { fetchFile } = window.FFmpeg;
    const data = await fetchFile(file);
    ffmpeg.FS('writeFile', inputName, data);
    await ffmpeg.run('-i', inputName, ...config.args, outputName);
    const outputData = ffmpeg.FS('readFile', outputName);
    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputName);

    const audioBuffer = outputData.buffer.slice(
        outputData.byteOffset,
        outputData.byteOffset + outputData.byteLength
    );
    return new Blob([audioBuffer], { type: config.mime });
}

function setupVideoToAudioConverter(config) {
    const {
        uploadAreaId,
        originalPreviewId,
        processedPreviewId,
        processBtnId,
        downloadBtnId,
        targetFormat,
        formatLabel
    } = config || {};
    const processBtn = document.getElementById(processBtnId);
    const downloadBtn = document.getElementById(downloadBtnId);
    const processedPreview = document.getElementById(processedPreviewId);
    if (!processBtn || !downloadBtn || !processedPreview) {
        console.warn('Audio converter setup skipped: required elements missing.', {
            processBtn: !!processBtn,
            downloadBtn: !!downloadBtn,
            processedPreview: !!processedPreview
        });
        return;
    }
    
    // Ensure download button is properly configured
    downloadBtn.setAttribute('type', 'button');
    downloadBtn.setAttribute('role', 'button');
    downloadBtn.removeAttribute('aria-disabled');
    downloadBtn.style.pointerEvents = 'auto';
    downloadBtn.style.cursor = 'pointer';
    let currentFile = null;
    let processedBlob = null;
    let previewUrl = null;
    let canDownload = false;
    let isDownloading = false;
    const defaultProcessLabel = processBtn.innerHTML;
    const defaultDownloadLabel = downloadBtn.innerHTML;

    const resetProcessedPreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }
        processedBlob = null;
        canDownload = false;
        downloadBtn.disabled = true;
        processedPreview.innerHTML = `
            <div class="file-preview-placeholder">
                <i class="fas fa-music"></i>
                <p>${formatLabel || 'Audio'} preview will appear here after conversion</p>
            </div>
        `;
    };

    const extractAudioFallback = async (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = false;
            video.volume = 1.0;
            video.style.display = 'none';
            document.body.appendChild(video);
            
            const videoUrl = URL.createObjectURL(file);
            video.src = videoUrl;
            
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = 0;
            });
            
            video.addEventListener('canplay', () => {
                try {
                    if (video.captureStream && typeof MediaRecorder !== 'undefined') {
                        const stream = video.captureStream();
                        const audioTracks = stream.getAudioTracks();
                        
                        if (audioTracks.length > 0) {
                            const audioStream = new MediaStream(audioTracks);
                            const mimeTypes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];
                            let selectedMime = null;
                            
                            for (const mime of mimeTypes) {
                                if (MediaRecorder.isTypeSupported(mime)) {
                                    selectedMime = mime;
                                    break;
                                }
                            }
                            
                            if (!selectedMime) {
                                selectedMime = 'audio/webm';
                            }
                            
                            const recorder = new MediaRecorder(audioStream, { mimeType: selectedMime });
                            const chunks = [];
                            
                            recorder.ondataavailable = (e) => {
                                if (e.data && e.data.size > 0) {
                                    chunks.push(e.data);
                                }
                            };
                            
                            recorder.onstop = () => {
                                document.body.removeChild(video);
                                URL.revokeObjectURL(videoUrl);
                                
                                if (chunks.length > 0) {
                                    const audioBlob = new Blob(chunks, { type: selectedMime });
                                    const audioUrl = URL.createObjectURL(audioBlob);
                                    resolve({ blob: audioBlob, url: audioUrl, success: true });
                                } else {
                                    const audioUrl = URL.createObjectURL(file);
                                    resolve({ blob: null, url: audioUrl, success: false });
                                }
                            };
                            
                            recorder.onerror = () => {
                                document.body.removeChild(video);
                                URL.revokeObjectURL(videoUrl);
                                const audioUrl = URL.createObjectURL(file);
                                resolve({ blob: null, url: audioUrl, success: false });
                            };
                            
                            recorder.start();
                            video.play().catch(() => {
                                if (recorder.state !== 'inactive') {
                                    recorder.stop();
                                }
                            });
                            
                            const duration = video.duration || 60;
                            const maxDuration = Math.min(duration * 1000 + 2000, 300000);
                            
                            setTimeout(() => {
                                if (recorder.state === 'recording') {
                                    recorder.stop();
                                }
                                video.pause();
                                video.src = '';
                            }, maxDuration);
                            
                            video.addEventListener('ended', () => {
                                if (recorder.state === 'recording') {
                                    recorder.stop();
                                }
                            });
                            
                            return;
                        }
                    }
                } catch (err) {
                    console.warn('MediaRecorder fallback failed:', err);
                }
                
                document.body.removeChild(video);
                URL.revokeObjectURL(videoUrl);
                const audioUrl = URL.createObjectURL(file);
                resolve({ blob: null, url: audioUrl, success: false });
            });
            
            video.addEventListener('error', () => {
                document.body.removeChild(video);
                URL.revokeObjectURL(videoUrl);
                const audioUrl = URL.createObjectURL(file);
                resolve({ blob: null, url: audioUrl, success: false });
            });
            
            video.load();
        });
    };

    const showConversionFallback = async (file) => {
        if (!file) {
            resetProcessedPreview();
            return;
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }
        
        // Try to extract audio using browser APIs
        const result = await extractAudioFallback(file);
        previewUrl = result.url;
        
        if (result.success && result.blob) {
            processedBlob = result.blob;
            canDownload = true;
            downloadBtn.disabled = false;
            console.log('Fallback extraction successful, blob size:', result.blob.size);
        } else {
            processedBlob = null;
            // Still allow download attempts - the download handler will try to extract
            canDownload = true;
            downloadBtn.disabled = false;
            console.log('Fallback extraction preview only, download will attempt extraction');
        }
        
        processedPreview.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-music" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                <p style="font-weight: 600; margin-bottom: 10px;">
                    ${(file.name.replace(/\.[^/.]+$/, '') || 'converted')}.${targetFormat}
                </p>
                <audio src="${previewUrl}" controls style="width: 100%;"></audio>
            </div>
        `;
    };

    resetProcessedPreview();
    processBtn.disabled = true;
    downloadBtn.disabled = true;

    initializeFileUpload(
        uploadAreaId,
        originalPreviewId,
        processedPreviewId,
        function(file) {
            currentFile = file;
            processBtn.disabled = false;
            resetProcessedPreview();
        },
        'video'
    );

    processBtn.addEventListener('click', async function() {
        if (!currentFile) {
            alert('Please upload a video file first.');
            return;
        }
        processBtn.disabled = true;
        processBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Converting...
        `;
        try {
            const audioBlob = await convertVideoToAudioBlob(currentFile, targetFormat);
            if (!audioBlob || !(audioBlob instanceof Blob)) {
                throw new Error('Invalid audio blob returned from conversion');
            }
            processedBlob = audioBlob;
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            previewUrl = URL.createObjectURL(audioBlob);
            processedPreview.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-music" style="font-size: 4rem; color: var(--accent-color); margin-bottom: 20px;"></i>
                    <p style="font-weight: 600; margin-bottom: 10px;">
                        ${(currentFile.name.replace(/\.[^/.]+$/, '') || 'converted')}.${targetFormat}
                    </p>
                    <audio src="${previewUrl}" controls style="width: 100%;"></audio>
                </div>
            `;
            canDownload = true;
            downloadBtn.disabled = false;
            console.log('Conversion successful, download ready. Blob size:', processedBlob.size);
        } catch (error) {
            console.error('Conversion failed:', error);
            processedBlob = null;
            canDownload = false;
            downloadBtn.disabled = true;
            await showConversionFallback(currentFile);
            // Even if conversion fails, allow download attempt
            if (currentFile) {
                canDownload = true;
                downloadBtn.disabled = false;
            }
        } finally {
            processBtn.innerHTML = defaultProcessLabel;
            processBtn.disabled = !currentFile;
        }
    });

    const triggerDownload = (blob, filename) => {
        return new Promise((resolve, reject) => {
            try {
                if (!blob || !(blob instanceof Blob)) {
                    reject(new Error('Invalid blob for download'));
                    return;
                }
                
                if (blob.size === 0) {
                    reject(new Error('Blob is empty'));
                    return;
                }
                
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename;
                link.style.position = 'fixed';
                link.style.top = '-9999px';
                link.style.left = '-9999px';
                link.style.opacity = '0';
                link.style.pointerEvents = 'none';
                
                // Ensure download attribute is set
                link.setAttribute('download', filename);
                
                // Add to DOM
                document.body.appendChild(link);
                
                // Force a reflow
                link.offsetHeight;
                
                // Trigger download once only
                try {
                    // Use only click() method to avoid duplicate downloads
                    link.click();
                    
                    console.log('Download triggered for:', filename, 'Size:', blob.size, 'Type:', blob.type);
                    
                    // Clean up after download starts
                    setTimeout(() => {
                        if (document.body.contains(link)) {
                            document.body.removeChild(link);
                        }
                        setTimeout(() => {
                            URL.revokeObjectURL(downloadUrl);
                        }, 2000);
                        resolve(true);
                    }, 300);
                } catch (err) {
                    console.error('Download trigger failed:', err);
                    if (document.body.contains(link)) {
                        document.body.removeChild(link);
                    }
                    URL.revokeObjectURL(downloadUrl);
                    reject(err);
                }
            } catch (error) {
                console.error('Download trigger error:', error);
                reject(error);
            }
        });
    };

    downloadBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Prevent multiple simultaneous downloads
        if (isDownloading || downloadBtn.disabled) {
            console.log('Download already in progress, ignoring click');
            return false;
        }
        
        console.log('Download button clicked', { 
            hasFile: !!currentFile, 
            hasBlob: !!processedBlob, 
            blobSize: processedBlob?.size,
            canDownload,
            targetFormat
        });
        
        if (!currentFile) {
            alert('Please upload a video file first.');
            return false;
        }
        
        // Set downloading flag immediately
        isDownloading = true;
        downloadBtn.disabled = true;
        
        const filename = `${currentFile.name.replace(/\.[^/.]+$/, '') || 'audio'}.${targetFormat}`;
        const originalBtnHtml = downloadBtn.innerHTML;
        let downloadSuccess = false;
        
        // If we have a processed blob, download it immediately
        if (processedBlob && processedBlob instanceof Blob && processedBlob.size > 0) {
            try {
                downloadBtn.innerHTML = `<i class="fas fa-download"></i> Downloading...`;
                
                console.log('Attempting download with processed blob, size:', processedBlob.size, 'type:', processedBlob.type);
                await triggerDownload(processedBlob, filename);
                downloadSuccess = true;
                console.log('✓ Audio downloaded successfully:', filename);
                
                // Show success feedback with audio icon
                downloadBtn.innerHTML = `<i class="fas fa-music"></i> Downloaded!`;
                downloadBtn.style.backgroundColor = '#28a745';
                downloadBtn.style.color = '#fff';
                setTimeout(() => {
                    downloadBtn.innerHTML = originalBtnHtml;
                    downloadBtn.style.backgroundColor = '';
                    downloadBtn.style.color = '';
                    downloadBtn.disabled = false;
                    isDownloading = false;
                }, 2000);
                
                return false;
            } catch (error) {
                console.error('✗ Download from processed blob failed:', error);
                downloadBtn.innerHTML = originalBtnHtml;
                downloadBtn.disabled = false;
                isDownloading = false;
                // Fall through to fallback
            }
        }
        
        // Fallback: try to extract and download audio
        if (!downloadSuccess && currentFile) {
            downloadBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Extracting audio...
            `;
            
            try {
                console.log('Attempting fallback audio extraction...');
                const result = await extractAudioFallback(currentFile);
                
                if (result.success && result.blob && result.blob instanceof Blob && result.blob.size > 0) {
                    await triggerDownload(result.blob, filename);
                    
                    // Update the processed blob for future downloads
                    processedBlob = result.blob;
                    canDownload = true;
                    downloadSuccess = true;
                    console.log('✓ Audio extracted and downloaded successfully:', filename);
                    
                    // Show success feedback with audio icon
                    downloadBtn.innerHTML = `<i class="fas fa-music"></i> Downloaded!`;
                    downloadBtn.style.backgroundColor = '#28a745';
                    downloadBtn.style.color = '#fff';
                    setTimeout(() => {
                        downloadBtn.innerHTML = defaultDownloadLabel;
                        downloadBtn.style.backgroundColor = '';
                        downloadBtn.style.color = '';
                        downloadBtn.disabled = false;
                        isDownloading = false;
                    }, 2000);
                } else {
                    // Try to use the preview URL if available
                    console.log('Trying preview URL fallback...');
                    if (previewUrl) {
                        try {
                            downloadBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Fetching...`;
                            const response = await fetch(previewUrl);
                            if (response.ok) {
                                const blob = await response.blob();
                                if (blob && blob.size > 0) {
                                    await triggerDownload(blob, filename);
                                    processedBlob = blob;
                                    canDownload = true;
                                    downloadSuccess = true;
                                    console.log('✓ Audio downloaded from preview URL:', filename);
                                    
                                    // Show success feedback with audio icon
                                    downloadBtn.innerHTML = `<i class="fas fa-music"></i> Downloaded!`;
                                    downloadBtn.style.backgroundColor = '#28a745';
                                    downloadBtn.style.color = '#fff';
                                    setTimeout(() => {
                                        downloadBtn.innerHTML = defaultDownloadLabel;
                                        downloadBtn.style.backgroundColor = '';
                                        downloadBtn.style.color = '';
                                        downloadBtn.disabled = false;
                                        isDownloading = false;
                                    }, 2000);
                                } else {
                                    throw new Error('Invalid blob from preview URL');
                                }
                            } else {
                                throw new Error('Failed to fetch preview URL');
                            }
                        } catch (fetchError) {
                            console.error('✗ Fetch from preview URL failed:', fetchError);
                        }
                    }
                    
                    // Last resort: download the video file itself
                    if (!downloadSuccess) {
                        try {
                            console.log('Attempting last resort: download video file...');
                            downloadBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Preparing...`;
                            await triggerDownload(currentFile, filename);
                            downloadSuccess = true;
                            console.log('✓ Video file downloaded as fallback:', filename);
                            
                            // Show success feedback with audio icon
                            downloadBtn.innerHTML = `<i class="fas fa-music"></i> Downloaded!`;
                            downloadBtn.style.backgroundColor = '#28a745';
                            downloadBtn.style.color = '#fff';
                            setTimeout(() => {
                                downloadBtn.innerHTML = defaultDownloadLabel;
                                downloadBtn.style.backgroundColor = '';
                                downloadBtn.style.color = '';
                                downloadBtn.disabled = false;
                                isDownloading = false;
                            }, 2000);
                        } catch (finalError) {
                            console.error('✗ All download methods failed:', finalError);
                            alert('Unable to download file. Please try:\n1. Converting the video first\n2. Using a different browser\n3. Checking browser download settings');
                            downloadBtn.innerHTML = originalBtnHtml;
                            downloadBtn.disabled = false;
                            isDownloading = false;
                        }
                    }
                }
            } catch (error) {
                console.error('✗ Fallback download error:', error);
                alert('Unable to download audio file. Please try converting the video first, then download.');
                downloadBtn.innerHTML = originalBtnHtml;
                downloadBtn.disabled = false;
                isDownloading = false;
            }
        } else if (!currentFile) {
            alert('Please convert your video first. Once the audio is ready, this button will download it.');
            isDownloading = false;
        }
        
        return false;
    });
}

window.setupVideoToAudioConverter = setupVideoToAudioConverter;

