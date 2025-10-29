// ================================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ================================================

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
    return function (...args) {
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
    
    // Ícones Lucide para cada tipo
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info'
    };

    toast.innerHTML = `
        <i data-lucide="${icons[type]}" class="toast-icon"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ================================================
// FUNÇÕES PARA O POP-UP DE PREVIEW E DOWNLOAD
// ================================================

function showPDFPreviewModal(templateHTML, data) {
    closePDFPreviewModal();

    const fileName = data.personal.fullName || 'curriculo';
    const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));

    const modalHTML = `
        <div id="pdf-preview-modal" class="modal-overlay">
            <div class="modal-content pdf-preview-modal">
                <div class="pdf-preview-header">
                    <div class="pdf-preview-title">
                        <i data-lucide="eye"></i>
                        <span>Pré-visualização do Currículo</span>
                    </div>
                    <button type="button" class="close-modal-btn" onclick="closePDFPreviewModal()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <div class="pdf-preview-container">
                    <iframe 
                        id="pdf-preview-iframe" 
                        srcdoc="${templateHTML.replace(/"/g, '&quot;')}"
                        style="width: 100%; height: 500px; border: none; background: white;"
                        title="Pré-visualização do currículo"
                    ></iframe>
                </div>
                
                <!-- Seção de Download -->
                <div class="actions-section">
                    <h3 class="section-title">
                        <i data-lucide="download"></i>
                        Baixar Currículo
                    </h3>
                    <div class="pdf-preview-actions">
                        <button type="button" class="download-option" onclick="downloadPDF('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="file-text"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Baixar PDF</span>
                                <span class="option-description">Formato ideal para impressão</span>
                            </div>
                        </button>
                        
                        <button type="button" class="download-option" onclick="downloadJPG('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="image"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Baixar JPG</span>
                                <span class="option-description">Imagem de alta qualidade</span>
                            </div>
                        </button>
                        
                        <button type="button" class="download-option" onclick="downloadPNG('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="file-image"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Baixar PNG</span>
                                <span class="option-description">Imagem com fundo transparente</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Seção de Compartilhamento -->
                <div class="actions-section">
                    <h3 class="section-title">
                        <i data-lucide="share-2"></i>
                        Compartilhar
                    </h3>
                    <div class="pdf-preview-actions">
                        <button type="button" class="download-option" onclick="shareViaEmail('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="mail"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Compartilhar por E-mail</span>
                                <span class="option-description">Enviar currículo por e-mail</span>
                            </div>
                        </button>
                        
                        <button type="button" class="download-option" onclick="shareViaWhatsApp('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="message-circle"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Compartilhar no WhatsApp</span>
                                <span class="option-description">Enviar pelo WhatsApp</span>
                            </div>
                        </button>
                        
                        <button type="button" class="download-option" onclick="copyShareableLink('${encodedHTML}', '${fileName}')">
                            <div class="option-icon">
                                <i data-lucide="link"></i>
                            </div>
                            <div class="option-content">
                                <span class="option-title">Copiar Link</span>
                                <span class="option-description">Copiar link compartilhável</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePDFPreviewModal()">
                        <i data-lucide="edit"></i> Editar Currículo
                    </button>
                    <button type="button" class="btn btn-destructive" onclick="closePDFPreviewModal()">
                        <i data-lucide="x"></i> Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar iframe após carregamento
    setTimeout(() => {
        const iframe = document.getElementById('pdf-preview-iframe');
        if (iframe && iframe.contentDocument) {
            // Garantir que o conteúdo seja exibido corretamente
            const body = iframe.contentDocument.body;
            if (body) {
                body.style.margin = '0';
                body.style.padding = '20px';
            }
        }
    }, 500);

    // Adicionar efeitos de hover
    setTimeout(() => {
        addHoverEffects();
        setupModalInteractions();
    }, 100);

    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Prevenir scroll no body
    document.body.style.overflow = 'hidden';

    // Adicionar event listener para fechar modal com ESC
    document.addEventListener('keydown', handleModalKeydown);
}

// Função para fechar o modal corretamente
function closePDFPreviewModal() {
    const modal = document.getElementById('pdf-preview-modal');
    if (modal) {
        // Adicionar animação de fade out
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Função para compartilhar via LinkedIn
function shareViaLinkedIn(fileName) {
    const text = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    const url = window.location.href.split('?')[0];
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
}

function toggleShareOptions() {
    const shareOptions = document.getElementById('share-options');
    if (shareOptions) {
        shareOptions.style.display = shareOptions.style.display === 'none' ? 'flex' : 'none';
    }
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

        if (currentStep === 8) {
            setTimeout(generateFinalPreview, 500);
        }
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

// Modifique a função getFormData para garantir que a foto seja preservada
function getFormData() {
    const form = document.getElementById('resume-form');
    if (!form) return null;

    const formData = new FormData(form);

    // CORREÇÃO: Garantir que a foto seja preservada como Data URL
    let photoData = null;
    if (window.photoBlob) {
        photoData = window.photoBlob; // Já deve ser um Data URL
    }

    const data = {
        personal: {
            fullName: formData.get('fullName') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            linkedin: formData.get('linkedin') || '',
            neighborhood: formData.get('neighborhood') || '',
            city: formData.get('city') || '',
            state: formData.get('state') || '',
            photo: photoData // CORREÇÃO: Usar o Data URL diretamente
        },
        objective: formData.get('objective') || '',
        experience: [],
        education: [],
        skills: formData.get('skills') || '',
        languages: []
    };

    // ... resto da função permanece igual
    // Coleta experiências
    const experienceTitles = formData.getAll('experienceTitle[]');
    const experienceCompanies = formData.getAll('experienceCompany[]');
    const experienceStartDates = formData.getAll('experienceStartDate[]');
    const experienceEndDates = formData.getAll('experienceEndDate[]');
    const experienceCurrent = formData.getAll('experienceCurrent[]');
    const experienceDescriptions = formData.getAll('experienceDescription[]');

    for (let i = 0; i < experienceTitles.length; i++) {
        data.experience.push({
            title: experienceTitles[i] || '',
            company: experienceCompanies[i] || '',
            startDate: experienceStartDates[i] || '',
            endDate: experienceCurrent[i] ? 'Atual' : (experienceEndDates[i] || ''),
            current: !!experienceCurrent[i],
            description: experienceDescriptions[i] || ''
        });
    }

    // Coleta formações
    const educationDegrees = formData.getAll('educationDegree[]');
    const educationSchools = formData.getAll('educationSchool[]');
    const educationStartYears = formData.getAll('educationStartYear[]');
    const educationEndYears = formData.getAll('educationEndYear[]');
    const educationCurrent = formData.getAll('educationCurrent[]');

    for (let i = 0; i < educationDegrees.length; i++) {
        data.education.push({
            degree: educationDegrees[i] || '',
            school: educationSchools[i] || '',
            startYear: educationStartYears[i] || '',
            endYear: educationCurrent[i] ? 'Em Andamento' : (educationEndYears[i] || ''),
            current: !!educationCurrent[i]
        });
    }

    // Coleta idiomas
    const languageNames = formData.getAll('languageName[]');
    const languageLevels = formData.getAll('languageLevel[]');

    for (let i = 0; i < languageNames.length; i++) {
        data.languages.push({
            name: languageNames[i] || '',
            level: languageLevels[i] || ''
        });
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
            <div class="form-group form-group-full">
                <label>Descrição (Opcional)</label>
                <textarea name="experienceDescription[]" rows="2" placeholder="Descreva suas principais responsabilidades e conquistas..."></textarea>
            </div>
        </div>
        <div class="item-actions" style="text-align: right; margin-top: 1rem;">
            <button type="button" class="btn btn-destructive btn-sm" onclick="removeExperience(this)">
                <i data-lucide="trash-2"></i> Excluir Experiência
            </button>
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
        <div class="item-actions" style="text-align: right; margin-top: 1rem;">
            <button type="button" class="btn btn-destructive btn-sm" onclick="removeEducation(this)">
                <i data-lucide="trash-2"></i> Excluir Formação
            </button>
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
        <div class="item-actions" style="text-align: right; margin-top: 1rem;">
            <button type="button" class="btn btn-destructive btn-sm" onclick="removeLanguage(this)">
                <i data-lucide="trash-2"></i> Excluir Idioma
            </button>
        </div>
    `;

    container.appendChild(newItem);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Funções para remover itens
function removeExperience(button) {
    const experienceItem = button.closest('.experience-item');
    const container = document.getElementById('experience-container');
    const items = container.querySelectorAll('.experience-item');

    if (items.length > 1) {
        experienceItem.remove();
    } else {
        showToast('É necessário ter pelo menos uma experiência', 'error');
    }
}

function removeEducation(button) {
    const educationItem = button.closest('.education-item');
    const container = document.getElementById('education-container');
    const items = container.querySelectorAll('.education-item');

    if (items.length > 1) {
        educationItem.remove();
    } else {
        showToast('É necessário ter pelo menos uma formação', 'error');
    }
}

function removeLanguage(button) {
    const languageItem = button.closest('.language-item');
    const container = document.getElementById('language-container');
    const items = container.querySelectorAll('.language-item');

    if (items.length > 1) {
        languageItem.remove();
    } else {
        showToast('É necessário ter pelo menos um idioma', 'error');
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

        // Elementos da câmera
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
            // Manter a imagem original em alta qualidade
            window.photoBlob = dataUrl;

            const img = new Image();
            img.onload = function () {
                photoPreview.innerHTML = `
            <img src="${dataUrl}" alt="Foto do perfil" class="photo-preview-img" 
                 style="object-fit: cover; object-position: center; width: 100%; height: 100%;">
        `;

                if (removePhotoBtn) removePhotoBtn.style.display = 'inline-flex';
                photoDropZone.classList.add('has-photo');
                photoDropZone.style.borderColor = 'hsl(var(--primary))';
            };
            img.src = dataUrl;

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
                // CORREÇÃO: Salvar como data URL para garantir compatibilidade
                window.photoBlob = e.target.result; // Salvar como data URL
                renderPreview(e.target.result);
                if (!file.name.includes("captured_photo")) {
                    showToast('Foto carregada com sucesso!', 'success');
                }
            };
            reader.onerror = function () {
                showToast('Erro ao carregar a foto. Tente novamente.', 'error');
            };
            reader.readAsDataURL(file); // Ler como data URL
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
                        aspectRatio: { ideal: 1.333 } // 4:3 aspect ratio
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

                // Manter aspect ratio da câmera
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');

                // Limpar e desenhar a imagem com qualidade
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Criar imagem com qualidade máxima
                canvas.toBlob((blob) => {
                    const capturedFile = new File([blob], "captured_photo.png", {
                        type: "image/png",
                        lastModified: new Date().getTime()
                    });
                    handleFile(capturedFile);

                    if (window.photoBlob) {
                        showToast('Foto capturada e salva!', 'success');
                    }

                }, 'image/png', 1.0); // Qualidade máxima
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
            const file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
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

            photoDropZone.addEventListener('click', function (e) {
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
// SISTEMA DE TEMPLATES ESCALÁVEL
// ================================================

// Definição dos templates disponíveis
const AVAILABLE_TEMPLATES = {
    'classic': 'Clássico',
    'executive': 'Executive',
    'minimal': 'Minimalista',
    'elegant': 'Elegante',
    'professional': 'Profissional',
    'creative': 'Criativo',
    'modern': 'Moderno',
    'compact': 'Compacto'
};

// ================================================
// SISTEMA DE TEMPLATES COM FOTO
// ================================================

function generateTemplateHTML(data, template, color, secondaryColor, useGradient) {
    if (!data) return '<div style="padding: 2rem; text-align: center; color: #666;">Preencha os dados do formulário para ver a pré-visualização</div>';

    // CORREÇÃO: Processamento consistente da foto para todos os templates
    let photoHTML = '';
    if (data.personal.photo) {
        // CORREÇÃO CRÍTICA: Usar o Data URL diretamente sem conversões
        photoHTML = `<img src="${data.personal.photo}" alt="Foto" class="photo" crossorigin="anonymous" style="object-fit: cover; object-position: center;">`;
    }

    // Sistema de templates
    switch (template) {
        case 'minimal':
            return generateMinimalTemplate(data, color, secondaryColor, useGradient, photoHTML);
        case 'classic':
            return generateClassicTemplate(data, color, secondaryColor, useGradient, photoHTML);
        case 'executive':
            return generateExecutiveTemplate(data, color, secondaryColor, useGradient, photoHTML);
        case 'elegant':
            return generateElegantTemplate(data, color, secondaryColor, useGradient, photoHTML);
        case 'professional':
            return generateProfessionalTemplate(data, color, secondaryColor, useGradient, photoHTML);
        case 'creative':
            return generateCreativeTemplate(data, color, secondaryColor, useGradient, photoHTML);
        default:
            return generateClassicTemplate(data, color, secondaryColor, useGradient, photoHTML);
    }
}

// ======================
// TEMPLATE 1: CLÁSSICO
// ======================

function generateClassicTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#424242';
    const accentColor = '#000000';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            }
            
            body { 
                background: white; 
                color: #424242; 
                line-height: 1.5; 
                padding: 20mm 15mm; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                font-size: 10pt;
            }
            
            .resume-container { 
                max-width: 100%; 
                margin: 0 auto; 
                background: white; 
                display: grid;
                grid-template-columns: 35% 65%;
                gap: 0;
                min-height: 257mm;
            }
            
            /* Left Column */
            .left-column {
                padding: 0 20px 0 0;
                border-right: 2px solid ${primaryColor};
            }
            
            /* Photo Section */
            .photo-section {
                text-align: center;
                margin-bottom: 25px;
            }
            
            .photo-container {
                width: 150px;
                height: 150px;
                margin: 0 auto;
                border-radius: 50%;
                border: 3px solid ${primaryColor};
                overflow: hidden;
                background: #f5f5f5;
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            /* Contact Section */
            .contact-section {
                margin-bottom: 30px;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-bottom: 1px solid ${primaryColor};
                padding-bottom: 5px;
            }
            
            .contact-item {
                margin-bottom: 12px;
                font-size: 10pt;
                color: #555;
                display: flex;
                align-items: flex-start;
            }
            
            .contact-icon {
                width: 16px;
                height: 16px;
                margin-right: 10px;
                color: ${primaryColor};
                stroke: ${primaryColor};
                flex-shrink: 0;
            }
            
            /* Skills Section */
            .skills-section {
                margin-bottom: 30px;
            }
            
            .skills-list {
                list-style: none;
                padding: 0;
            }
            
            .skill-item {
                margin-bottom: 8px;
                padding-left: 0;
                font-size: 10pt;
                color: #444;
                position: relative;
            }
            
            .skill-item:before {
                content: "■";
                margin-right: 8px;
                color: ${primaryColor};
                font-size: 8px;
            }
            
            /* Education Section */
            .education-section {
                margin-bottom: 30px;
            }
            
            .education-item {
                margin-bottom: 20px;
            }
            
            .education-degree {
                font-weight: 600;
                font-size: 10.5pt;
                color: #222;
                margin-bottom: 3px;
            }
            
            .education-school {
                font-size: 10pt;
                color: ${primaryColor};
                margin-bottom: 3px;
            }
            
            .education-period {
                font-size: 9pt;
                color: #666;
                font-style: italic;
            }
            
            /* Right Column */
            .right-column {
                padding: 0 0 0 25px;
            }
            
            /* Header Section */
            .header-section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid ${primaryColor};
            }
            
            .name {
                font-size: 28px;
                font-weight: 700;
                color: ${primaryColor};
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            /* Profile Section */
            .profile-section {
                margin-bottom: 30px;
            }
            
            .profile-text {
                font-size: 10.5pt;
                line-height: 1.6;
                color: #555;
                text-align: justify;
            }
            
            /* Experience Section */
            .experience-section {
                margin-bottom: 30px;
            }
            
            .experience-item {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .experience-item:last-child {
                border-bottom: none;
            }
            
            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .experience-title {
                font-weight: 600;
                font-size: 11pt;
                color: #222;
                margin-bottom: 3px;
            }
            
            .experience-company {
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            .experience-period {
                font-size: 9.5pt;
                color: #666;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .experience-description {
                color: #555;
                font-size: 10pt;
                line-height: 1.5;
                text-align: justify;
            }
            
            /* Decorative Elements */
            .divider {
                height: 1px;
                background: #e0e0e0;
                margin: 20px 0;
            }
            
            @media print {
                body {
                    padding: 15mm 10mm;
                }
                .resume-container {
                    min-height: 267mm;
                }
            }
        </style>
    `;

    // Função para formatar número de telefone
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        // Remove tudo que não é número
        const cleaned = phone.replace(/\D/g, '');
        
        // Formata para (00) 00000-0000
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        // Retorna o número original se não conseguir formatar
        return phone;
    }

    const contactItems = [];
    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>${formattedPhone}</span>
            </div>
        `);
    }
    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>${data.personal.email}</span>
            </div>
        `);
    }
    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <span>${data.personal.linkedin}</span>
            </div>
        `);
    }
    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${location}</span>
            </div>
        `);
    }

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
                <!-- Left Column -->
                <div class="left-column">
                    <!-- Photo -->
                    ${photoHTML ? `
                    <div class="photo-section">
                        <div class="photo-container">
                            ${photoHTML.replace('class="photo"', 'class="photo"')}
                        </div>
                    </div>
                    ` : `
                    <div class="photo-section">
                        <div class="photo-container">
                            <div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    `}

                    <!-- Contact Information -->
                    <div class="contact-section">
                        <h2 class="section-title">Contato</h2>
                        ${contactItems.join('')}
                    </div>

                    <!-- Skills -->
                    ${data.skills ? `
                    <div class="skills-section">
                        <h2 class="section-title">Habilidades</h2>
                        <ul class="skills-list">
                            ${data.skills.split(',').map(skill => `
                                <li class="skill-item">${skill.trim()}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <!-- Education -->
                    ${data.education.length > 0 ? `
                    <div class="education-section">
                        <h2 class="section-title">Formação Acadêmica</h2>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="education-degree">${edu.degree || 'Curso'}</div>
                                <div class="education-school">${edu.school || 'Instituição'}</div>
                                <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>

                <!-- Right Column -->
                <div class="right-column">
                    <!-- Header -->
                    <div class="header-section">
                        <h1 class="name">${data.personal.fullName || 'NOME COMPLETO'}</h1>
                    </div>

                    <!-- Profile -->
                    ${data.objective ? `
                    <div class="profile-section">
                        <h2 class="section-title">Sobre Mim</h2>
                        <div class="profile-text">${data.objective}</div>
                    </div>
                    ` : ''}

                    <!-- Experience -->
                    ${data.experience.length > 0 ? `
                    <div class="experience-section">
                        <h2 class="section-title">Experiência Profissional</h2>
                        ${data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-header">
                                    <div>
                                        <div class="experience-title">${exp.title || 'Cargo'}</div>
                                        <div class="experience-company">${exp.company || 'Empresa'}</div>
                                    </div>
                                    <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                </div>
                                ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// =======================
// TEMPLATE 2: EXECUTIVO
// =======================

function generateExecutiveTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#000000';
    const goldColor = '#000000';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Georgia', 'Times New Roman', serif;
            }
            
            body { 
                background: white; 
                color: #333; 
                line-height: 1.5; 
                padding: 20mm 25mm; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                font-size: 11pt;
            }
            
            .resume-container { 
                max-width: 100%; 
                margin: 0 auto; 
                background: white; 
                min-height: 257mm;
                position: relative;
            }
            
            /* Elegant Header with Photo */
            .header-section {
                display: flex;
                align-items: center;
                margin-bottom: 35px;
                padding-bottom: 25px;
                border-bottom: 2px solid ${goldColor};
                position: relative;
                gap: 30px;
            }
            
            .header-section::before {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 100px;
                height: 3px;
                background: ${primaryColor};
            }
            
            .photo-section {
                flex-shrink: 0;
            }
            
            .photo-container {
                width: 160px;
                height: 160px;
                border-radius: 50%;
                border: 3px solid ${goldColor};
                overflow: hidden;
                background: #f5f5f5;
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .header-content {
                flex: 1;
                text-align: left;
            }
            
            .name {
                font-size: 36px;
                font-weight: 400;
                margin-bottom: 8px;
                color: ${primaryColor};
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            
            .contact-elegant {
                display: flex;
                justify-content: flex-start;
                flex-wrap: wrap;
                gap: 25px;
                font-size: 10.5pt;
                color: #666;
                margin-top: 15px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .contact-icon {
                width: 12px;
                height: 12px;
                color: ${goldColor};
            }
            
            /* Main Content Layout */
            .main-content {
                display: grid;
                grid-template-columns: 1fr;
                gap: 25px;
            }
            
            /* Two Column Sections */
            .two-column-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 25px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 14px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 6px;
                position: relative;
            }
            
            .section-title::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 40px;
                height: 2px;
                background: ${goldColor};
            }
            
            /* Profile Section */
            .profile-text {
                font-size: 11pt;
                line-height: 1.6;
                color: #555;
                text-align: justify;
            }
            
            /* Experience Section */
            .experience-item {
                margin-bottom: 18px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .experience-item:last-child {
                border-bottom: none;
            }
            
            .experience-title {
                font-weight: 600;
                font-size: 11pt;
                color: #222;
                margin-bottom: 3px;
            }
            
            .experience-company {
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 3px;
            }
            
            .experience-period {
                font-size: 10pt;
                color: #666;
                font-style: italic;
            }
            
            .experience-description {
                color: #555;
                font-size: 10.5pt;
                line-height: 1.5;
                margin-top: 8px;
            }
            
            /* Education Section */
            .education-section {
                margin-top: 10px;
                margin-bottom: 15px;
            }
            
            .education-item {
                margin-bottom: 18px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .education-item:last-child {
                border-bottom: none;
            }
            
            .education-degree {
                font-weight: 600;
                font-size: 11pt;
                color: #222;
                margin-bottom: 3px;
            }
            
            .education-school {
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 3px;
            }
            
            .education-period {
                font-size: 10pt;
                color: #666;
                font-style: italic;
            }
            
            /* Skills and Languages Section */
            .skills-languages-section {
                margin-top: 10px;
                margin-bottom: 15px;
            }
            
            /* Skills Section */
            .skills-list {
                list-style: none;
                padding: 0;
            }
            
            .skill-item {
                margin-bottom: 8px;
                font-size: 10.5pt;
                color: #555;
                position: relative;
                padding-left: 15px;
            }
            
            .skill-item::before {
                content: '—';
                position: absolute;
                left: 0;
                color: ${goldColor};
            }
            
            /* Languages */
            .languages-list {
                list-style: none;
                padding: 0;
            }
            
            .language-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 10.5pt;
                color: #555;
            }
            
            /* Signature Section */
            .signature-section {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                text-align: right;
            }
            
            @media print {
                body {
                    padding: 15mm 20mm;
                }
                .resume-container {
                    min-height: 267mm;
                }
            }
        </style>
    `;

    // Função para formatar número de telefone
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    }

    // Processar informações de contato
    const contactItems = [];
    
    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>${formattedPhone}</span>
            </div>
        `);
    }
    
    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>${data.personal.email}</span>
            </div>
        `);
    }
    
    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <span>${data.personal.linkedin}</span>
            </div>
        `);
    }
    
    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${location}</span>
            </div>
        `);
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Georgia&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <!-- Elegant Header with Photo -->
                <div class="header-section">
                    ${photoHTML ? `
                    <div class="photo-section">
                        <div class="photo-container">
                            ${photoHTML.replace('class="photo"', 'class="photo"')}
                        </div>
                    </div>
                    ` : `
                    <div class="photo-section">
                        <div class="photo-container">
                            <div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    `}
                    
                    <div class="header-content">
                        <h1 class="name">${data.personal.fullName || 'NOME COMPLETO'}</h1>
                        <div class="contact-elegant">
                            ${contactItems.join('')}
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <!-- CORREÇÃO 4: Profile Section - Mudado para "Sobre mim" -->
                    ${data.objective ? `
                    <div class="section">
                        <h2 class="section-title">Sobre mim</h2>
                        <div class="profile-text">${data.objective}</div>
                    </div>
                    ` : ''}

                    <!-- Experience Section -->
                    <div class="section">
                        <h2 class="section-title">Experiência Profissional</h2>
                        ${data.experience.length > 0 ? data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-title">${exp.title || 'Cargo'}</div>
                                <div class="experience-company">${exp.company || 'Empresa'}</div>
                                <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
                            </div>
                        `).join('') : ''}
                    </div>

                    <!-- Education Section -->
                    ${data.education.length > 0 ? `
                    <div class="education-section">
                        <h2 class="section-title">Formação Acadêmica</h2>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="education-degree">${edu.degree || 'Curso'}</div>
                                <div class="education-school">${edu.school || 'Instituição'}</div>
                                <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <!-- Skills and Languages Section -->
                    <div class="skills-languages-section">
                        <div class="two-column-section">
                            <!-- Skills -->
                            ${data.skills ? `
                            <div class="section">
                                <h2 class="section-title">Habilidades</h2>
                                <ul class="skills-list">
                                    ${data.skills.split(',').map(skill => `
                                        <li class="skill-item">${skill.trim()}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}

                            <!-- Languages -->
                            ${data.languages.length > 0 ? `
                            <div class="section">
                                <h2 class="section-title">Idiomas</h2>
                                <ul class="languages-list">
                                    ${data.languages.map(lang => `
                                        <li class="language-item">
                                            <span>${lang.name}</span>
                                            <span>${lang.level}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// =========================
// TEMPLATE 3: MINIMALISTA 
// =========================

function generateMinimalTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#2c2c2c';
    const accentColor = '#000000';
    const subtleColor = '#a8a8a8';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            }
            
            body { 
                background: #fefefe; 
                color: #2c2c2c; 
                line-height: 1.5; 
                padding: 15mm 20mm; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                font-size: 10.5pt;
                font-weight: 300;
            }
            
            .resume-container { 
                max-width: 100%; 
                margin: 0 auto; 
                background: #fefefe; 
                min-height: 267mm;
            }
            
            /* Header */
            .header-standard {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 25px;
                align-items: start;
                margin-bottom: 30px;
                padding-bottom: 25px;
                border-bottom: 1px solid #e8e8e8;
            }
            
            /* Photo Section */
            .photo-section {
                width: 120px;
                height: 120px;
            }
            
            .photo-container {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid ${accentColor};
                background: #f8f8f8;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .header-content {
                flex: 1;
            }
            
            .name-standard {
                font-size: 28px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }
            
            .contact-standard {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 8px;
                font-size: 10pt;
                color: ${subtleColor};
                margin-top: 10px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .contact-icon {
                width: 12px;
                height: 12px;
                color: ${accentColor};
            }
            
            /* Standard Layout */
            .standard-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 12px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                padding-bottom: 6px;
                border-bottom: 2px solid ${accentColor};
                display: inline-block;
            }
            
            /* Profile Section */
            .profile-section {
                grid-column: 1 / -1;
            }
            
            .profile-text {
                font-size: 10.5pt;
                line-height: 1.6;
                color: #555;
                text-align: justify;
            }
            
            /* Experience Section */
            .experience-item {
                margin-bottom: 18px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f5f5f5;
            }
            
            .experience-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 6px;
            }
            
            .experience-title {
                font-weight: 600;
                font-size: 11pt;
                color: ${primaryColor};
                margin-bottom: 3px;
            }
            
            .experience-company {
                font-size: 10pt;
                color: ${accentColor};
                margin-bottom: 4px;
                font-weight: 500;
            }
            
            .experience-period {
                font-size: 9pt;
                color: ${subtleColor};
                font-weight: 400;
                white-space: nowrap;
                background: #f8f8f8;
                padding: 3px 8px;
                border-radius: 4px;
            }
            
            .experience-description {
                color: #666;
                font-size: 10pt;
                line-height: 1.5;
                margin-top: 4px;
            }
            
            /* Education Section */
            .education-item {
                margin-bottom: 15px;
                padding-bottom: 12px;
                border-bottom: 1px solid #f5f5f5;
            }
            
            .education-item:last-child {
                border-bottom: none;
            }
            
            .education-degree {
                font-weight: 600;
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 3px;
            }
            
            .education-school {
                font-size: 10pt;
                color: ${accentColor};
                margin-bottom: 3px;
            }
            
            .education-period {
                font-size: 9pt;
                color: ${subtleColor};
            }
            
            /* Skills Section */
            .skills-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            
            .skill-tag {
                background: ${accentColor}15;
                color: ${accentColor};
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 9.5pt;
                border: 1px solid ${accentColor}30;
                font-weight: 400;
            }
            
            /* Languages Section */
            .language-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 6px 0;
                border-bottom: 1px dashed #f0f0f0;
                font-size: 10pt;
                color: #666;
            }
            
            .language-item:last-child {
                border-bottom: none;
            }
            
            @media print {
                body {
                    padding: 10mm 15mm;
                }
                .resume-container {
                    min-height: 277mm;
                }
            }
        </style>
    `;

    // Função para formatar número de telefone
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    }

    // Processar informações de contato
    const contactItems = [];

    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>${formattedPhone}</span>
            </div>
        `);
    }

    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>${data.personal.email}</span>
            </div>
        `);
    }

    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <span>${data.personal.linkedin}</span>
            </div>
        `);
    }

    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${location}</span>
            </div>
        `);
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <!-- Header with Photo -->
                <div class="header-standard">
                    <!-- Photo Section -->
                    <div class="photo-section">
                        ${photoHTML ? `
                        <div class="photo-container">
                            ${photoHTML.replace('class="photo"', 'class="photo"')}
                        </div>
                        ` : `
                        <div class="photo-container">
                            <div style="width:100%;height:100%;background:#f8f8f8;display:flex;align-items:center;justify-content:center;color:#ddd;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        </div>
                        `}
                    </div>

                    <!-- Header Content -->
                    <div class="header-content">
                        <h1 class="name-standard">${data.personal.fullName || 'Nome Completo'}</h1>
                        <div class="contact-standard">
                            ${contactItems.join('')}
                        </div>
                    </div>
                </div>

                <!-- Standard Layout -->
                <div class="standard-layout">
                    <!-- CORREÇÃO 4: Profile Section - Mudado para "Sobre mim" -->
                    ${data.objective ? `
                    <div class="section profile-section">
                        <h2 class="section-title">Sobre mim</h2>
                        <div class="profile-text">${data.objective}</div>
                    </div>
                    ` : ''}

                    <!-- Experience Section -->
                    ${data.experience.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Experiência</h2>
                        ${data.experience.map(exp => `
                            <div class="experience-item">
                                <div class="experience-header">
                                    <div>
                                        <div class="experience-title">${exp.title || 'Cargo'}</div>
                                        <div class="experience-company">${exp.company || 'Empresa'}</div>
                                    </div>
                                    <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                </div>
                                ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <!-- Education Section -->
                    ${data.education.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Formação</h2>
                        ${data.education.map(edu => `
                            <div class="education-item">
                                <div class="education-degree">${edu.degree || 'Curso'}</div>
                                <div class="education-school">${edu.school || 'Instituição'}</div>
                                <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <!-- Skills Section -->
                    ${data.skills ? `
                    <div class="section">
                        <h2 class="section-title">Habilidades</h2>
                        <div class="skills-tags">
                            ${data.skills.split(',').map(skill => `
                                <span class="skill-tag">${skill.trim()}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Languages Section -->
                    ${data.languages.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Idiomas</h2>
                        ${data.languages.map(lang => `
                            <div class="language-item">
                                <span>${lang.name}</span>
                                <span>${lang.level}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// ======================
// TEMPLATE 4: ELEGANTE 
// ======================

function generateElegantTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#2c3e50';
    const goldColor = '#000000';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Playfair Display', 'Georgia', serif;
            }
            
            body { 
                background: #fefefe; 
                color: #2c3e50; 
                line-height: 1.6; 
                padding: 15mm 20mm; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                font-size: 11pt;
                background-image: linear-gradient(to bottom, #fefefe 0%, #f8f9fa 100%);
            }
            
            .resume-container { 
                max-width: 100%; 
                margin: 0 auto; 
                background: white; 
                min-height: 267mm;
                position: relative;
                box-shadow: 0 5px 25px rgba(0,0,0,0.08);
                border: 1px solid #f0f0f0;
            }
            
            /* Header */
            .header-elegant {
                padding: 35px 40px 25px;
                border-bottom: 3px double ${goldColor};
                position: relative;
                background: linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%);
            }
            
            .name-title-container {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 15px;
            }
            
            .name {
                font-size: 42px;
                font-weight: 400;
                color: ${primaryColor};
                letter-spacing: 1.5px;
                line-height: 1.1;
                margin: 0;
                font-family: 'Playfair Display', serif;
            }
            
            .contact-elegant {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 15px;
                font-size: 10.5pt;
                color: #7f8c8d;
                margin-top: 10px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .contact-icon {
                width: 14px;
                height: 14px;
                color: ${goldColor};
            }
            
            /* Main Content Layout */
            .main-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
            }
            
            /* Left Column - Photo and Personal Info */
            .left-column {
                padding: 30px;
                background: #fcfcfc;
                border-right: 1px solid #f0f0f0;
                position: relative;
            }
            
            .left-column::after {
                content: '';
                position: absolute;
                top: 0;
                right: -1px;
                height: 100%;
                width: 1px;
                background: linear-gradient(to bottom, transparent, ${goldColor}, transparent);
            }
            
            .photo-section {
                margin-bottom: 30px;
                text-align: center;
            }
            
            .photo-container {
                width: 180px;
                height: 180px;
                margin: 0 auto;
                border-radius: 50%;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                border: 3px solid ${primaryColor};
                background: white;
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            /* Profile Section */
            .profile-section {
                margin-bottom: 30px;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: ${primaryColor};
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
                position: relative;
                padding-bottom: 8px;
            }
            
            .section-title::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 40px;
                height: 2px;
                background: ${goldColor};
            }
            
            .profile-text {
                font-size: 11pt;
                line-height: 1.7;
                color: #555;
                text-align: justify;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            /* Skills Section */
            .skills-section {
                margin-bottom: 30px;
            }
            
            .skills-list {
                list-style: none;
                padding: 0;
            }
            
            .skill-item {
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
                font-size: 10.5pt;
                color: #555;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            .skill-item::before {
                content: '▸';
                position: absolute;
                left: 0;
                color: ${goldColor};
                font-weight: bold;
            }
            
            /* Languages Section */
            .languages-section {
                margin-bottom: 20px;
            }
            
            .languages-list {
                list-style: none;
                padding: 0;
            }
            
            .language-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 10.5pt;
                color: #555;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            /* Right Column - Professional Experience */
            .right-column {
                padding: 30px;
            }
            
            /* Experience Section */
            .experience-section {
                margin-bottom: 30px;
            }
            
            .experience-item {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0f0f0;
                position: relative;
            }
            
            .experience-item:last-child {
                border-bottom: none;
            }
            
            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .experience-title {
                font-weight: 600;
                font-size: 12pt;
                color: #222;
                margin-bottom: 3px;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            .experience-company {
                font-size: 11pt;
                color: ${primaryColor};
                margin-bottom: 5px;
                font-weight: 500;
                font-style: italic;
            }
            
            .experience-period {
                font-size: 10pt;
                color: #7f8c8d;
                font-weight: 400;
                white-space: nowrap;
                background: #f8f9fa;
                padding: 3px 8px;
                border-radius: 3px;
                border: 1px solid #eee;
            }
            
            .experience-description {
                color: #555;
                font-size: 10.5pt;
                line-height: 1.6;
                text-align: justify;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            /* Education Section */
            .education-section {
                margin-bottom: 25px;
            }
            
            .education-item {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .education-item:last-child {
                border-bottom: none;
            }
            
            .education-degree {
                font-weight: 600;
                font-size: 11pt;
                color: #222;
                margin-bottom: 3px;
                font-family: 'Source Sans Pro', sans-serif;
            }
            
            .education-school {
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 3px;
                font-style: italic;
            }
            
            .education-period {
                font-size: 10pt;
                color: #7f8c8d;
                font-style: italic;
            }
            
            /* Decorative Elements */
            .ornament {
                position: absolute;
                width: 80px;
                height: 80px;
                opacity: 0.05;
                pointer-events: none;
            }
            
            .ornament-1 {
                top: 20px;
                right: 20px;
                background: radial-gradient(circle, ${primaryColor} 0%, transparent 70%);
            }
            
            .ornament-2 {
                bottom: 20px;
                left: 20px;
                background: radial-gradient(circle, ${goldColor} 0%, transparent 70%);
            }
            
            @media print {
                body {
                    padding: 10mm 15mm;
                    background: white;
                }
                .resume-container {
                    box-shadow: none;
                    border: none;
                    min-height: 277mm;
                }
            }
        </style>
    `;

    // Função para formatar número de telefone
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    }

    // Processar informações de contato
    const contactItems = [];
    
    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>${formattedPhone}</span>
            </div>
        `);
    }
    
    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>${data.personal.email}</span>
            </div>
        `);
    }
    
    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <span>${data.personal.linkedin}</span>
            </div>
        `);
    }
    
    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>${location}</span>
            </div>
        `);
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <!-- Decorative Elements -->
                <div class="ornament ornament-1"></div>
                <div class="ornament ornament-2"></div>
                
                <!-- Elegant Header -->
                <div class="header-elegant">
                    <div class="name-title-container">
                        <h1 class="name">${data.personal.fullName || 'NOME COMPLETO'}</h1>
                    </div>
                    <div class="contact-elegant">
                        ${contactItems.join('')}
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <!-- Left Column -->
                    <div class="left-column">
                        <!-- Photo -->
                        ${photoHTML ? `
                        <div class="photo-section">
                            <div class="photo-container">
                                ${photoHTML.replace('class="photo"', 'class="photo"')}
                            </div>
                        </div>
                        ` : `
                        <div class="photo-section">
                            <div class="photo-container">
                                <div style="width:100%;height:100%;background:#f8f9fa;display:flex;align-items:center;justify-content:center;color:#bdc3c7;font-size:12px;">
                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#bdc3c7" stroke-width="1.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        `}

                        <!-- CORREÇÃO 4: Profile Section - Mudado para "Sobre mim" -->
                        ${data.objective ? `
                        <div class="profile-section">
                            <h2 class="section-title">Sobre mim</h2>
                            <div class="profile-text">${data.objective}</div>
                        </div>
                        ` : ''}

                        <!-- Skills -->
                        ${data.skills ? `
                        <div class="skills-section">
                            <h2 class="section-title">Competências</h2>
                            <ul class="skills-list">
                                ${data.skills.split(',').map(skill => `
                                    <li class="skill-item">${skill.trim()}</li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}

                        <!-- Languages -->
                        ${data.languages.length > 0 ? `
                        <div class="languages-section">
                            <h2 class="section-title">Idiomas</h2>
                            <ul class="languages-list">
                                ${data.languages.map(lang => `
                                    <li class="language-item">
                                        <span>${lang.name}</span>
                                        <span>${lang.level}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Right Column -->
                    <div class="right-column">
                        <!-- Experience -->
                        ${data.experience.length > 0 ? `
                        <div class="experience-section">
                            <h2 class="section-title">Experiência Profissional</h2>
                            ${data.experience.map(exp => `
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">${exp.title || 'Cargo'}</div>
                                            <div class="experience-company">${exp.company || 'Empresa'}</div>
                                        </div>
                                        <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                    </div>
                                    ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                        <!-- Education -->
                        ${data.education.length > 0 ? `
                        <div class="education-section">
                            <h2 class="section-title">Formação Acadêmica</h2>
                            ${data.education.map(edu => `
                                <div class="education-item">
                                    <div class="education-degree">${edu.degree || 'Curso'}</div>
                                    <div class="education-school">${edu.school || 'Instituição'}</div>
                                    <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// ==========================
// TEMPLATE 5: PROFISSIONAL 
// ==========================

function generateProfessionalTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#7c3aed';
    const accentColor = secondaryColor || '#5b21b6';
    const neutralColor = '#6d28d9';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'SF Pro Display', 'Helvetica Neue', sans-serif;
            }
            
            body { 
                background: #ffffff; 
                color: #1f2937; 
                line-height: 1.5; 
                padding: 15mm 20mm; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
                font-size: 10.5pt;
            }
            
            .resume-container { 
                max-width: 100%; 
                margin: 0 auto; 
                background: white; 
                min-height: 267mm;
                position: relative;
            }
            
            /* Professional Header */
            .header-professional {
                padding: 35px 0 25px;
                border-bottom: 3px solid ${primaryColor};
                margin-bottom: 30px;
                position: relative;
            }
            
            .header-content {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                gap: 30px;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .contact-info {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                text-align: center;
            }
            
            .name-title {
                text-align: center;
            }
            
            .photo-section {
                text-align: right;
            }
            
            .photo-container {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid ${primaryColor};
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .name {
                font-size: 32px;
                font-weight: 700;
                color: ${primaryColor};
                margin-bottom: 10px;
                letter-spacing: -0.5px;
            }
            
            .contact-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                font-size: 10pt;
                color: #6b7280;
            }
            
            .contact-icon {
                width: 14px;
                height: 14px;
                color: ${primaryColor};
                flex-shrink: 0;
            }
            
            .contact-label {
                font-size: 9pt;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .contact-value {
                font-weight: 500;
            }
            
            /* Main Content */
            .main-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 35px;
            }
            
            /* Sections */
            .section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 13px;
                font-weight: 700;
                color: ${primaryColor};
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                padding-bottom: 8px;
                border-bottom: 2px solid #e5e7eb;
                position: relative;
            }
            
            .section-title::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 40px;
                height: 2px;
                background: ${primaryColor};
            }
            
            /* Profile Section */
            .profile-text {
                font-size: 10.5pt;
                line-height: 1.6;
                color: #4b5563;
                text-align: justify;
            }
            
            /* Skills Section - Clean Style */
            .skills-list {
                list-style: none;
                padding: 0;
                display: grid;
                gap: 8px;
            }
            
            .skill-item {
                padding: 8px 0;
                font-size: 10.5pt;
                color: #4b5563;
                position: relative;
                padding-left: 15px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .skill-item:last-child {
                border-bottom: none;
            }
            
            .skill-item::before {
                content: '•';
                position: absolute;
                left: 0;
                color: ${primaryColor};
                font-weight: bold;
            }
            
            /* Languages Section */
            .languages-list {
                list-style: none;
                padding: 0;
            }
            
            .language-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 8px 0;
                font-size: 10.5pt;
                color: #4b5563;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .language-item:last-child {
                border-bottom: none;
            }
            
            .language-level {
                color: ${primaryColor};
                font-weight: 600;
            }
            
            /* Experience Section - Clean Style */
            .experience-item {
                margin-bottom: 22px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .experience-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }
            
            .experience-title {
                font-weight: 700;
                font-size: 11.5pt;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .experience-company {
                font-size: 10.5pt;
                color: ${primaryColor};
                font-weight: 600;
            }
            
            .experience-period {
                font-size: 10pt;
                color: #6b7280;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .experience-description {
                color: #4b5563;
                font-size: 10.5pt;
                line-height: 1.6;
            }
            
            /* Education Section - Clean Style */
            .education-item {
                margin-bottom: 18px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .education-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .education-degree {
                font-weight: 700;
                font-size: 11pt;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .education-school {
                font-size: 10.5pt;
                color: ${primaryColor};
                margin-bottom: 4px;
                font-weight: 600;
            }
            
            .education-period {
                font-size: 10pt;
                color: #6b7280;
                font-style: italic;
            }
            
            /* Professional Summary */
            .summary-section {
                padding: 0;
                margin-bottom: 25px;
            }
            
            .summary-text {
                font-size: 10.5pt;
                line-height: 1.6;
                color: #4b5563;
            }
            
            @media print {
                body {
                    padding: 10mm 15mm;
                }
            }
        </style>
    `;

    // Função para formatar número de celular
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    }

    // Processar informações de contato COMPLETAS
    const contactItems = [];
    
    // Telefone
    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div class="contact-label">Telefone</div>
                <div class="contact-value">${formattedPhone}</div>
            </div>
        `);
    }
    
    // Email
    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <div class="contact-label">Email</div>
                <div class="contact-value">${data.personal.email}</div>
            </div>
        `);
    }
    
    // LinkedIn
    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <div class="contact-label">LinkedIn</div>
                <div class="contact-value">${data.personal.linkedin}</div>
            </div>
        `);
    }
    
    // Endereço
    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="contact-label">Localização</div>
                <div class="contact-value">${location}</div>
            </div>
        `);
    }

    // Se algum contato estiver faltando, preencher com espaços vazios
    while (contactItems.length < 4) {
        contactItems.push('<div class="contact-item"></div>');
    }

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
                <!-- Professional Header -->
                <div class="header-professional">
                    <div class="header-content">
                        <div></div> <!-- Espaço vazio à esquerda -->
                        
                        <div class="name-title">
                            <h1 class="name">${data.personal.fullName || 'NOME COMPLETO'}</h1>
                        </div>
                        
                        <div class="photo-section">
                            ${photoHTML ? `
                            <div class="photo-container">
                                ${photoHTML.replace('class="photo"', 'class="photo"')}
                            </div>
                            ` : `
                            <div class="photo-container">
                                <div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">
                                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                            </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Contact Info Grid -->
                    <div class="contact-info">
                        ${contactItems.join('')}
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <!-- Left Column -->
                    <div class="left-column">
                        <!-- Professional Summary -->
                        <div class="section summary-section">
                            <h2 class="section-title">Resumo Profissional</h2>
                            <div class="summary-text">
                                ${data.objective || `Profissional com sólida experiência e histórico comprovado de resultados. 
                                Especializado em desenvolver estratégias eficazes que impulsionam o crescimento 
                                e a excelência operacional. Comprometido com a inovação e a entrega de valor 
                                sustentável.`}
                            </div>
                        </div>

                        <!-- Skills -->
                        <div class="section">
                            <h2 class="section-title">Competências</h2>
                            <ul class="skills-list">
                                ${data.skills ? data.skills.split(',').map(skill => `
                                    <li class="skill-item">${skill.trim()}</li>
                                `).join('') : `
                                    <li class="skill-item">Gestão de Projetos</li>
                                    <li class="skill-item">Liderança de Equipe</li>
                                    <li class="skill-item">Comunicação Eficaz</li>
                                    <li class="skill-item">Análise Estratégica</li>
                                    <li class="skill-item">Resolução de Problemas</li>
                                    <li class="skill-item">Planejamento e Organização</li>
                                `}
                            </ul>
                        </div>

                        <!-- Languages -->
                        <div class="section">
                            <h2 class="section-title">Idiomas</h2>
                            <ul class="languages-list">
                                ${data.languages.length > 0 ? data.languages.map(lang => `
                                    <li class="language-item">
                                        <span>${lang.name}</span>
                                        <span class="language-level">${lang.level}</span>
                                    </li>
                                `).join('') : `
                                    <li class="language-item">
                                        <span>Português</span>
                                        <span class="language-level">Nativo</span>
                                    </li>
                                    <li class="language-item">
                                        <span>Inglês</span>
                                        <span class="language-level">Avançado</span>
                                    </li>
                                    <li class="language-item">
                                        <span>Espanhol</span>
                                        <span class="language-level">Intermediário</span>
                                    </li>
                                `}
                            </ul>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="right-column">
                        <!-- Experience -->
                        <div class="section">
                            <h2 class="section-title">Experiência Profissional</h2>
                            ${data.experience.length > 0 ? data.experience.map(exp => `
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">${exp.title || 'Cargo'}</div>
                                            <div class="experience-company">${exp.company || 'Empresa'}</div>
                                        </div>
                                        <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                    </div>
                                    ${exp.description ? `<div class="experience-description">${exp.description}</div>` : `
                                    <div class="experience-description">
                                        Desenvolvimento e implementação de estratégias que resultaram em 
                                        crescimento significativo e otimização de processos organizacionais.
                                    </div>
                                    `}
                                </div>
                            `).join('') : `
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">Gerente de Projetos</div>
                                            <div class="experience-company">Empresa de Tecnologia</div>
                                        </div>
                                        <div class="experience-period">2020 – Atual</div>
                                    </div>
                                    <div class="experience-description">
                                        Liderança de equipes multidisciplinares no desenvolvimento e 
                                        implementação de projetos estratégicos com foco em inovação 
                                        e excelência operacional.
                                    </div>
                                </div>
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">Coordenador de Operações</div>
                                            <div class="experience-company">Consultoria Empresarial</div>
                                        </div>
                                        <div class="experience-period">2018 – 2020</div>
                                    </div>
                                    <div class="experience-description">
                                        Coordenação de operações e implementação de melhorias contínuas 
                                        nos processos organizacionais, resultando em aumento de 
                                        eficiência e produtividade.
                                    </div>
                                </div>
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">Analista Sênior</div>
                                            <div class="experience-company">Organização Reconhecida</div>
                                        </div>
                                        <div class="experience-period">2016 – 2018</div>
                                    </div>
                                    <div class="experience-description">
                                        Análise de dados e desenvolvimento de recomendações estratégicas 
                                        para melhorias de processos e eficiência operacional.
                                    </div>
                                </div>
                            `}
                        </div>

                        <!-- Education -->
                        <div class="section">
                            <h2 class="section-title">Formação Acadêmica</h2>
                            ${data.education.length > 0 ? data.education.map(edu => `
                                <div class="education-item">
                                    <div class="education-degree">${edu.degree || 'Curso'}</div>
                                    <div class="education-school">${edu.school || 'Instituição'}</div>
                                    <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                                </div>
                            `).join('') : `
                                <div class="education-item">
                                    <div class="education-degree">MBA em Gestão Empresarial</div>
                                    <div class="education-school">Instituição de Ensino Superior</div>
                                    <div class="education-period">2018 – 2020</div>
                                </div>
                                <div class="education-item">
                                    <div class="education-degree">Bacharelado em Administração</div>
                                    <div class="education-school">Universidade Federal</div>
                                    <div class="education-period">2012 – 2016</div>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// ======================
// TEMPLATE 6: CRIATIVO 
// ======================

function generateCreativeTemplate(data, color, secondaryColor, useGradient, photoHTML) {
    const primaryColor = color || '#191919';
    const accentColor = '#000000';

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Public Sans', 'Garet', 'Inter', sans-serif;
            }

            body { 
                background: white; 
                color: #222; 
                line-height: 1.5; 
                padding: 0; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
            }

            .resume-container { 
                width: 100%; 
                margin: 0 auto; 
                display: grid;
                grid-template-columns: 40% 60%;
                min-height: 297mm;
                background: white;
                border: 1px solid #efefef;
                box-shadow: 0 6px 24px rgba(0,0,0,0.06);
            }

            /* Sidebar (esquerda) */
            .sidebar {
                background: ${primaryColor};
                color: #fff;
                padding: 50px 36px;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                position: relative;
                overflow: hidden;
            }

            .photo-container {
                text-align: center;
                margin: 25px 0 35px 0;
                width: 160px;
                height: 160px;
                border-radius: 50%;
                border: 2px solid #fff;
                overflow: hidden;
                box-shadow: 0 6px 18px rgba(0,0,0,0.35);
                align-self: center;
            }

            .photo-container img.photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* Contato */
            .contact-section {
                width: 100%;
                margin-bottom: 30px;
            }

            .section-title {
                font-size: 14px;
                font-weight: 700;
                color: ${accentColor};
                text-transform: uppercase;
                letter-spacing: 2px;
                border-bottom: 2px solid ${accentColor};
                padding-bottom: 6px;
                margin-bottom: 14px;
            }

            .contact-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 12px;
                font-size: 14px;
                color: rgba(255,255,255,0.95);
            }

            .contact-icon {
                width: 16px;
                height: 16px;
                color: ${accentColor};
                stroke: ${accentColor};
                flex-shrink: 0;
                margin-top: 2px;
            }

            .contact-value {
                flex: 1;
            }

            /* Skills e Idiomas */
            .skills-list, .languages-list {
                list-style: none;
                padding: 0;
            }

            .skill-item, .language-item {
                font-size: 14px;
                color: rgba(255,255,255,0.95);
                margin-bottom: 8px;
                position: relative;
                padding-left: 14px;
            }

            .skill-item::before {
                content: "•";
                position: absolute;
                left: 0;
                color: ${accentColor};
                font-weight: 700;
            }

            .language-item {
                display: flex;
                justify-content: space-between;
            }

            .language-name {
                color: white;
                font-weight: 500;
            }

            .language-level {
                color: rgba(255,255,255,0.8);
                font-size: 12px;
            }

            /* Conteúdo principal (direita) */
            .main-content {
                padding: 50px 44px;
                background: white;
                color: #222;
            }

            .section {
                margin-bottom: 28px;
            }

            .main-title {
                font-size: 28px;
                font-weight: 700;
                color: ${accentColor};
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }

            .about-text {
                font-size: 14px;
                color: #555;
                text-align: justify;
                line-height: 1.6;
            }

            /* Experiência */
            .experience-item {
                margin-bottom: 22px;
                border-bottom: 1px solid #efefef;
                padding-bottom: 12px;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 6px;
            }

            .experience-title {
                font-weight: 700;
                font-size: 15px;
                color: #222;
            }

            .experience-company {
                font-weight: 600;
                color: ${accentColor};
                margin-top: 2px;
                font-size: 14px;
            }

            .experience-period {
                font-size: 13px;
                color: ${accentColor};
                font-weight: 600;
            }

            .experience-description {
                color: #555;
                font-size: 13.5px;
                line-height: 1.6;
                text-align: justify;
                margin-top: 6px;
            }

            /* Formação */
            .education-item {
                margin-bottom: 16px;
            }

            .education-degree {
                font-weight: 600;
                color: #222;
                font-size: 14px;
                margin-bottom: 2px;
            }

            .education-school {
                font-size: 13.5px;
                color: ${accentColor};
            }

            .education-period {
                font-size: 12.5px;
                color: #666;
                font-style: italic;
            }

            @media print {
                body { background: white; padding: 0; }
                .resume-container { box-shadow: none; border: none; }
            }
        </style>
    `;

    // Função para formatar número de telefone
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    }

    const fullName = data.personal.fullName || 'Seu Nome Completo';

    // Processar informações de contato
    const contactItems = [];
    if (data.personal.phone) {
        const formattedPhone = formatPhoneNumber(data.personal.phone);
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span class="contact-value">${formattedPhone}</span>
            </div>
        `);
    }
    if (data.personal.email) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span class="contact-value">${data.personal.email}</span>
            </div>
        `);
    }
    if (data.personal.linkedin) {
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                </svg>
                <span class="contact-value">${data.personal.linkedin}</span>
            </div>
        `);
    }
    if (data.personal.neighborhood || data.personal.city || data.personal.state) {
        const location = [data.personal.neighborhood, data.personal.city, data.personal.state].filter(Boolean).join(', ');
        contactItems.push(`
            <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                <span class="contact-value">${location}</span>
            </div>
        `);
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <!-- Sidebar -->
                <div class="sidebar">
                    ${photoHTML ? `
                        <div class="photo-container">
                            ${photoHTML}
                        </div>
                    ` : `
                        <div class="photo-container">
                            <div style="width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        </div>
                    `}

                    <div class="contact-section">
                        <div class="section-title">Contato</div>
                        ${contactItems.join('')}
                    </div>

                    ${data.skills ? `
                        <div class="section">
                            <div class="section-title">Habilidades</div>
                            <ul class="skills-list">
                                ${data.skills.split(',').map(skill => `<li class="skill-item">${skill.trim()}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${data.languages.length > 0 ? `
                        <div class="section">
                            <div class="section-title">Idiomas</div>
                            <ul class="languages-list">
                                ${data.languages.map(lang => `
                                    <li class="language-item">
                                        <span class="language-name">${lang.name}</span>
                                        <span class="language-level">${lang.level}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <div class="main-title">${fullName}</div>

                    <!-- CORREÇÃO 4: Profile Section - Mudado para "Sobre Mim" -->
                    ${data.objective ? `
                        <div class="section">
                            <div class="section-title">Sobre Mim</div>
                            <div class="about-text">${data.objective}</div>
                        </div>
                    ` : ''}

                    ${data.experience.length > 0 ? `
                        <div class="section">
                            <div class="section-title">Experiência Profissional</div>
                            ${data.experience.map(exp => `
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title">${exp.title || 'Cargo'}</div>
                                            <div class="experience-company">${exp.company || 'Empresa'}</div>
                                        </div>
                                        <div class="experience-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                    </div>
                                    ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${data.education.length > 0 ? `
                        <div class="section">
                            <div class="section-title">Formação Acadêmica</div>
                            ${data.education.map(edu => `
                                <div class="education-item">
                                    <div class="education-degree">${edu.degree || 'Curso'}</div>
                                    <div class="education-school">${edu.school || 'Instituição'}</div>
                                    <div class="education-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
}

// Função auxiliar para formatar datas
function formatMonthYear(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
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

function updatePreview() {
    const previewFrame = document.getElementById('resume-frame');
    const placeholder = document.getElementById('preview-placeholder');

    if (!previewFrame) return;

    const data = getFormData();
    const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
    const useGradient = document.getElementById('useGradient')?.checked || false;

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

// ================================================
// INICIALIZAÇÃO DOS TEMPLATES
// ================================================

function initializePreviewHandlers() {
    // Event listeners para seleção de template
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', function () {
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
        btn.addEventListener('click', function () {
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
        customColorPicker.addEventListener('input', function (e) {
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
        fullscreenBtn.addEventListener('click', function () {
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
// FUNÇÃO PRINCIPAL PARA GERAR CURRÍCULO
// ================================================

async function generatePDF() {
    const data = getFormData();

    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de gerar o currículo.', 'error');
        return;
    }

    try {
        const form = document.getElementById('resume-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Mostrar estado de carregamento
        submitBtn.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Gerando...';
        submitBtn.disabled = true;

        // Coletar cores
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
        const useGradient = document.getElementById('useGradient')?.checked || false;

        // Gerar o HTML do currículo
        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);

        // Mostrar modal de preview
        showPDFPreviewModal(templateHTML, data);

        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (error) {
        console.error('Erro ao gerar preview:', error);
        showToast('Erro ao gerar preview. Tente novamente.', 'error');

        const form = document.getElementById('resume-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Gerar Currículo <i data-lucide="download"></i>';

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ================================================
// GERAÇÃO DE PDF E COMPARTILHAMENTO
// ================================================

async function downloadPDF(encodedHTML, fileName) {
    try {
        showToast('Gerando PDF... Aguarde.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));
        const { jsPDF } = window.jspdf;

        // Criar container temporário
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 794px;
            min-height: 1123px;
            background: white;
            padding: 40px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        `;

        tempContainer.innerHTML = templateHTML;
        document.body.appendChild(tempContainer);

        // CORREÇÃO: Aguardar carregamento das imagens
        await waitForImages(tempContainer);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // CORREÇÃO: Configurações otimizadas do html2canvas
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempContainer.scrollHeight,
            onclone: function (clonedDoc, element) {
                // CORREÇÃO: Otimizar imagens no clone
                const images = element.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src.startsWith('data:')) {
                        // Data URLs não precisam de crossOrigin
                        img.removeAttribute('crossorigin');
                        // Forçar object-fit
                        img.style.objectFit = 'cover';
                        img.style.objectPosition = 'center center';
                    }
                });
            }
        });

        document.body.removeChild(tempContainer);

        // Criar PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // CORREÇÃO: Usar PNG para manter qualidade com fotos
        const imgData = canvas.toDataURL('image/png', 1.0);

        // Calcular dimensões mantendo proporção
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        let finalWidth = pdfWidth;
        let finalHeight = pdfWidth / ratio;

        // Se a altura for maior que a página, ajustar
        if (finalHeight > pdfHeight) {
            finalHeight = pdfHeight;
            finalWidth = pdfHeight * ratio;
        }

        // Centralizar no PDF
        const x = (pdfWidth - finalWidth) / 2;
        const y = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`;
        pdf.save(safeFileName);

        showToast('PDF gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
}

async function downloadJPG(encodedHTML, fileName) {
    try {
        showToast('Gerando JPG... Aguarde.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 794px;
            min-height: 1123px;
            background: white;
            padding: 40px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        `;

        tempContainer.innerHTML = templateHTML;
        document.body.appendChild(tempContainer);

        // CORREÇÃO: Aguardar carregamento
        await waitForImages(tempContainer);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempContainer.scrollHeight,
            onclone: function (clonedDoc, element) {
                const images = element.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src.startsWith('blob:')) {
                        img.crossOrigin = 'anonymous';
                    }
                });
            }
        });

        document.body.removeChild(tempContainer);

        // CORREÇÃO: Usar PNG convertido para JPG para manter qualidade
        const pngData = canvas.toDataURL('image/png', 1.0);

        // Converter PNG para JPG
        const jpgCanvas = document.createElement('canvas');
        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;
        const ctx = jpgCanvas.getContext('2d');

        // Preencher com fundo branco primeiro
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);

        // Desenhar a imagem original
        const img = new Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = pngData;
        });
        ctx.drawImage(img, 0, 0);

        const imgData = jpgCanvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.jpg`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('JPG gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar JPG:', error);
        showToast('Erro ao gerar JPG. Tente novamente.', 'error');
    }
}

async function downloadPNG(encodedHTML, fileName) {
    try {
        showToast('Gerando PNG... Aguarde.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 794px;
            min-height: 1123px;
            background: white;
            padding: 40px;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        `;

        tempContainer.innerHTML = templateHTML;
        document.body.appendChild(tempContainer);

        // CORREÇÃO: Aguardar carregamento
        await waitForImages(tempContainer);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempContainer.scrollHeight,
            onclone: function (clonedDoc, element) {
                const images = element.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src.startsWith('blob:')) {
                        img.crossOrigin = 'anonymous';
                    }
                });
            }
        });

        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('PNG gerado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PNG:', error);
        showToast('Erro ao gerar PNG. Tente novamente.', 'error');
    }
}

// CORREÇÃO: Função waitForImages melhorada
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
                // Imagem já carregada
                resolve();
            } else if (img.src.startsWith('data:')) {
                // CORREÇÃO: Data URL - considerar como carregada imediatamente
                resolve();
            } else if (img.src.startsWith('blob:')) {
                // Blob URL - dar um pouco mais de tempo
                setTimeout(resolve, 500);
            } else {
                // Esperar carregamento de URL externa
                let loaded = false;

                const onLoad = () => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    }
                };

                const onError = () => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        console.warn('Erro ao carregar imagem:', img.src);
                        resolve(); // Continuar mesmo com erro
                    }
                };

                img.addEventListener('load', onLoad);
                img.addEventListener('error', onError);

                // Timeout de segurança
                setTimeout(() => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    }
                }, 3000);
            }
        });
    });
    return Promise.all(promises);
}

// ================================================
// FUNÇÕES AUXILIARES PARA OTIMIZAÇÃO DE IMAGENS
// ================================================

function optimizeImagesInContainer(container) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        optimizeImageElement(img);
    });
}

function optimizeImagesInElement(element) {
    const images = element.querySelectorAll('img');
    images.forEach(img => {
        optimizeImageElement(img);
    });
}

function optimizeImageElement(img) {
    // Forçar alta qualidade nas imagens
    img.style.imageRendering = 'high-quality';
    img.style.imageRendering = '-webkit-optimize-contrast';
    img.style.imageRendering = 'crisp-edges';

    // Garantir que as fotos mantenham qualidade
    if (img.src.includes('data:image') || img.classList.contains('photo')) {
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
    }
}

// Função waitForImages melhorada
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
                // Imagem já carregada
                if (img.naturalWidth === 0) {
                    // Imagem quebrada, tentar recarregar
                    img.src = img.src;
                    setTimeout(resolve, 500);
                } else {
                    resolve();
                }
            } else {
                // Esperar carregamento
                let loaded = false;

                const onLoad = () => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    }
                };

                const onError = () => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        // Continuar mesmo com erro
                        resolve();
                    }
                };

                img.addEventListener('load', onLoad);
                img.addEventListener('error', onError);

                // Timeout de segurança
                setTimeout(() => {
                    if (!loaded) {
                        loaded = true;
                        img.removeEventListener('load', onLoad);
                        img.removeEventListener('error', onError);
                        resolve();
                    }
                }, 3000);
            }
        });
    });

    return Promise.all(promises);
}

// ================================================
// VERSÕES OTIMIZADAS PARA A ETAPA 9
// ================================================

async function downloadFinalPDF() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    try {
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
        const useGradient = document.getElementById('useGradient')?.checked || false;

        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
        const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
        const fileName = data.personal.fullName || 'curriculo';

        await downloadPDF(encodedHTML, fileName);
    } catch (error) {
        console.error('Erro no download final PDF:', error);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
}

async function downloadFinalJPG() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    try {
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
        const useGradient = document.getElementById('useGradient')?.checked || false;

        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
        const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
        const fileName = data.personal.fullName || 'curriculo';

        await downloadJPG(encodedHTML, fileName);
    } catch (error) {
        console.error('Erro no download final JPG:', error);
        showToast('Erro ao gerar JPG. Tente novamente.', 'error');
    }
}

async function downloadFinalPNG() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    try {
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
        const useGradient = document.getElementById('useGradient')?.checked || false;

        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
        const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
        const fileName = data.personal.fullName || 'curriculo';

        await downloadPNG(encodedHTML, fileName);
    } catch (error) {
        console.error('Erro no download final PNG:', error);
        showToast('Erro ao gerar PNG. Tente novamente.', 'error');
    }
}

// Função para corrigir aspect ratio de uma imagem individual
function fixSingleImageAspectRatio(img) {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;

    // Se a imagem for quadrada ou quase quadrada, garantir que mantenha o aspect ratio
    if (aspectRatio > 0.8 && aspectRatio < 1.2) {
        const currentWidth = parseInt(img.style.width) || img.offsetWidth;
        const currentHeight = parseInt(img.style.height) || img.offsetHeight;

        // Se as dimensões atuais não correspondem ao aspect ratio, corrigir
        const currentAspectRatio = currentWidth / currentHeight;
        if (Math.abs(currentAspectRatio - aspectRatio) > 0.1) {
            // Manter a largura e ajustar a altura para manter o aspect ratio
            img.style.height = `${currentWidth / aspectRatio}px`;
        }
    }

    // Forçar object-fit: cover para manter a proporção sem distorcer
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center center';
}

// Função auxiliar para aguardar o carregamento das imagens
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve;
                setTimeout(resolve, 2000);
            }
        });
    });
    return Promise.all(promises);
}

// ============================
// FUNÇÕES DE COMPARTILHAMENTO
// ============================

function shareViaEmail(fileName) {
    const subject = `Currículo - ${fileName}`;
    const body = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function shareViaWhatsApp(fileName) {
    const text = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyShareLink(fileName) {
    const currentUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Link copiado para a área de transferência!', 'success');
    });
}

// ================================================
// POPULAÇÃO DO FORMULÁRIO
// ================================================

function populateForm(data) {
    if (!data) return;

    if (data.personal) {
        const personal = data.personal;
        setValue('fullName', personal.fullName);
        setValue('email', personal.email);
        setValue('phone', personal.phone);
        setValue('linkedin', personal.linkedin);
        setValue('neighborhood', personal.neighborhood);
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

// ================================================
// INICIALIZAÇÃO DO FORMULÁRIO DE GERAÇÃO
// ================================================

function initializeFormSubmission() {
    const form = document.getElementById('resume-form');
    if (form) {
        console.log('Inicializando submissão do formulário...');

        // Remove event listeners duplicados
        form.removeEventListener('submit', handleFormSubmit);

        // Adiciona o event listener
        form.addEventListener('submit', handleFormSubmit);

        // Também adiciona um event listener direto ao botão como fallback
        const generateBtn = document.getElementById('generate-resume-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Botão Gerar Currículo clicado');
                generatePDF();
            });
        }
    }
}

// Função separada para lidar com o submit
function handleFormSubmit(e) {
    e.preventDefault();
    generatePDF();
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

// ================================================
// FUNÇÕES PARA A ETAPA 9 - PRÉ-VISUALIZAÇÃO FINAL
// ================================================

function generateFinalPreview() {
    const data = getFormData();
    const previewFrame = document.getElementById('final-resume-frame');
    const placeholder = document.getElementById('final-preview-placeholder');

    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de visualizar.', 'error');
        return;
    }

    try {
        // Coletar cores
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
        const useGradient = document.getElementById('useGradient')?.checked || false;

        // Gerar o HTML do currículo
        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);

        // Atualizar o iframe
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(templateHTML);
        iframeDoc.close();

        // Mostrar o iframe e esconder o placeholder
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        previewFrame.style.display = 'block';

        showToast('Pré-visualização atualizada com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar pré-visualização final:', error);
        showToast('Erro ao gerar pré-visualização. Tente novamente.', 'error');
    }
}

function openFinalPreviewFullscreen() {
    const previewFrame = document.getElementById('final-resume-frame');
    if (previewFrame.requestFullscreen) {
        previewFrame.requestFullscreen();
    } else if (previewFrame.webkitRequestFullscreen) {
        previewFrame.webkitRequestFullscreen();
    }
}

function downloadFinalPDF() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
    const useGradient = document.getElementById('useGradient')?.checked || false;

    const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
    const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
    const fileName = data.personal.fullName || 'curriculo';

    downloadPDF(encodedHTML, fileName);
}

function downloadFinalJPG() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
    const useGradient = document.getElementById('useGradient')?.checked || false;

    const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
    const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
    const fileName = data.personal.fullName || 'curriculo';

    downloadJPG(encodedHTML, fileName);
}

function downloadFinalPNG() {
    const data = getFormData();
    if (!data) {
        showToast('Preencha pelo menos algumas informações antes de baixar.', 'error');
        return;
    }

    const secondaryColor = document.getElementById('secondaryColor')?.value || '#3498db';
    const useGradient = document.getElementById('useGradient')?.checked || false;

    const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor, secondaryColor, useGradient);
    const encodedHTML = btoa(unescape(encodeURIComponent(templateHTML)));
    const fileName = data.personal.fullName || 'curriculo';

    downloadPNG(encodedHTML, fileName);
}

function shareViaEmailFinal() {
    const data = getFormData();
    const fileName = data.personal.fullName || 'curriculo';
    shareViaEmail(fileName);
}

function shareViaWhatsAppFinal() {
    const data = getFormData();
    const fileName = data.personal.fullName || 'curriculo';
    shareViaWhatsApp(fileName);
}

function copyShareableLinkFinal() {
    const data = getFormData();
    const fileName = data.personal.fullName || 'curriculo';
    copyShareLink(fileName);
}

// Função para gerar preview automaticamente ao chegar na etapa 9
function initializeFinalPreview() {
    // Gerar preview automaticamente quando chegar na etapa 9
    if (currentStep === 8) {
        setTimeout(generateFinalPreview, 500);
    }
}

// Modificar a função showStep para incluir a inicialização da pré-visualização final
const originalShowStep = window.showStep;
window.showStep = function (stepIndex) {
    originalShowStep(stepIndex);

    // Se for a etapa 9, inicializar a pré-visualização
    if (stepIndex === 8) {
        initializeFinalPreview();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Carregado - Inicializando JobFrame...');

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

    // INICIALIZAÇÃO CRÍTICA - Garantir que o formulário funcione
    initializeFormSubmission();

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

    // Auto-save
    setInterval(autoSaveProgress, 30000);
    handleCurrentCheckboxes();

    // Debug: Verificar se o botão existe
    const generateBtn = document.getElementById('generate-resume-btn');
    if (generateBtn) {
        console.log('Botão "Gerar Currículo" encontrado:', generateBtn);
    } else {
        console.error('Botão "Gerar Currículo" NÃO encontrado!');
    }

    // Debug: Verificar se o formulário existe
    const form = document.getElementById('resume-form');
    if (form) {
        console.log('Formulário encontrado:', form);
    } else {
        console.error('Formulário NÃO encontrado!');
    }
});

// ================================================
// EXPORTAÇÃO DE FUNÇÕES GLOBAIS
// ================================================

window.scrollToSection = scrollToSection;
window.addExperience = addExperience;
window.addEducation = addEducation;
window.addLanguage = addLanguage;
window.removeExperience = removeExperience;
window.removeEducation = removeEducation;
window.removeLanguage = removeLanguage;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.updatePreview = updatePreview;
window.saveProgress = saveProgress;
window.generatePDF = generatePDF;
window.downloadPDF = downloadPDF;
window.downloadJPG = downloadJPG;
window.shareViaEmail = shareViaEmail;
window.shareViaWhatsApp = shareViaWhatsApp;
window.copyShareLink = copyShareLink;
window.closePDFPreviewModal = closePDFPreviewModal;
window.toggleShareOptions = toggleShareOptions;
window.showPDFPreviewModal = showPDFPreviewModal;
