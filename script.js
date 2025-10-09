// ================================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ================================================

let photoBlob = null;
let currentStep = 0;
let selectedTemplate = localStorage.getItem("resume-template") || "classic";
let selectedColor = localStorage.getItem("resume-color") || "#2563EB";

const steps = document.querySelectorAll('.form-section');
const stepIndicators = document.querySelectorAll('.step');

// ================================================
// FUNÇÕES UTILITÁRIAS
// ================================================

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function formatMonthYear(dateStr) {
    if (!dateStr || dateStr === 'Atual' || dateStr === 'Em Andamento') return dateStr;
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return month && year ? `${months[parseInt(month) - 1]} ${year}` : dateStr;
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info';
    toast.innerHTML = `
        <i data-lucide="${icon}" class="toast-icon"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    `;
    document.body.appendChild(container);
    return container;
}

// ================================================
// GERENCIAMENTO DE TEMA
// ================================================

function setTheme(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
    localStorage.setItem('jobframe-theme', theme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('jobframe-theme') || 'dark';
    setTheme(savedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            setTheme(isDark ? 'light' : 'dark');
        });
    }
}

// ================================================
// NAVEGAÇÃO E SCROLL
// ================================================

function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-logo');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function initializeHeaderScroll() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.style.backgroundColor = `hsl(var(--background) / 0.95)`;
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.backgroundColor = `hsl(var(--background) / 0.95)`;
            header.style.backdropFilter = 'blur(10px)';
        }
    });
}

// ================================================
// MENU MOBILE
// ================================================

function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// ================================================
// GERENCIAMENTO DE ETAPAS DO FORMULÁRIO
// ================================================

function initializeStepIndicators() {
    stepIndicators.forEach((indicator, index) => {
        indicator.style.cursor = 'pointer';
        indicator.addEventListener('click', () => {
            showStep(index);
        });
    });
}

function showStep(stepIndex) {
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === stepIndex);
    });

    stepIndicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === stepIndex);
    });

    currentStep = stepIndex;
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep === 0) {
        window.location.href = 'index.html';
    } else if (currentStep > 0) {
        showStep(currentStep - 1);
    }
}

// ================================================
// MANIPULAÇÃO DE DADOS DO FORMULÁRIO
// ================================================

function getFormData() {
    const form = document.getElementById('resume-form');
    if (!form) return null;

    const formData = new FormData(form);
    
    const data = {
        personal: {
            fullName: formData.get('fullName') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            linkedin: formData.get('linkedin') || '',
            city: formData.get('city') || '',
            state: formData.get('state') || '',
            photo: window.photoBlob || null
        },
        objective: formData.get('objective') || '',
        experience: [],
        education: [],
        skills: formData.get('skills') || '',
        languages: []
    };

    // Coleta experiências
    const experienceTitles = formData.getAll('experienceTitle[]');
    const experienceCompanies = formData.getAll('experienceCompany[]');
    const experienceStartDates = formData.getAll('experienceStartDate[]');
    const experienceEndDates = formData.getAll('experienceEndDate[]');
    const experienceCurrent = formData.getAll('experienceCurrent[]');

    for (let i = 0; i < experienceTitles.length; i++) {
        if (experienceTitles[i] || experienceCompanies[i]) {
            data.experience.push({
                title: experienceTitles[i] || '',
                company: experienceCompanies[i] || '',
                startDate: experienceStartDates[i] || '',
                endDate: experienceCurrent[i] ? 'Atual' : (experienceEndDates[i] || ''),
                current: !!experienceCurrent[i]
            });
        }
    }

    // Coleta formações
    const educationDegrees = formData.getAll('educationDegree[]');
    const educationSchools = formData.getAll('educationSchool[]');
    const educationStartYears = formData.getAll('educationStartYear[]');
    const educationEndYears = formData.getAll('educationEndYear[]');
    const educationCurrent = formData.getAll('educationCurrent[]');

    for (let i = 0; i < educationDegrees.length; i++) {
        if (educationDegrees[i] || educationSchools[i]) {
            data.education.push({
                degree: educationDegrees[i] || '',
                school: educationSchools[i] || '',
                startYear: educationStartYears[i] || '',
                endYear: educationCurrent[i] ? 'Em Andamento' : (educationEndYears[i] || ''),
                current: !!educationCurrent[i]
            });
        }
    }

    // Coleta idiomas
    const languageNames = formData.getAll('languageName[]');
    const languageLevels = formData.getAll('languageLevel[]');

    for (let i = 0; i < languageNames.length; i++) {
        if (languageNames[i] && languageLevels[i]) {
            data.languages.push({
                name: languageNames[i],
                level: languageLevels[i]
            });
        }
    }

    return data;
}

function handleCurrentCheckboxes() {
    document.addEventListener('change', function (e) {
        if (e.target.name === 'experienceCurrent[]') {
            const experienceItem = e.target.closest('.experience-item');
            const endDateInput = experienceItem.querySelector('input[name="experienceEndDate[]"]');

            if (e.target.checked) {
                endDateInput.disabled = true;
                endDateInput.value = '';
                endDateInput.placeholder = 'Trabalho atual';
            } else {
                endDateInput.disabled = false;
                endDateInput.placeholder = '';
            }
        }

        if (e.target.name === 'educationCurrent[]') {
            const educationItem = e.target.closest('.education-item');
            const endYearInput = educationItem.querySelector('input[name="educationEndYear[]"]');

            if (e.target.checked) {
                endYearInput.disabled = true;
                endYearInput.value = '';
                endYearInput.placeholder = 'Em andamento';
            } else {
                endYearInput.disabled = false;
                endYearInput.placeholder = '';
            }
        }
    });
}

// ================================================
// MANIPULAÇÃO DE ELEMENTOS DINÂMICOS
// ================================================

function addExperience() {
    const container = document.getElementById('experience-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.classList.add('experience-item');

    const index = container.querySelectorAll('.experience-item').length;

    newItem.innerHTML = `
        <div class="divider"></div>
        <div class="form-grid">
            <div class="form-group">
                <label>Cargo</label>
                <input type="text" name="experienceTitle[]">
            </div>
            <div class="form-group">
                <label>Empresa</label>
                <input type="text" name="experienceCompany[]">
            </div>
            <div class="form-group">
                <label>Data Início</label>
                <input type="month" name="experienceStartDate[]">
            </div>
            <div class="form-group">
                <label>Data Fim</label>
                <input type="month" name="experienceEndDate[]">
            </div>
            <div class="form-group form-group-full form-group-checkbox">
                <input type="checkbox" id="experienceCurrent-${index}" name="experienceCurrent[]">
                <label for="experienceCurrent-${index}" style="font-weight: 400;">Trabalho Atual</label>
            </div>
        </div>
    `;

    container.appendChild(newItem);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function addEducation() {
    const container = document.getElementById('education-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.classList.add('education-item');

    const index = container.querySelectorAll('.education-item').length;

    newItem.innerHTML = `
        <div class="divider"></div>
        <div class="form-grid">
            <div class="form-group">
                <label>Curso</label>
                <input type="text" name="educationDegree[]">
            </div>
            <div class="form-group">
                <label>Instituição</label>
                <input type="text" name="educationSchool[]">
            </div>
            <div class="form-group">
                <label>Data Início</label>
                <input type="month" name="educationStartYear[]">
            </div>
            <div class="form-group">
                <label>Data Conclusão</label>
                <input type="month" name="educationEndYear[]">
            </div>
            <div class="form-group form-group-full form-group-checkbox">
                <input type="checkbox" id="educationCurrent-${index}" name="educationCurrent[]">
                <label for="educationCurrent-${index}" style="font-weight: 400;">Em Andamento</label>
            </div>
        </div>
    `;

    container.appendChild(newItem);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function addLanguage() {
    const container = document.getElementById('language-container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.classList.add('language-item');

    newItem.innerHTML = `
        <div class="divider"></div>
        <div class="form-grid form-grid-compact">
            <div class="form-group">
                <label>Idioma</label>
                <input type="text" name="languageName[]">
            </div>
            <div class="form-group">
                <label>Nível</label>
                <select name="languageLevel[]">
                    <option value="">Selecione</option>
                    <option value="Básico">Básico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Fluente">Fluente</option>
                    <option value="Nativo">Nativo</option>
                </select>
            </div>
        </div>
    `;

    container.appendChild(newItem);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ================================================
// UPLOAD E CÂMERA DE FOTO
// ================================================

function initializePhotoUpload() {
    try {
        const photoInput = document.getElementById('photo-input');
        const photoDropZone = document.getElementById('photo-drop-zone');
        const photoPreview = document.getElementById('photo-preview');
        const removePhotoBtn = document.getElementById('remove-photo');
        
        if (!photoInput || !photoDropZone || !photoPreview) {
            return;
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        
        // Elementos da câmera (opcionais)
        const openCameraBtn = document.getElementById('open-camera-btn');
        const cameraModal = document.getElementById('camera-modal');
        const closeCameraModalBtn = document.getElementById('close-camera-modal-btn');
        const cameraStream = document.getElementById('camera-stream');
        const cameraCanvas = document.getElementById('camera-canvas');
        const capturePhotoBtn = document.getElementById('capture-photo-btn');
        const switchCameraBtn = document.getElementById('switch-camera-btn');
        const cameraMessage = document.getElementById('camera-message');
        
        let currentStream = null;
        let videoDevices = [];
        let currentDeviceIndex = 0;
        const cameraComponentsExist = cameraModal && cameraStream && cameraCanvas;

        // Funções utilitárias
        function stopCamera() {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
                if (cameraStream) cameraStream.srcObject = null;
            }
        }

        function renderPreview(dataUrl) {
            window.photoBlob = dataUrl;
            photoPreview.innerHTML = `<img src="${dataUrl}" alt="Foto do perfil" class="photo-preview-img">`;
            if (removePhotoBtn) removePhotoBtn.style.display = 'inline-flex';
            photoDropZone.classList.add('has-photo');
            photoDropZone.style.borderColor = 'hsl(var(--primary))';
            
            if (cameraModal) closeCameraModal();
        }

        function resetPreview() {
            window.photoBlob = null;
            if (photoInput) photoInput.value = '';
            
            photoPreview.innerHTML = `
                <i data-lucide="camera" class="photo-placeholder-icon"></i>
                <span id="photo-placeholder-text">Clique para adicionar ou arraste uma foto (Máx. 5MB)</span>
            `;
            
            if (removePhotoBtn) removePhotoBtn.style.display = 'none';
            photoDropZone.classList.remove('has-photo');
            photoDropZone.style.borderColor = 'hsl(var(--border))';

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        function handleFile(file) {
            if (!file) return;
            
            if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
                showToast('Formato de arquivo inválido. Use JPEG ou PNG.', 'error');
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                showToast('A foto deve ter no máximo 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                renderPreview(e.target.result);
                if (!file.name.includes("captured_photo")) {
                    showToast('Foto carregada com sucesso!', 'success');
                }
            };
            reader.readAsDataURL(file);
        }

        // Lógica da câmera
        if (cameraComponentsExist) {
            
            async function getCameraDevices() {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    videoDevices = devices.filter(d => d.kind === 'videoinput');

                    if (switchCameraBtn) {
                        switchCameraBtn.style.display = videoDevices.length > 1 ? 'inline-flex' : 'none';
                    }
                } catch (error) {
                    console.warn("Navegador não suporta enumerateDevices:", error);
                    videoDevices = [];
                    if (switchCameraBtn) switchCameraBtn.style.display = 'none';
                }
            }

            async function startCamera(deviceId = null) {
                stopCamera();

                if (cameraMessage) cameraMessage.textContent = 'Iniciando câmera...';
                if (capturePhotoBtn) capturePhotoBtn.disabled = true;

                const constraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    }
                };

                if (deviceId) {
                    constraints.video.deviceId = { exact: deviceId };
                }

                try {
                    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                    cameraStream.srcObject = currentStream;
                    
                    cameraStream.onloadedmetadata = () => {
                        cameraStream.play();
                        if (cameraMessage) cameraMessage.textContent = '';
                        if (capturePhotoBtn) capturePhotoBtn.disabled = false;
                    };

                } catch (err) {
                    console.error("Erro ao acessar a câmera: ", err);
                    if (cameraMessage) cameraMessage.textContent = 'Erro: Permissão da câmera negada ou câmera não encontrada.';
                    if (capturePhotoBtn) capturePhotoBtn.disabled = true;
                }
            }

            function capturePhoto() {
                if (!currentStream || capturePhotoBtn.disabled) return;

                const video = cameraStream;
                const canvas = cameraCanvas;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    const capturedFile = new File([blob], "captured_photo.png", { type: "image/png" });
                    handleFile(capturedFile);
                    
                    if (window.photoBlob) {
                        showToast('Foto capturada e salva!', 'success');
                    }
                    
                }, 'image/png');
            }

            function openCameraModal() {
                if (!cameraModal) return;
                
                cameraModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                
                getCameraDevices().then(() => {
                    startCamera(null);
                });
            }

            function closeCameraModal() {
                if (cameraModal) cameraModal.classList.add('hidden');
                document.body.style.overflow = '';
                stopCamera();
            }

            function switchCamera() {
                if (videoDevices.length <= 1) return;

                currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
                const nextDeviceId = videoDevices[currentDeviceIndex].deviceId;
                startCamera(nextDeviceId);
            }
            
            // Event listeners da câmera
            if (openCameraBtn) openCameraBtn.addEventListener('click', openCameraModal);
            if (closeCameraModalBtn) closeCameraModalBtn.addEventListener('click', closeCameraModal);
            if (capturePhotoBtn) capturePhotoBtn.addEventListener('click', capturePhoto);
            if (switchCameraBtn) switchCameraBtn.addEventListener('click', switchCamera);
            
            cameraModal.addEventListener('click', (e) => {
                if (e.target === cameraModal) {
                    closeCameraModal();
                }
            });
        }
        
        // Event listeners comuns
        photoInput.addEventListener('change', function (e) {
            handleFile(e.target.files[0]);
        });

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', function () {
                resetPreview();
                showToast('Foto removida', 'info');
            });
        }

        // Drag and drop
        if (photoDropZone) {
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length) {
                    handleFile(files[0]);
                }
            }
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                photoDropZone.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                photoDropZone.addEventListener(eventName, () => photoDropZone.classList.add('drag-over'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                photoDropZone.addEventListener(eventName, () => photoDropZone.classList.remove('drag-over'), false);
            });

            photoDropZone.addEventListener('drop', handleDrop, false);

            photoDropZone.addEventListener('click', function(e) {
                 if (window.photoBlob) return;
                 photoInput.click();
            });
        }
        
        resetPreview();
    
    } catch (e) {
        console.error("Erro em initializePhotoUpload:", e);
    }
}

// ================================================
// PRÉ-VISUALIZAÇÃO DO CURRÍCULO
// ================================================

function generateTemplateHTML(data, template, color) {
    if (!data) return '<div style="padding: 2rem; text-align: center; color: #666;">Preencha os dados do formulário para ver a pré-visualização</div>';

    const styles = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                color: #1f2937;
                line-height: 1.6;
                background: white;
                padding: 40px;
            }
            .resume-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
            }
            .header {
                border-bottom: 3px solid ${color};
                padding-bottom: 20px;
                margin-bottom: 30px;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            .photo {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid ${color};
            }
            .header-content {
                flex: 1;
            }
            h1 {
                font-size: 32px;
                font-weight: 700;
                color: ${color};
                margin-bottom: 8px;
            }
            .contact-info {
                color: #6b7280;
                font-size: 14px;
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            .contact-info span {
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 20px;
                font-weight: 600;
                color: ${color};
                border-bottom: 2px solid ${color};
                padding-bottom: 8px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .objective {
                color: #374151;
                text-align: justify;
                margin-bottom: 20px;
                line-height: 1.7;
            }
            .experience-item, .education-item, .language-item {
                margin-bottom: 18px;
                padding-left: 15px;
                border-left: 3px solid ${color}20;
            }
            .item-title {
                font-weight: 600;
                font-size: 16px;
                color: #111827;
            }
            .item-subtitle {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 4px;
            }
            .item-date {
                color: #9ca3af;
                font-size: 13px;
                font-style: italic;
            }
            .skills {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .skill-tag {
                background: ${color}15;
                color: ${color};
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
            }
            ${template === 'executive' ? `
                body {
                    font-family: 'Georgia', serif;
                }
                .header {
                    text-align: center;
                    border: none;
                    padding-bottom: 30px;
                }
                h1 {
                    font-size: 36px;
                    margin-bottom: 10px;
                }
                .section-title {
                    border: none;
                    border-bottom: 1px solid ${color};
                    font-variant: small-caps;
                }
            ` : ''}
            ${template === 'minimal' ? `
                .header {
                    border: none;
                    border-left: 5px solid ${color};
                    padding-left: 20px;
                }
                .section-title {
                    border: none;
                    padding-left: 15px;
                    border-left: 4px solid ${color};
                }
                .experience-item, .education-item {
                    border-left: none;
                    padding-left: 0;
                }
            ` : ''}
            ${template === 'elegant' ? `
                body {
                    background: #fafafa;
                }
                .resume-container {
                    box-shadow: 0 0 40px rgba(0,0,0,0.1);
                    padding: 50px;
                }
                .header {
                    text-align: center;
                    border-bottom: 1px solid ${color}30;
                }
                .photo {
                    margin: 0 auto 20px;
                }
                h1 {
                    letter-spacing: 1px;
                }
            ` : ''}
            ${template === 'professional' ? `
                .header {
                    background: ${color};
                    color: white;
                    padding: 30px;
                    margin: -40px -40px 30px;
                    border: none;
                }
                h1 {
                    color: white;
                }
                .contact-info {
                    color: white;
                }
                .section-title {
                    color: ${color};
                }
            ` : ''}
            ${template === 'creative' ? `
                .resume-container {
                    background: linear-gradient(to bottom right, white, ${color}05);
                    padding: 30px;
                }
                .section:nth-child(even) {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .experience-item, .education-item {
                    border-left-width: 5px;
                    padding-left: 20px;
                }
            ` : ''}
        </style>
    `;

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <div class="header">
                    ${data.personal.photo ? `<img src="${data.personal.photo}" alt="Foto" class="photo">` : ''}
                    <div class="header-content">
                        <h1>${data.personal.fullName || 'Seu Nome'}</h1>
                        <div class="contact-info">
                            ${data.personal.email ? `<span>📧 ${data.personal.email}</span>` : ''}
                            ${data.personal.phone ? `<span>📱 ${data.personal.phone}</span>` : ''}
                            ${data.personal.city ? `<span>📍 ${data.personal.city}${data.personal.state ? ', ' + data.personal.state : ''}</span>` : ''}
                            ${data.personal.linkedin ? `<span>🔗 LinkedIn</span>` : ''}
                        </div>
                    </div>
                </div>

                ${data.objective ? `
                    <div class="section">
                        <div class="section-title">Objetivo Profissional</div>
                        <p class="objective">${data.objective}</p>
                    </div>
                ` : ''}

                ${data.experience.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Experiência Profissional</div>
                        ${data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="item-title">${exp.title}</div>
                                <div class="item-subtitle">${exp.company}</div>
                                <div class="item-date">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${data.education.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Formação Acadêmica</div>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="item-title">${edu.degree}</div>
                                <div class="item-subtitle">${edu.school}</div>
                                <div class="item-date">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${data.skills ? `
                    <div class="section">
                        <div class="section-title">Habilidades</div>
                        <div class="skills">
                            ${data.skills.split(',').map(skill => `
                                <span class="skill-tag">${skill.trim()}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${data.languages.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Idiomas</div>
                        ${data.languages.map(lang => `
                            <div class="language-item">
                                <span class="item-title">${lang.name}</span> - <span class="item-subtitle">${lang.level}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;

    return html;
}

// ================================================
// SALVAMENTO E CARREGAMENTO DE PROGRESSO
// ================================================

// SUAS NOVAS FUNÇÕES AQUI
function saveResumeTemplate() {
    const data = getFormData();
    const templates = JSON.parse(localStorage.getItem('jobframe_saved_templates') || '[]');
    
    const templateName = prompt('Digite um nome para este template:');
    if (!templateName) return;
    
    const newTemplate = {
        id: Date.now().toString(),
        name: templateName,
        data: data,
        createdAt: new Date().toISOString()
    };
    
    templates.unshift(newTemplate);
    localStorage.setItem('jobframe_saved_templates', JSON.stringify(templates));
    showToast(`Template "${templateName}" salvo com sucesso!`, 'success');
}

function loadResumeTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('jobframe_saved_templates') || '[]');
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
        populateForm(template.data);
        updatePreview();
        showToast(`Template "${template.name}" carregado!`, 'success');
    }
}

function deleteResumeTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('jobframe_saved_templates') || '[]');
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    
    localStorage.setItem('jobframe_saved_templates', JSON.stringify(filteredTemplates));
    showToast('Template excluído com sucesso!', 'info');
}

// FUNÇÕES EXISTENTES (MANTENHA COMO ESTÁ)
function saveProgress() {
    const data = getFormData();
    localStorage.setItem('jobframe_resume_data', JSON.stringify(data));
    showToast('Progresso salvo com sucesso!', 'success');
}

function autoSaveProgress() {
    const data = getFormData();
    if (data.personal.fullName || data.personal.email) {
        localStorage.setItem('jobframe_resume_data', JSON.stringify(data));
    }
}

function loadSavedProgress() {
    const savedData = localStorage.getItem('jobframe_resume_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            populateForm(data);
            showToast('Progresso anterior carregado!', 'info');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function updatePreview() {
    const previewFrame = document.getElementById('resume-frame');
    const placeholder = document.getElementById('preview-placeholder');
    
    if (!previewFrame) return;

    const data = getFormData();
    
    if (!data) return;

    const hasContent = data.personal.fullName || data.experience.length > 0 || data.education.length > 0;
    
    if (hasContent) {
        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor);
        
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(templateHTML);
        iframeDoc.close();
        
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        previewFrame.style.display = 'block';
    } else {
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
        previewFrame.style.display = 'none';
    }
}

function initializePreviewHandlers() {
    // Event listeners para seleção de template
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            templateCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedTemplate = this.dataset.template;
            localStorage.setItem("resume-template", selectedTemplate);
            updatePreview();
        });
    });

    // Event listeners para seleção de cor
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            colorButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
            localStorage.setItem("resume-color", selectedColor);
            updatePreview();
        });
    });

    // Event listener para cor personalizada
    const customColorPicker = document.getElementById('customColor');
    if (customColorPicker) {
        customColorPicker.addEventListener('input', function(e) {
            selectedColor = e.target.value;
            colorButtons.forEach(b => b.classList.remove('active'));
            localStorage.setItem("resume-color", selectedColor);
            updatePreview();
        });
    }

    // Event listeners para atualizar preview em tempo real
    const form = document.getElementById('resume-form');
    if (form) {
        form.addEventListener('input', debounce(updatePreview, 500));
        form.addEventListener('change', updatePreview);
    }

    // Botões de preview
    const refreshBtn = document.getElementById('preview-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updatePreview);
    }

    const fullscreenBtn = document.getElementById('preview-fullscreen');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            const frame = document.getElementById('resume-frame');
            if (frame.requestFullscreen) {
                frame.requestFullscreen();
            } else if (frame.webkitRequestFullscreen) {
                frame.webkitRequestFullscreen();
            }
        });
    }

    // Atualiza preview inicial
    setTimeout(updatePreview, 500);
}

// ================================================
// GERENCIAMENTO DE TEMPLATES - FUNÇÕES DE UI
// ================================================

function openTemplatesModal() {
    const modal = document.getElementById('templates-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderTemplatesList();
}

function closeTemplatesModal() {
    const modal = document.getElementById('templates-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderTemplatesList() {
    const templatesList = document.getElementById('templates-list');
    const noTemplates = document.getElementById('no-templates');
    
    if (!templatesList || !noTemplates) return;
    
    const templates = JSON.parse(localStorage.getItem('jobframe_saved_templates') || '[]');
    
    if (templates.length === 0) {
        templatesList.style.display = 'none';
        noTemplates.style.display = 'block';
        return;
    }
    
    templatesList.style.display = 'block';
    noTemplates.style.display = 'none';
    
    templatesList.innerHTML = templates.map(template => `
        <div class="template-item" data-template-id="${template.id}">
            <div class="template-header">
                <h4 class="template-name">${template.name}</h4>
                <div class="template-actions">
                    <button class="template-action-btn load" onclick="loadTemplateFromModal('${template.id}')" title="Carregar template">
                        <i data-lucide="upload"></i>
                    </button>
                    <button class="template-action-btn delete" onclick="deleteTemplateFromModal('${template.id}')" title="Excluir template">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <p class="template-date">Salvo em ${new Date(template.createdAt).toLocaleDateString('pt-BR')}</p>
            <div class="template-preview">
                ${template.data.personal.fullName ? `<strong>${template.data.personal.fullName}</strong>` : 'Nome não definido'}
                ${template.data.personal.email ? ` • ${template.data.personal.email}` : ''}
                ${template.data.experience.length > 0 ? ` • ${template.data.experience.length} experiência(s)` : ''}
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function loadTemplateFromModal(templateId) {
    loadResumeTemplate(templateId);
    closeTemplatesModal();
}

function deleteTemplateFromModal(templateId) {
    if (confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
        deleteResumeTemplate(templateId);
        renderTemplatesList();
    }
}

// Initialize template management
const saveTemplateBtn = document.getElementById('save-template-btn');
const loadTemplateBtn = document.getElementById('load-template-btn');
const closeTemplatesModalBtn = document.getElementById('close-templates-modal');
const closeTemplatesBtn = document.getElementById('close-templates-btn');

if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener('click', saveResumeTemplate);
}

if (loadTemplateBtn) {
    loadTemplateBtn.addEventListener('click', openTemplatesModal);
}

if (closeTemplatesModalBtn) {
    closeTemplatesModalBtn.addEventListener('click', closeTemplatesModal);
}

if (closeTemplatesBtn) {
    closeTemplatesBtn.addEventListener('click', closeTemplatesModal);
}

// Close modal on outside click
const templatesModal = document.getElementById('templates-modal');
if (templatesModal) {
    templatesModal.addEventListener('click', (e) => {
        if (e.target === templatesModal) {
            closeTemplatesModal();
        }
    });
}

// ================================================
// GERAÇÃO DE PDF
// ================================================

async function generatePDF() {
    const previewFrame = document.getElementById('resume-frame');
    if (!previewFrame || !previewFrame.contentDocument) {
        alert('Aguarde o carregamento da pré-visualização...');
        return;
    }

    try {
        const form = document.getElementById('resume-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Gerando PDF...';
        submitBtn.disabled = true;

        const iframeBody = previewFrame.contentDocument.body;
        
        const canvas = await html2canvas(iframeBody, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const data = getFormData();
        const fileName = `curriculo_${data.personal.fullName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        showToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
        
        const form = document.getElementById('resume-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
    }
}

// ================================================
// SALVAMENTO E CARREGAMENTO DE PROGRESSO
// ================================================

function saveProgress() {
    const data = getFormData();
    localStorage.setItem('jobframe_resume_data', JSON.stringify(data));
    showToast('Progresso salvo com sucesso!', 'success');
}

function autoSaveProgress() {
    const data = getFormData();
    if (data.personal.fullName || data.personal.email) {
        localStorage.setItem('jobframe_resume_data', JSON.stringify(data));
    }
}

function loadSavedProgress() {
    const savedData = localStorage.getItem('jobframe_resume_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            populateForm(data);
            showToast('Progresso anterior carregado!', 'info');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function populateForm(data) {
    if (!data) return;
    
    if (data.personal) {
        const personal = data.personal;
        setValue('fullName', personal.fullName);
        setValue('email', personal.email);
        setValue('phone', personal.phone);
        setValue('linkedin', personal.linkedin);
        setValue('city', personal.city);
        setValue('state', personal.state);
        setValue('objective', data.objective || '');
        setValue('skills', data.skills || '');

        if (personal.photo) {
            window.photoBlob = personal.photo;
            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview) {
                photoPreview.innerHTML = `<img src="${personal.photo}" alt="Foto do perfil" class="photo-preview-img">`;
                const removePhotoBtn = document.getElementById('remove-photo');
                if (removePhotoBtn) removePhotoBtn.style.display = 'block';
                const photoDropZone = document.getElementById('photo-drop-zone');
                if (photoDropZone) {
                    photoDropZone.classList.add('has-photo');
                    photoDropZone.style.borderColor = 'hsl(var(--primary))';
                }
            }
        }
    }

    // Populate experiences
    if (data.experience && data.experience.length > 0) {
        const container = document.getElementById('experience-container');
        if (container) {
            // Clear existing items except first one
            const items = container.querySelectorAll('.experience-item');
            for (let i = 1; i < items.length; i++) {
                items[i].remove();
            }
            
            // Add new items starting from index 1
            for (let i = 1; i < data.experience.length; i++) {
                addExperience();
            }
            
            // Populate all items
            const itemsAfter = container.querySelectorAll('.experience-item');
            data.experience.forEach((exp, index) => {
                if (itemsAfter[index]) {
                    const inputs = itemsAfter[index].querySelectorAll('input');
                    inputs[0].value = exp.title || '';
                    inputs[1].value = exp.company || '';
                    inputs[2].value = exp.startDate || '';
                    inputs[3].value = exp.current ? '' : (exp.endDate || '');
                    inputs[4].checked = exp.current || false;
                    
                    // Trigger change event to update disabled state
                    if (exp.current) {
                        inputs[4].dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    }

    // Populate education
    if (data.education && data.education.length > 0) {
        const container = document.getElementById('education-container');
        if (container) {
            // Clear existing items except first one
            const items = container.querySelectorAll('.education-item');
            for (let i = 1; i < items.length; i++) {
                items[i].remove();
            }
            
            // Add new items starting from index 1
            for (let i = 1; i < data.education.length; i++) {
                addEducation();
            }
            
            // Populate all items
            const itemsAfter = container.querySelectorAll('.education-item');
            data.education.forEach((edu, index) => {
                if (itemsAfter[index]) {
                    const inputs = itemsAfter[index].querySelectorAll('input');
                    inputs[0].value = edu.degree || '';
                    inputs[1].value = edu.school || '';
                    inputs[2].value = edu.startYear || '';
                    inputs[3].value = edu.current ? '' : (edu.endYear || '');
                    inputs[4].checked = edu.current || false;
                    
                    // Trigger change event to update disabled state
                    if (edu.current) {
                        inputs[4].dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    }

    // Populate languages
    if (data.languages && data.languages.length > 0) {
        const container = document.getElementById('language-container');
        if (container) {
            // Clear existing items except first one
            const items = container.querySelectorAll('.language-item');
            for (let i = 1; i < items.length; i++) {
                items[i].remove();
            }
            
            // Add new items starting from index 1
            for (let i = 1; i < data.languages.length; i++) {
                addLanguage();
            }
            
            // Populate all items
            const itemsAfter = container.querySelectorAll('.language-item');
            data.languages.forEach((lang, index) => {
                if (itemsAfter[index]) {
                    const inputs = itemsAfter[index].querySelectorAll('input, select');
                    inputs[0].value = lang.name || '';
                    inputs[1].value = lang.level || '';
                }
            });
        }
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
    }
}

// ================================================
// INICIALIZAÇÃO PRINCIPAL
// ================================================

function initializeFormHandlers() {
    const form = document.getElementById('resume-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            generatePDF();
        });

        setInterval(autoSaveProgress, 30000);
        handleCurrentCheckboxes();
    }
}

function initializeScrollToHash() {
    function scrollToHashWithOffset(instant) {
        if (!location.hash) return;
        try {
            var id = location.hash;
            var target = document.querySelector(id);
            if (!target) return;
            var header = document.getElementById('header');
            var headerHeight = header ? header.offsetHeight : 0;
            setTimeout(function () {
                var rect = target.getBoundingClientRect();
                var top = window.pageYOffset + rect.top - headerHeight - 8;
                window.scrollTo({ top: top, behavior: instant ? 'auto' : 'smooth' });
            }, 60);
        } catch (e) {
            console.warn('Anchor scroll helper error:', e);
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        scrollToHashWithOffset(true);
        setTimeout(function () { scrollToHashWithOffset(true); }, 200);
        setTimeout(function () { scrollToHashWithOffset(true); }, 600);
    });

    window.addEventListener('load', function () {
        scrollToHashWithOffset(true);
    });

    window.addEventListener('hashchange', function () {
        scrollToHashWithOffset(false);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize theme
    initializeTheme();

    // Initialize smooth scrolling
    initializeSmoothScrolling();

    // Initialize mobile menu
    initializeMobileMenu();

    // Initialize form handlers
    initializeFormHandlers();

    // Initialize header scroll effect
    initializeHeaderScroll();

    // Initialize photo upload
    initializePhotoUpload();

    // Initialize step indicators
    initializeStepIndicators();

    // Initialize preview handlers
    initializePreviewHandlers();

    // Load saved progress if exists
    loadSavedProgress();

    // Initialize scroll to hash
    initializeScrollToHash();

    // Start button handler
    const startButton = document.getElementById('start-button');
    const creatorSection = document.getElementById('creator');

    if (startButton && creatorSection) {
        startButton.addEventListener('click', (e) => {
            e.preventDefault();

            document.querySelectorAll('main > section').forEach(section => {
                if (section.id !== 'creator') {
                    section.style.display = 'none';
                }
            });

            creatorSection.style.display = 'block';
            creatorSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Initialize template and color selection
    const savedTemplate = localStorage.getItem("resume-template");
    const savedColor = localStorage.getItem("resume-color");

    if (savedTemplate) {
        selectedTemplate = savedTemplate;
        const templateCard = document.querySelector(`.template-card[data-template="${savedTemplate}"]`);
        if (templateCard) {
            document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
            templateCard.classList.add('active');
        }
    }

    if (savedColor) {
        selectedColor = savedColor;
        const colorBtn = document.querySelector(`.color-btn[data-color="${savedColor}"]`);
        if (colorBtn) {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            colorBtn.classList.add('active');
        }
        const customColorPicker = document.getElementById('customColor');
        if (customColorPicker) {
            customColorPicker.value = savedColor;
        }
    }
});

// ================================================
// EXPORTAÇÃO DE FUNÇÕES GLOBAIS
// ================================================

window.scrollToSection = scrollToSection;
window.addExperience = addExperience;
window.addEducation = addEducation;
window.addLanguage = addLanguage;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updatePreview = updatePreview;
window.generatePDF = generatePDF;
window.saveProgress = saveProgress;
window.saveResumeTemplate = saveResumeTemplate;
window.loadResumeTemplate = loadResumeTemplate;
window.deleteResumeTemplate = deleteResumeTemplate;
window.openTemplatesModal = openTemplatesModal;
window.closeTemplatesModal = closeTemplatesModal;
window.loadTemplateFromModal = loadTemplateFromModal;
window.deleteTemplateFromModal = deleteTemplateFromModal;