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
// FUNÇÕES PARA O POP-UP DE PREVIEW E DOWNLOAD
// ================================================

function showPDFPreviewModal(templateHTML, data) {
    closePDFPreviewModal();

    const modalHTML = `
        <div id="pdf-preview-modal" class="modal-overlay">
            <div class="modal-content pdf-preview-modal">
                <div class="pdf-preview-header">
                    <div class="pdf-preview-title">
                        <i data-lucide="eye"></i>
                        <span>Pré-visualização do Currículo</span>
                    </div>
                    <!-- Botão de fechar removido do cabeçalho conforme solicitado -->
                </div>
                
                <div class="pdf-preview-container">
                    <div id="pdf-preview-content">
                        ${templateHTML}
                    </div>
                </div>
                
                <div class="pdf-preview-actions">
                    <button type="button" class="download-option" onclick="downloadPDF('${btoa(unescape(encodeURIComponent(templateHTML)))}', '${data.personal.fullName || 'curriculo'}')">
                        <i data-lucide="download"></i>
                        <span>Baixar PDF</span>
                        <span class="download-description">Formato ideal para impressão</span>
                    </button>
                    
                    <button type="button" class="download-option" onclick="downloadJPG('${btoa(unescape(encodeURIComponent(templateHTML)))}', '${data.personal.fullName || 'curriculo'}')">
                        <i data-lucide="image"></i>
                        <span>Baixar JPG</span>
                        <span class="download-description">Imagem de alta qualidade</span>
                    </button>
                    
                    <button type="button" class="download-option" onclick="downloadPNG('${btoa(unescape(encodeURIComponent(templateHTML)))}', '${data.personal.fullName || 'curriculo'}')">
                        <i data-lucide="file-image"></i>
                        <span>Baixar PNG</span>
                        <span class="download-description">Imagem com fundo transparente</span>
                    </button>
                </div>
                
                <div class="share-section">
                    <div class="share-section-title">
                        <i data-lucide="share-2"></i>
                        <span>Compartilhar Currículo</span>
                    </div>
                    <div class="share-options">
                        <button type="button" class="share-btn" onclick="shareViaEmail('${data.personal.fullName || 'Currículo'}')">
                            <i data-lucide="mail"></i> Email
                        </button>
                        <button type="button" class="share-btn" onclick="shareViaWhatsApp('${data.personal.fullName || 'Currículo'}')">
                            <i data-lucide="message-circle"></i> WhatsApp
                        </button>
                        <button type="button" class="share-btn" onclick="copyShareLink('${data.personal.fullName || 'Currículo'}')">
                            <i data-lucide="link"></i> Copiar Link
                        </button>
                        <button type="button" class="share-btn" onclick="shareViaLinkedIn('${data.personal.fullName || 'Currículo'}')">
                            <i data-lucide="linkedin"></i> LinkedIn
                        </button>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-destructive" onclick="closePDFPreviewModal()">
                        <i data-lucide="x"></i> Fechar Pré-visualização
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inicializar ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Garantir que a pré-visualização seja carregada corretamente
    setTimeout(() => {
        const previewContent = document.getElementById('pdf-preview-content');
        if (previewContent) {
            previewContent.innerHTML = templateHTML;
        }
    }, 100);
}

// Função para fechar o modal corretamente
function closePDFPreviewModal() {
    const modal = document.getElementById('pdf-preview-modal');
    if (modal) {
        modal.remove();
    }
}

// Função para download em PNG
async function downloadPNG(encodedHTML, fileName) {
    try {
        showToast('Gerando PNG... Aguarde alguns segundos.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;

        tempDiv.style.cssText = `
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

        document.body.appendChild(tempDiv);

        await waitForImages(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('PNG baixado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PNG:', error);
        showToast('Erro ao gerar PNG. Tente novamente.', 'error');
    }
}

// Função para compartilhar via LinkedIn
function shareViaLinkedIn(fileName) {
    const text = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    const url = window.location.href.split('?')[0];
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
}

// Função para copiar o link de compartilhamento
function copyShareLink(fileName) {
    const currentUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Link copiado para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copiado para a área de transferência!', 'success');
    });
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

// Função para download em PNG
async function downloadPNG(encodedHTML, fileName) {
    try {
        showToast('Gerando PNG... Aguarde alguns segundos.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;

        tempDiv.style.cssText = `
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

        document.body.appendChild(tempDiv);

        await waitForImages(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('PNG baixado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PNG:', error);
        showToast('Erro ao gerar PNG. Tente novamente.', 'error');
    }
}

// Função para compartilhar via LinkedIn
function shareViaLinkedIn(fileName) {
    const text = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    const url = window.location.href.split('?')[0];
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
}

// Função para copiar o link de compartilhamento
function copyShareLink(fileName) {
    const currentUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Link copiado para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copiado para a área de transferência!', 'success');
    });
}

// Função para download em PNG
async function downloadPNG(encodedHTML, fileName) {
    try {
        showToast('Gerando PNG... Aguarde alguns segundos.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;

        tempDiv.style.cssText = `
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

        document.body.appendChild(tempDiv);

        await waitForImages(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('PNG baixado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PNG:', error);
        showToast('Erro ao gerar PNG. Tente novamente.', 'error');
    }
}

// Função para compartilhar via LinkedIn
function shareViaLinkedIn(fileName) {
    const text = `Confira meu currículo: ${fileName}\n\nGerado através do JobFrame`;
    const url = window.location.href.split('?')[0];
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
}

// Função para copiar o link de compartilhamento
function copyShareLink(fileName) {
    const currentUrl = window.location.href.split('?')[0];
    navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Link copiado para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Link copiado para a área de transferência!', 'success');
    });
}

function closePDFPreviewModal() {
    const modal = document.getElementById('pdf-preview-modal');
    if (modal) {
        modal.remove();
    }
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
        data.experience.push({
            title: experienceTitles[i] || '',
            company: experienceCompanies[i] || '',
            startDate: experienceStartDates[i] || '',
            endDate: experienceCurrent[i] ? 'Atual' : (experienceEndDates[i] || ''),
            current: !!experienceCurrent[i]
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

function generateTemplateHTML(data, template, color) {
    if (!data) return '<div style="padding: 2rem; text-align: center; color: #666;">Preencha os dados do formulário para ver a pré-visualização</div>';

    // Sistema de templates - fácil de adicionar novos
    switch(template) {
        case 'minimal':
            return generateMinimalTemplate(data, color);
        case 'classic':
            return generateClassicTemplate(data, color);
        case 'executive':
            return generateExecutiveTemplate(data, color);
        case 'elegant':
            return generateElegantTemplate(data, color);
        case 'professional':
            return generateProfessionalTemplate(data, color);
        case 'creative':
            return generateCreativeTemplate(data, color);
        case 'modern':
            return generateModernTemplate(data, color);
        case 'compact':
            return generateCompactTemplate(data, color);
        default:
            return generateClassicTemplate(data, color);
    }
}

// ======================
// TEMPLATE 1: CLÁSSICO
// ======================

function generateClassicTemplate(data, color) {
    let photoHTML = '';
    if (data.personal.photo) {
        let photoSrc = data.personal.photo;
        if (typeof photoSrc === 'object' && photoSrc instanceof Blob) {
            photoSrc = URL.createObjectURL(photoSrc);
        }
        photoHTML = `<img src="${photoSrc}" alt="Foto" class="photo">`;
    }

    const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.6; background: white; padding: 25mm; width: 210mm; min-height: 297mm; margin: 0 auto; }
      .resume-container { max-width: 100%; margin: 0 auto; background: white; }
      .header { border-bottom: 3px solid ${color}; padding-bottom: 20px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px; }
      .photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid ${color}; flex-shrink: 0; }
      .header-content h1 { font-size: 2rem; margin-bottom: 0.5rem; color: ${color}; }
      .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9rem; color: #666; }
      .section { margin-bottom: 1.5rem; }
      .section-title { font-size: 1.25rem; font-weight: 600; color: ${color}; margin-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
      .experience-item, .education-item { margin-bottom: 1rem; }
      .item-title { font-weight: 600; margin-bottom: 0.25rem; }
      .item-subtitle { color: #666; margin-bottom: 0.25rem; }
      .item-date { color: #888; font-size: 0.9rem; }
      .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .skill-tag { background: ${color}15; color: ${color}; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.9rem; border: 1px solid ${color}30; }
      .language-item { margin-bottom: 0.5rem; }
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
                    ${data.personal.photo ? photoHTML : ''}
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

// =======================
// TEMPLATE 2: EXECUTIVO 
// =======================

function generateExecutiveTemplate(data, color) {



}


// =========================
// TEMPLATE 3: MINIMALISTA 
// =========================

function generateMinimalTemplate(data, color) {
    const primaryColor = color || '#2c1a4d';
    
    let photoHTML = '';
    if (data.personal.photo) {
        let photoSrc = data.personal.photo;
        if (typeof photoSrc === 'object' && photoSrc instanceof Blob) {
            photoSrc = URL.createObjectURL(photoSrc);
        }
        photoHTML = `<img src="${photoSrc}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        photoHTML = `
            <div style="width: 100%; height: 100%; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #888; font-size: 12px; text-align: center; padding: 10px;">
                FOTO<br>DO<br>PROFISSIONAL
            </div>
        `;
    }

    const styles = `
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { background-color: #f5f5f5; color: #333; line-height: 1.6; }
            .container { display: flex; max-width: 1000px; margin: 0 auto; background-color: white; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); min-height: 297mm; }
            .left-column { flex: 1; background-color: ${primaryColor}; color: white; padding: 30px; }
            .right-column { flex: 2; padding: 30px; }
            .header { display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; }
            .photo { width: 120px; height: 120px; border-radius: 50%; margin-right: 20px; overflow: hidden; flex-shrink: 0; }
            .name-title { flex: 1; }
            .name { font-size: 28px; font-weight: bold; margin-bottom: 5px; color: ${primaryColor}; }
            .title { font-size: 18px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; color: ${primaryColor}; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; }
            .left-column .section-title { color: white; border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
            .job { margin-bottom: 20px; }
            .job-title { font-weight: bold; font-size: 16px; }
            .company { font-style: italic; margin-bottom: 5px; color: #666; }
            .period { color: #888; font-size: 14px; margin-bottom: 10px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .contact-info { font-size: 14px; line-height: 1.8; }
            .contact-info p { margin-bottom: 8px; }
            .education { margin-bottom: 15px; }
            .institution { font-weight: bold; }
            .degree { font-style: italic; margin-bottom: 5px; color: #666; }
            .activities { margin-top: 10px; }
            .divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
            .skills-list li { margin-bottom: 8px; }
            @media (max-width: 768px) {
                .container { flex-direction: column; }
                .header { flex-direction: column; text-align: center; }
                .photo { margin-right: 0; margin-bottom: 15px; }
            }
            @media print {
                body { background: white; }
                .container { box-shadow: none; margin: 0; max-width: 100%; }
            }
        </style>
    `;

    let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CV - ${data.personal.fullName || 'Currículo'}</title>
            ${styles}
        </head>
        <body>
            <div class="container">
                <div class="left-column">
                    ${data.personal.photo ? `
                    <div class="section" style="text-align: center;">
                        <div class="photo">
                            ${photoHTML}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.objective ? `
                    <div class="section">
                        <h2 class="section-title">Perfil Pessoal</h2>
                        <p>${data.objective}</p>
                    </div>
                    ` : ''}
                    
                    ${data.skills ? `
                    <div class="section">
                        <h2 class="section-title">Competências</h2>
                        <ul class="skills-list">
                            ${data.skills.split(',').map(skill => `
                                <li>${skill.trim()}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <div class="section">
                        <h2 class="section-title">Contacto</h2>
                        <div class="contact-info">
                            ${data.personal.phone ? `<p>Tel: ${data.personal.phone}</p>` : ''}
                            ${data.personal.email ? `<p>${data.personal.email}</p>` : ''}
                            ${data.personal.linkedin ? `<p>${data.personal.linkedin}</p>` : ''}
                            ${data.personal.city || data.personal.state ? `<p>${data.personal.city || ''}${data.personal.city && data.personal.state ? ', ' : ''}${data.personal.state || ''}</p>` : ''}
                        </div>
                    </div>
                    
                    ${data.languages.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Idiomas</h2>
                        <ul>
                            ${data.languages.map(lang => `
                                <li>${lang.name} - ${lang.level}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                <div class="right-column">
                    <div class="header">
                        ${!data.personal.photo ? `
                        <div class="photo">
                            ${photoHTML}
                        </div>
                        ` : ''}
                        <div class="name-title">
                            <h1 class="name">${data.personal.fullName ? data.personal.fullName.toUpperCase() : 'SEU NOME'}</h1>
                            ${data.objective ? `<p class="title">${data.objective.split('.')[0]}</p>` : '<p class="title">PROFISSIONAL</p>'}
                        </div>
                    </div>
                    
                    ${data.experience.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Experiência Profissional</h2>
                        ${data.experience.map((exp, index) => `
                            <div class="job">
                                <p class="job-title">${exp.title || 'Cargo'}</p>
                                <p class="company">${exp.company || 'Empresa'}</p>
                                <p class="period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</p>
                            </div>
                            ${index < data.experience.length - 1 ? '<div class="divider"></div>' : ''}
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${data.education.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Formação Académica</h2>
                        ${data.education.map(edu => `
                            <div class="education">
                                <p class="institution">${edu.school || 'Instituição'}</p>
                                <p class="degree">${edu.degree || 'Curso'}</p>
                                <p class="period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</p>
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

function generateElegantTemplate(data, color) {



}

// ==========================
// TEMPLATE 5: PROFISSIONAL 
// ==========================

function generateProfessionalTemplate(data, color) {



}

// ======================
// TEMPLATE 6: CRIATIVO 
// ======================

function generateCreativeTemplate(data, color) {

    const primaryColor = color || '#043382';
    const accentColor = color || '#0774bb';

    let photoHTML = '';
    if (data.personal.photo) {
        let photoSrc = data.personal.photo;
        if (typeof photoSrc === 'object' && photoSrc instanceof Blob) {
            photoSrc = URL.createObjectURL(photoSrc);
        }
        photoHTML = `<img src="${photoSrc}" alt="Foto" class="photo">`;
    }

    const styles = `
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
                font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif; 
            }
            
            body { 
                background: white; 
                color: #333333; 
                line-height: 1.6; 
                padding: 0; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto; 
            }
            
            .resume-container { 
                width: 100%; 
                margin: 0 auto; 
                background: white; 
                display: grid;
                grid-template-columns: 40% 60%;
                min-height: 297mm;
            }
            
            /* Left Sidebar - Estilo Canva Original */
            .sidebar {
                background: #191919;
                color: #ffffff;
                padding: 50px 35px;
                position: relative;
                overflow: hidden;
            }
            

            /* Header Section */
            .header {
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
                text-align: center;
            }
            
            .name-section {
                margin-bottom: 25px;
            }
            
            .first-name {
                font-size: 32px;
                font-weight: 600;
                color: white;
                display: block;
                line-height: 0.9;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .last-name {
                font-size: 32px;
                font-weight: 600;
                color: white;
                display: block;
                line-height: 0.9;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            /* Photo - Círculo como no Canva */
            .photo-container {
                text-align: center;
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
            }
            
            .photo-circle {
                width: 160px;
                height: 160px;
                border-radius: 50%;
                background: ${primaryColor};
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }
            
            .photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* Contact Info - Alinhado à esquerda */
            .contact-info {
                margin-bottom: 34px;
                position: relative;
                z-index: 2;
            }
            
            .contact-item {
                margin-bottom: 14px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                text-align: left;
                display: flex;
                align-items: flex-start;
            }
            
            .contact-label {
                font-weight: 600;
                color: ${accentColor};
                min-width: 100px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .contact-value {
                color: white;
                flex: 1;
            }
            
            /* Sections Sidebar */
            .section {
                margin-bottom: 30px;
                position: relative;
                z-index: 2;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 14px;
                color: ${accentColor};
                text-transform: uppercase;
                letter-spacing: 2px;
                border-bottom: 2px solid ${accentColor};
                padding-bottom: 6px;
            }
            
            /* Skills List */
            .skills-list {
                list-style: none;
                padding: 0;
            }
            
            .skill-item {
                margin-bottom: 8px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                padding-left: 0;
                text-align: left;
                position: relative;
                padding-left: 14px;
            }
            
            .skill-item::before {
                content: '•';
                position: absolute;
                left: 0;
                color: ${accentColor};
                font-weight: bold;
            }
            
            /* Languages */
            .language-item {
                margin-bottom: 10px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.9);
                text-align: left;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .language-name {
                font-weight: 400;
                color: white;
            }
            
            .language-level {
                color: white;
                font-size: 12px;
            }
            
            /* Main Content - Fundo branco */
            .main-content {
                padding: 50px 40px;
                background: white;
            }
            
            .main-section {
                margin-bottom: 36px;
            }
            
            .main-section-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 20px;
                color: ${primaryColor};
                text-transform: uppercase;
                letter-spacing: 2px;
                border-bottom: 2px solid ${accentColor};
                padding-bottom: 8px;
            }
            
            /* Experience & Education Items */
            .timeline-item {
                margin-bottom: 24px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 4px solid ${accentColor};
                box-shadow: 0 2px 6px rgba(0,0,0,0.08);
            }
            
            .item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 10px;
            }
            
            .item-title {
                font-weight: 700;
                font-size: 16px;
                color: #191919;
            }
            
            .item-period {
                font-size: 13px;
                color: #666666;
                font-weight: 600;
                background: ${accentColor}15;
                padding: 4px 12px;
                border-radius: 14px;
                border: 1px solid ${accentColor}30;
            }
            
            .item-subtitle {
                font-weight: 600;
                font-size: 14px;
                color: ${primaryColor};
                margin-bottom: 8px;
            }
            
            /* Decorative Elements */
            .circle-decoration {
                position: absolute;
                bottom: -60px;
                right: -60px;
                width: 150px;
                height: 150px;
                background: ${primaryColor};
                border-radius: 50%;
                opacity: 0.1;
                z-index: 1;
            }
            
            .title-section {
                margin-top: 25px;
                position: relative;
                z-index: 2;
                text-align: center;
            }
            
            .professional-title {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                text-transform: none;
                letter-spacing: 1px;
                background: ${primaryColor}40;
                padding: 8px 15px;
                border-radius: 20px;
                display: inline-block;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                }
                .resume-container {
                    box-shadow: none;
                }
            }
        </style>
    `;

    // Processar nome
    const fullName = data.personal.fullName || 'SEU NOME';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] ? nameParts[0].toUpperCase() : 'NOME';
    const lastName = nameParts.slice(1).join(' ').toUpperCase() || 'SOBRENOME';

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
            ${styles}
        </head>
        <body>
            <div class="resume-container">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-accent"></div>
                    <div class="circle-decoration"></div>
                    
                    <div class="header">
                        <div class="name-section">
                            <span class="first-name">${firstName}</span>
                            <span class="last-name">${lastName}</span>
                        </div>
                    </div>
                    
                    ${photoHTML ? `
                    <div class="photo-container">
                        <div class="photo-circle">
                            ${photoHTML}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="contact-info">
                        ${data.personal.phone ? `
                        <div class="contact-item">
                            <span class="contact-label">Celular:</span>
                            <span class="contact-value">${data.personal.phone}</span>
                        </div>
                        ` : ''}
                        
                        ${data.personal.email ? `
                        <div class="contact-item">
                            <span class="contact-label">E-mail:</span>
                            <span class="contact-value">${data.personal.email}</span>
                        </div>
                        ` : ''}
                        
                        ${data.personal.linkedin ? `
                        <div class="contact-item">
                            <span class="contact-label">LinkedIn:</span>
                            <span class="contact-value">${data.personal.linkedin}</span>
                        </div>
                        ` : ''}
                        
                        ${data.personal.city || data.personal.state ? `
                        <div class="contact-item">
                            <span class="contact-label">Cidade:</span>
                            <span class="contact-value">${data.personal.city || ''}${data.personal.city && data.personal.state ? ', ' : ''}${data.personal.state || ''}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${data.objective ? `
                    <div class="section">
                        <h2 class="section-title">Objetivo</h2>
                        <p class="about-text">${data.objective}</p>
                    </div>
                    ` : ''}
                    
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
                    
                    ${data.languages.length > 0 ? `
                    <div class="section">
                        <h2 class="section-title">Idiomas</h2>
                        ${data.languages.map(lang => `
                            <div class="language-item">
                                <span class="language-name">${lang.name}</span>
                                <span class="language-level">${lang.level}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    ${data.experience.length > 0 ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Experiência Profissional</h2>
                        ${data.experience.map(exp => `
                            <div class="timeline-item">
                                <div class="item-header">
                                    <div class="item-title">${exp.title || 'Cargo'}</div>
                                    <div class="item-period">${exp.startDate ? formatMonthYear(exp.startDate) : ''} - ${exp.current ? 'Atual' : (exp.endDate ? formatMonthYear(exp.endDate) : '')}</div>
                                </div>
                                <div class="item-subtitle">${exp.company || 'Empresa'}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : `
                    <div class="main-section">
                        <h2 class="main-section-title">Experiência Profissional</h2>
                        <div class="timeline-item">
                            <div class="item-header">
                                <div class="item-title">Product Designer</div>
                                <div class="item-period">2020 - 2022</div>
                            </div>
                            <div class="item-subtitle">Arowwai Industries</div>
                        </div>
                        <div class="timeline-item">
                            <div class="item-header">
                                <div class="item-title">Senior Designer</div>
                                <div class="item-period">2016 - 2020</div>
                            </div>
                            <div class="item-subtitle">Wardiere Inc.</div>
                        </div>
                    </div>
                    `}
                    
                    ${data.education.length > 0 ? `
                    <div class="main-section">
                        <h2 class="main-section-title">Formação Acadêmica</h2>
                        ${data.education.map(edu => `
                            <div class="timeline-item">
                                <div class="item-header">
                                    <div class="item-title">${edu.degree || 'Curso'}</div>
                                    <div class="item-period">${edu.startYear ? formatMonthYear(edu.startYear) : ''} - ${edu.current ? 'Em Andamento' : (edu.endYear ? formatMonthYear(edu.endYear) : '')}</div>
                                </div>
                                <div class="item-subtitle">${edu.school || 'Instituição'}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : `
                    <div class="main-section">
                        <h2 class="main-section-title">Formação Acadêmica</h2>
                        <div class="timeline-item">
                            <div class="item-header">
                                <div class="item-title">Bachelor of Business Management</div>
                                <div class="item-period">2014 - 2023</div>
                            </div>
                            <div class="item-subtitle">Borcelle University</div>
                        </div>
                        <div class="timeline-item">
                            <div class="item-header">
                                <div class="item-title">Master of Business Management</div>
                                <div class="item-period">2014 - 2018</div>
                            </div>
                            <div class="item-subtitle">Borcelle University</div>
                        </div>
                    </div>
                    `}
                </div>
            </div>
        </body>
        </html>
    `;

    return html;
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
// GERAÇÃO DE PDF E COMPARTILHAMENTO
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

        // Gerar o HTML do currículo
        const templateHTML = generateTemplateHTML(data, selectedTemplate, selectedColor);

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
// FUNÇÕES DE DOWNLOAD
// ================================================

async function downloadPDF(encodedHTML, fileName) {
    try {
        showToast('Gerando PDF... Aguarde alguns segundos.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));
        const { jsPDF } = window.jspdf;

        // Criar elemento temporário para renderização
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;

        // Aplicar estilos para garantir que as imagens carreguem
        tempDiv.style.cssText = `
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

        document.body.appendChild(tempDiv);

        // Aguardar o carregamento de imagens
        await waitForImages(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgHeight / imgWidth;

        let width = pdfWidth;
        let height = width * ratio;

        if (height > pdfHeight) {
            height = pdfHeight;
            width = height / ratio;
        }

        const x = (pdfWidth - width) / 2;
        const y = (pdfHeight - height) / 2;

        pdf.addImage(imgData, 'PNG', x, y, width, height);

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.pdf`;
        pdf.save(safeFileName);

        showToast('PDF baixado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
}

async function downloadJPG(encodedHTML, fileName) {
    try {
        showToast('Gerando JPG... Aguarde alguns segundos.', 'info');

        const templateHTML = decodeURIComponent(escape(atob(encodedHTML)));

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHTML;

        tempDiv.style.cssText = `
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

        document.body.appendChild(tempDiv);

        await waitForImages(tempDiv);

        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            height: tempDiv.scrollHeight
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');

        const safeFileName = `curriculo_${(fileName || 'sem_nome').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.jpg`;
        link.download = safeFileName;
        link.href = imgData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('JPG baixado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao gerar JPG:', error);
        showToast('Erro ao gerar JPG. Tente novamente.', 'error');
    }
}

// Função auxiliar para aguardar o carregamento das imagens
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000);
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
