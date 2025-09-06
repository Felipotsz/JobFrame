// JobFrame - Gerador Inteligente de Currículos
// JavaScript Application

class JobFrameApp {
    constructor() {
        this.currentPage = 'home';
        this.currentStep = 0;
        this.formData = {
            personalInfo: {
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                linkedin: '',
                website: ''
            },
            objective: '',
            education: []
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initTheme();
        this.showPage('home');
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navigation
        document.getElementById('startButton').addEventListener('click', () => {
            this.showPage('form');
        });

        document.getElementById('backButton').addEventListener('click', () => {
            this.goBack();
        });

        // Form navigation
        document.getElementById('nextStep').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('generateResume').addEventListener('click', () => {
            this.generateResume();
        });

        // Dynamic form elements
        document.getElementById('addEducation').addEventListener('click', () => {
            this.addEducationItem();
        });

        // Form inputs
        this.bindFormInputs();

        // Resume actions
        document.getElementById('downloadPDF').addEventListener('click', () => {
            this.downloadPDF();
        });

        document.getElementById('shareResume').addEventListener('click', () => {
            this.shareResume();
        });
    }

    bindFormInputs() {
        // Personal info inputs
        const personalInputs = ['fullName', 'email', 'phone', 'address', 'city', 'linkedin', 'website'];
        personalInputs.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.formData.personalInfo[field] = e.target.value;
                    this.validateForm();
                });
            }
        });

        // Objective input
        document.getElementById('objective').addEventListener('input', (e) => {
            this.formData.objective = e.target.value;
            this.validateForm();
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('jobframe-theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');

        if (theme === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
        }

        localStorage.setItem('jobframe-theme', theme);
    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        document.getElementById(pageName + 'Page').classList.add('active');

        // Update navigation
        const backButton = document.getElementById('backButton');
        if (pageName === 'home') {
            backButton.style.display = 'none';
        } else {
            backButton.style.display = 'inline-flex';
        }

        this.currentPage = pageName;

        // Initialize page-specific functionality
        if (pageName === 'form') {
            this.updateStepIndicator();
            this.showFormSection(0);
        }
    }

    goBack() {
        switch (this.currentPage) {
            case 'form':
                this.showPage('home');
                break;
            case 'preview':
                this.showPage('form');
                break;
            default:
                this.showPage('home');
        }
    }

    showFormSection(stepIndex) {
        // Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const sections = ['personalSection', 'objectiveSection', 'educationSection'];
        if (sections[stepIndex]) {
            document.getElementById(sections[stepIndex]).classList.add('active');
        }

        this.currentStep = stepIndex;
        this.updateStepIndicator();
        this.updateFormButtons();
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index === this.currentStep);
        });
    }

    updateFormButtons() {
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');
        const generateBtn = document.getElementById('generateResume');

        prevBtn.disabled = this.currentStep === 0;

        if (this.currentStep === 2) { // Last step
            nextBtn.style.display = 'none';
            generateBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            generateBtn.style.display = 'none';
        }
    }

    nextStep() {
        if (this.currentStep < 2) {
            this.showFormSection(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.showFormSection(this.currentStep - 1);
        }
    }

    validateForm() {
        const { personalInfo, objective } = this.formData;
        const isValid = personalInfo.fullName && personalInfo.email && personalInfo.phone && objective;

        const generateBtn = document.getElementById('generateResume');
        if (generateBtn) {
            generateBtn.disabled = !isValid;
        }

        return isValid;
    }

    addEducationItem() {
        const educationId = 'education_' + Date.now();
        const educationItem = {
            id: educationId,
            institution: '',
            course: '',
            level: '',
            startDate: '',
            endDate: '',
            status: 'completed'
        };

        this.formData.education.push(educationItem);
        this.renderEducationList();
    }

    renderEducationList() {
        const container = document.getElementById('educationList');
        container.innerHTML = '';

        this.formData.education.forEach((edu, index) => {
            const item = document.createElement('div');
            item.className = 'dynamic-item';
            item.innerHTML = `
                <h4>Formação ${index + 1}</h4>
                <button type="button" class="remove-item" onclick="app.removeEducationItem('${edu.id}')">✕</button>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Instituição</label>
                        <input type="text" value="${edu.institution}" onchange="app.updateEducation('${edu.id}', 'institution', this.value)" placeholder="Nome da instituição">
                    </div>
                    <div class="form-group">
                        <label>Curso</label>
                        <input type="text" value="${edu.course}" onchange="app.updateEducation('${edu.id}', 'course', this.value)" placeholder="Nome do curso">
                    </div>
                    <div class="form-group">
                        <label>Nível</label>
                        <select onchange="app.updateEducation('${edu.id}', 'level', this.value)">
                            <option value="">Selecione o nível</option>
                            <option value="ensino-medio" ${edu.level === 'ensino-medio' ? 'selected' : ''}>Ensino Médio</option>
                            <option value="tecnico" ${edu.level === 'tecnico' ? 'selected' : ''}>Técnico</option>
                            <option value="superior" ${edu.level === 'superior' ? 'selected' : ''}>Superior</option>
                            <option value="pos-graduacao" ${edu.level === 'pos-graduacao' ? 'selected' : ''}>Pós-graduação</option>
                            <option value="mestrado" ${edu.level === 'mestrado' ? 'selected' : ''}>Mestrado</option>
                            <option value="doutorado" ${edu.level === 'doutorado' ? 'selected' : ''}>Doutorado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select onchange="app.updateEducation('${edu.id}', 'status', this.value)">
                            <option value="completed" ${edu.status === 'completed' ? 'selected' : ''}>Concluído</option>
                            <option value="in-progress" ${edu.status === 'in-progress' ? 'selected' : ''}>Em andamento</option>
                            <option value="paused" ${edu.status === 'paused' ? 'selected' : ''}>Pausado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data de Início</label>
                        <input type="month" value="${edu.startDate}" onchange="app.updateEducation('${edu.id}', 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Data de Conclusão</label>
                        <input type="month" value="${edu.endDate}" onchange="app.updateEducation('${edu.id}', 'endDate', this.value)" ${edu.status === 'in-progress' ? 'disabled' : ''}>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateEducation(id, field, value) {
        const educationItem = this.formData.education.find(edu => edu.id === id);
        if (educationItem) {
            educationItem[field] = value;

            // Re-render if status changed to update disabled state
            if (field === 'status') {
                this.renderEducationList();
            }
        }
    }

    removeEducationItem(id) {
        this.formData.education = this.formData.education.filter(edu => edu.id !== id);
        this.renderEducationList();
    }

    generateResume() {
        if (!this.validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        this.renderResumePreview();
        this.showPage('preview');
    }

    renderResumePreview() {
        const { personalInfo, objective, education } = this.formData;
        const container = document.getElementById('resumePreview');

        const contactInfo = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.city,
            personalInfo.linkedin,
            personalInfo.website
        ].filter(Boolean).join(' • ');

        const educationHTML = education.map(edu => `
            <div class="education-item">
                <div class="education-title">${edu.course}</div>
                <div class="education-institution">${edu.institution}</div>
                <div class="education-date">
                    ${edu.startDate ? this.formatDate(edu.startDate) : ''} - 
                    ${edu.status === 'in-progress' ? 'Em andamento' : (edu.endDate ? this.formatDate(edu.endDate) : '')}
                    ${edu.level ? ` • ${this.formatLevel(edu.level)}` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="resume-header">
                <div class="resume-name">${personalInfo.fullName}</div>
                <div class="resume-contact">${contactInfo}</div>
            </div>

            ${objective ? `
            <div class="resume-section">
                <div class="resume-section-title">Objetivo Profissional</div>
                <div class="resume-objective">${objective}</div>
            </div>
            ` : ''}

            ${education.length > 0 ? `
            <div class="resume-section">
                <div class="resume-section-title">Formação Acadêmica</div>
                ${educationHTML}
            </div>
            ` : ''}
        `;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    formatLevel(level) {
        const levels = {
            'ensino-medio': 'Ensino Médio',
            'tecnico': 'Técnico',
            'superior': 'Superior',
            'pos-graduacao': 'Pós-graduação',
            'mestrado': 'Mestrado',
            'doutorado': 'Doutorado'
        };
        return levels[level] || level;
    }

    async downloadPDF() {
        const element = document.getElementById('resumePreview');

        try {
            // Show loading state
            const downloadBtn = document.getElementById('downloadPDF');
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '⏳ Gerando PDF...';
            downloadBtn.disabled = true;

            // Use html2canvas to capture the element
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download the PDF
            const fileName = `curriculo_${this.formData.personalInfo.fullName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
            pdf.save(fileName);

            // Reset button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');

            // Reset button
            const downloadBtn = document.getElementById('downloadPDF');
            downloadBtn.innerHTML = '📄 Baixar PDF';
            downloadBtn.disabled = false;
        }
    }

    async shareResume() {
        const shareData = {
            title: `Currículo - ${this.formData.personalInfo.fullName}`,
            text: 'Confira meu currículo criado no JobFrame',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copiado para a área de transferência!');
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
            // Fallback: show URL in alert
            alert(`Compartilhe este link: ${window.location.href}`);
        }
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new JobFrameApp();
});

// Make app globally accessible for inline event handlers
window.app = app;