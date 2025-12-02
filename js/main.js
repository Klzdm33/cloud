// NeuralMesh - Decentralized AI Computing Platform
// Main JavaScript File

class NeuralMeshApp {
    constructor() {
        this.walletConnected = false;
        this.currentUser = null;
        this.resourceManager = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupWalletConnection();
        await this.initializeResourceManager();
        this.loadMarketplaceData();
        this.updateNetworkStats();
        this.setupProviderDashboard();
    }

    async initializeResourceManager() {
        try {
            // Inicializar o gerenciador de recursos
            this.resourceManager = new ResourceManager();
            
            // Aguardar detecção do sistema
            await new Promise(resolve => {
                const checkReady = () => {
                    if (this.resourceManager && this.resourceManager.resources.cpu.cores > 0) {
                        resolve();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            });
            
            console.log('Resource Manager initialized successfully');
            this.updateSystemInfo();
        } catch (error) {
            console.error('Failed to initialize Resource Manager:', error);
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('get-started')?.addEventListener('click', () => {
            this.scrollToSection('#marketplace');
        });

        document.getElementById('start-training')?.addEventListener('click', () => {
            this.openTrainingInterface();
        });

        document.getElementById('view-marketplace')?.addEventListener('click', () => {
            this.scrollToSection('.marketplace-preview');
        });

        document.getElementById('view-full-marketplace')?.addEventListener('click', () => {
            this.openMarketplace();
        });

        document.getElementById('get-started-cta')?.addEventListener('click', () => {
            this.scrollToSection('#marketplace');
        });

        document.getElementById('schedule-demo')?.addEventListener('click', () => {
            this.scheduleDemo();
        });

        // Wallet connection
        document.getElementById('connect-wallet')?.addEventListener('click', () => {
            this.connectWallet();
        });

        // GPU rent buttons
        document.querySelectorAll('.btn-rent').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.rentGPU(button.closest('.gpu-market-card'));
                });
            }
        });

        // Mobile menu toggle
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    this.scrollToSection(link.getAttribute('href'));
                }
            });
        });
    }

    setupWalletConnection() {
        // Check if wallet is already connected (MetaMask, etc.)
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        this.connectWallet();
                    }
                })
                .catch(console.error);
        }
    }

    connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            this.showNotification('Please install MetaMask to connect your wallet', 'warning');
            return;
        }

        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                const account = accounts[0];
                this.walletConnected = true;
                this.currentUser = {
                    address: account,
                    shortAddress: this.shortenAddress(account)
                };
                
                this.updateWalletButton();
                this.showNotification('Wallet connected successfully!', 'success');
            })
            .catch(error => {
                console.error('Error connecting wallet:', error);
                this.showNotification('Failed to connect wallet', 'error');
            });
    }

    updateWalletButton() {
        const button = document.getElementById('connect-wallet');
        if (button && this.walletConnected) {
            button.innerHTML = `
                <span class="btn-icon">🔗</span>
                ${this.currentUser.shortAddress}
            `;
            button.classList.add('connected');
        }
    }

    shortenAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    scrollToSection(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    openTrainingInterface() {
        if (!this.walletConnected) {
            this.showNotification('Please connect your wallet to start training', 'warning');
            this.connectWallet();
            return;
        }

        // Open training interface modal
        this.showTrainingModal();
    }

    showTrainingModal() {
        const modal = document.createElement('div');
        modal.className = 'training-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Start AI Training</h3>
                        <button class="modal-close" onclick="this.closest('.training-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="training-form">
                            <div class="form-group">
                                <label>Model Type</label>
                                <select id="model-type">
                                    <option value="llm">Language Model</option>
                                    <option value="cv">Computer Vision</option>
                                    <option value="audio">Audio Processing</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Dataset Size</label>
                                <select id="dataset-size">
                                    <option value="small">< 1GB</option>
                                    <option value="medium">1-10GB</option>
                                    <option value="large">10-100GB</option>
                                    <option value="xlarge">> 100GB</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Preferred GPU</label>
                                <select id="gpu-type">
                                    <option value="h100">NVIDIA H100 (80GB)</option>
                                    <option value="a100">NVIDIA A100 (80GB)</option>
                                    <option value="4090">RTX 4090 (24GB)</option>
                                    <option value="any">Any Available</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Estimated Training Time</label>
                                <div class="time-estimate">
                                    <span id="estimated-time">2-4 hours</span>
                                    <small>Based on H100 GPU</small>
                                </div>
                            </div>
                            <div class="cost-estimate">
                                <div class="cost-breakdown">
                                    <span>Estimated Cost:</span>
                                    <span class="cost-amount">$45.60</span>
                                </div>
                                <small>Based on current marketplace rates</small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.training-modal').remove()">Cancel</button>
                        <button class="btn-primary" onclick="app.deployTraining()">Start Training</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .training-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
            }
            
            .modal-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--space-xl);
            }
            
            .modal-content {
                background: var(--bg-surface-2);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-md);
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                padding: var(--space-lg);
                border-bottom: 1px solid var(--border-default);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 18px;
                cursor: pointer;
                padding: var(--space-sm);
                border-radius: var(--radius-sm);
                transition: var(--transition-base);
            }
            
            .modal-close:hover {
                background: var(--bg-surface-3);
                color: var(--text-primary);
            }
            
            .modal-body {
                padding: var(--space-lg);
            }
            
            .form-group {
                margin-bottom: var(--space-lg);
            }
            
            .form-group label {
                display: block;
                margin-bottom: var(--space-sm);
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .form-group select {
                width: 100%;
                padding: var(--space-md);
                background: var(--bg-surface-1);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                font-size: 16px;
            }
            
            .time-estimate {
                background: var(--bg-surface-1);
                padding: var(--space-md);
                border-radius: var(--radius-sm);
                border: 1px solid var(--border-default);
            }
            
            #estimated-time {
                font-size: 18px;
                font-weight: 600;
                color: var(--primary-500);
                display: block;
                margin-bottom: var(--space-xs);
            }
            
            .cost-estimate {
                background: var(--bg-surface-1);
                padding: var(--space-md);
                border-radius: var(--radius-sm);
                border: 1px solid var(--primary-500);
                margin-top: var(--space-lg);
            }
            
            .cost-breakdown {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-xs);
            }
            
            .cost-amount {
                font-size: 20px;
                font-weight: 700;
                color: var(--primary-500);
            }
            
            .modal-footer {
                padding: var(--space-lg);
                border-top: 1px solid var(--border-default);
                display: flex;
                gap: var(--space-md);
                justify-content: flex-end;
            }
        `;
        document.head.appendChild(style);
    }

    deployTraining() {
        // Get form values
        const modelType = document.getElementById('model-type').value;
        const datasetSize = document.getElementById('dataset-size').value;
        const gpuType = document.getElementById('gpu-type').value;
        
        // Simulate deployment
        this.showNotification('Initializing training environment...', 'info');
        
        setTimeout(() => {
            this.showNotification('Training started successfully! Check your dashboard for progress.', 'success');
            document.querySelector('.training-modal')?.remove();
            this.openDashboard();
        }, 2000);
    }

    openDashboard() {
        // In a real app, this would navigate to a dashboard page
        this.showNotification('Dashboard feature coming soon!', 'info');
    }

    openMarketplace() {
        // In a real app, this would navigate to the full marketplace
        this.showNotification('Full marketplace coming soon!', 'info');
    }

    rentGPU(gpuCard) {
        if (!this.walletConnected) {
            this.showNotification('Please connect your wallet to rent GPUs', 'warning');
            this.connectWallet();
            return;
        }

        const model = gpuCard.querySelector('.gpu-model').textContent;
        const price = gpuCard.querySelector('.gpu-price').textContent;
        
        this.showNotification(`Rent request sent for ${model} at ${price}`, 'info');
        
        // Simulate confirmation
        setTimeout(() => {
            this.showNotification('GPU rental confirmed! Check your dashboard.', 'success');
        }, 1500);
    }

    loadMarketplaceData() {
        // Simulate real-time updates
        this.updateGPUAvailability();
        this.updatePrices();
    }

    updateGPUAvailability() {
        const availabilityElements = document.querySelectorAll('.gpu-availability');
        availabilityElements.forEach(element => {
            // Randomly update availability status
            if (Math.random() > 0.8) {
                const isAvailable = element.textContent === 'Available';
                element.textContent = isAvailable ? 'In Use' : 'Available';
                element.className = `gpu-availability ${isAvailable ? 'busy' : 'available'}`;
            }
        });
    }

    updatePrices() {
        const priceElements = document.querySelectorAll('.gpu-price');
        priceElements.forEach(element => {
            // Simulate price fluctuations (±10%)
            const basePrice = parseFloat(element.textContent.replace('$', ''));
            const variation = (Math.random() - 0.5) * 0.2; // ±10%
            const newPrice = (basePrice * (1 + variation)).toFixed(2);
            element.textContent = `$${newPrice}/hr`;
        });
    }

    updateNetworkStats() {
        // Simulate real-time network stats updates
        setInterval(() => {
            const activeGPUs = document.querySelector('.stat-value');
            if (activeGPUs && activeGPUs.textContent.match(/^\d+$/)) {
                const current = parseInt(activeGPUs.textContent);
                const change = Math.floor((Math.random() - 0.5) * 10); // ±5 change
                const newValue = Math.max(1000, current + change);
                activeGPUs.textContent = newValue;
            }
        }, 5000);
    }

    scheduleDemo() {
        // In a real app, this would open a calendar integration
        this.showNotification('Demo scheduling feature coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: var(--space-xl);
                background: var(--bg-surface-2);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-sm);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 300ms ease;
                max-width: 400px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid var(--success);
            }
            
            .notification-warning {
                border-left: 4px solid var(--warning);
            }
            
            .notification-error {
                border-left: 4px solid var(--error);
            }
            
            .notification-info {
                border-left: 4px solid var(--primary-500);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--space-md);
                padding: var(--space-md);
            }
            
            .notification-icon {
                font-size: 18px;
            }
            
            .notification-message {
                flex: 1;
                font-size: 14px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 14px;
                padding: var(--space-xs);
                border-radius: var(--radius-sm);
                transition: var(--transition-base);
            }
            
            .notification-close:hover {
                background: var(--bg-surface-3);
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    toggleMobileMenu() {
        // Implement mobile menu toggle
        console.log('Toggle mobile menu');
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.feature-card, .gpu-market-card, .pricing-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 600ms ease, transform 600ms ease';
            observer.observe(el);
        });
    }

    // Provider Dashboard Management
    setupProviderDashboard() {
        // Event listeners for provider controls
        const startProviderBtn = document.getElementById('start-provider');
        const stopProviderBtn = document.getElementById('stop-provider');
        
        if (startProviderBtn) {
            startProviderBtn.addEventListener('click', () => this.startProvider());
        }
        
        if (stopProviderBtn) {
            stopProviderBtn.addEventListener('click', () => this.stopProvider());
        }

        // Setup configuration sliders
        this.setupConfigurationSliders();

        // Listen for resource manager events
        window.addEventListener('miningStatsUpdate', (event) => {
            this.updateMiningStats(event.detail);
        });

        window.addEventListener('providerStatusChange', (event) => {
            this.updateProviderStatus(event.detail);
        });

        window.addEventListener('networkConnectionChange', (event) => {
            this.updateNetworkConnection(event.detail);
        });
    }

    async startProvider() {
        if (!this.resourceManager) {
            console.error('Resource Manager not initialized');
            return;
        }

        try {
            const startBtn = document.getElementById('start-provider');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<span>⏳</span> Starting...';
            }

            await this.resourceManager.startProvidingResources();
            
            // Update UI
            this.updateProviderUI(true);
            
            console.log('Provider started successfully');
        } catch (error) {
            console.error('Failed to start provider:', error);
            
            // Reset button
            const startBtn = document.getElementById('start-provider');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<span>🚀</span> Start Sharing';
            }
        }
    }

    async stopProvider() {
        if (!this.resourceManager) return;

        try {
            const stopBtn = document.getElementById('stop-provider');
            if (stopBtn) {
                stopBtn.disabled = true;
                stopBtn.innerHTML = '<span>⏳</span> Stopping...';
            }

            this.resourceManager.stopProvidingResources();
            
            // Update UI
            this.updateProviderUI(false);
            
            // Reset button
            if (stopBtn) {
                stopBtn.disabled = false;
                stopBtn.innerHTML = '<span>⏹️</span> Stop Sharing';
            }
            
            console.log('Provider stopped successfully');
        } catch (error) {
            console.error('Failed to stop provider:', error);
        }
    }

    updateProviderUI(isActive) {
        const startBtn = document.getElementById('start-provider');
        const stopBtn = document.getElementById('stop-provider');
        const providerStatus = document.getElementById('provider-status');
        const providerDot = document.getElementById('provider-dot');

        if (startBtn && stopBtn) {
            startBtn.style.display = isActive ? 'none' : 'block';
            stopBtn.style.display = isActive ? 'block' : 'none';
        }

        if (providerStatus) {
            providerStatus.textContent = isActive ? 'Active' : 'Inactive';
        }

        if (providerDot) {
            providerDot.className = `status-dot ${isActive ? 'active' : 'inactive'}`;
        }

        // Add mining animation class
        const statusCard = document.querySelector('.provider-status-card');
        if (statusCard) {
            if (isActive) {
                statusCard.classList.add('mining');
            } else {
                statusCard.classList.remove('mining');
            }
        }
    }

    updateMiningStats(stats) {
        // Update earnings
        const earningsElement = document.getElementById('earnings');
        if (earningsElement) {
            earningsElement.textContent = NeuralMeshUtils.formatCurrency(stats.earnings);
        }

        // Update resource usage bars
        this.updateResourceUsage('cpu', stats.cpuUsage);
        this.updateResourceUsage('gpu', stats.gpuUsage);
        this.updateResourceUsage('memory', stats.memoryUsage);
    }

    updateProviderStatus(detail) {
        const providerStatus = document.getElementById('provider-status');
        const providerDot = document.getElementById('provider-dot');

        if (providerStatus) {
            providerStatus.textContent = detail.status;
        }

        if (providerDot) {
            providerDot.className = `status-dot ${detail.isActive ? 'active' : 'inactive'}`;
        }
    }

    updateNetworkConnection(detail) {
        const networkStatus = document.getElementById('network-status');
        const networkDot = document.getElementById('network-dot');

        if (networkStatus) {
            networkStatus.textContent = detail.connected ? 'Connected' : 'Disconnected';
        }

        if (networkDot) {
            networkDot.className = `status-dot ${detail.connected ? 'online' : 'offline'}`;
        }
    }

    updateResourceUsage(resourceType, usage) {
        const usageElement = document.getElementById(`${resourceType}-usage`);
        if (!usageElement) return;

        const fillElement = usageElement.querySelector('.usage-fill');
        const textElement = usageElement.querySelector('.usage-text');

        if (fillElement) {
            fillElement.style.width = `${usage}%`;
        }

        if (textElement) {
            textElement.textContent = `${Math.round(usage)}% usage`;
        }
    }

    updateSystemInfo() {
        if (!this.resourceManager) return;

        const resources = this.resourceManager.resources;
        const systemInfo = {
            'cpu-cores': `${resources.cpu.cores} cores`,
            'gpu-available': resources.gpu.available ? 'Yes' : 'No',
            'memory-amount': `${Math.round(resources.memory.total / 1024)}GB`,
            'storage-amount': `${resources.storage.total}GB ${resources.storage.type}`
        };

        Object.entries(systemInfo).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    setupConfigurationSliders() {
        // CPU limit slider
        const cpuLimitSlider = document.getElementById('cpu-limit');
        const cpuLimitValue = document.getElementById('cpu-limit-value');
        
        if (cpuLimitSlider && cpuLimitValue) {
            cpuLimitSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                cpuLimitValue.textContent = `${value}%`;
                
                if (this.resourceManager) {
                    this.resourceManager.configureResources({ cpuLimit: value });
                }
            });
        }

        // Memory limit slider
        const memoryLimitSlider = document.getElementById('memory-limit');
        const memoryLimitValue = document.getElementById('memory-limit-value');
        
        if (memoryLimitSlider && memoryLimitValue) {
            memoryLimitSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                memoryLimitValue.textContent = `${value}%`;
                
                if (this.resourceManager) {
                    this.resourceManager.configureResources({ memoryLimit: value });
                }
            });
        }

        // Auto-start checkbox
        const autoStartCheckbox = document.getElementById('auto-start');
        if (autoStartCheckbox) {
            autoStartCheckbox.addEventListener('change', (e) => {
                localStorage.setItem('neuralmesh-auto-start', e.target.checked);
            });

            // Load saved preference
            const savedAutoStart = localStorage.getItem('neuralmesh-auto-start');
            if (savedAutoStart === 'true') {
                autoStartCheckbox.checked = true;
            }
        }
    }

    // Method to get current system performance
    getSystemPerformance() {
        if (!this.resourceManager) return null;
        
        return {
            systemInfo: this.resourceManager.getSystemInfo(),
            performance: this.resourceManager.getPerformanceLogs()
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NeuralMeshApp();
});

// Add some utility functions
window.NeuralMeshUtils = {
    // Format currency
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Format numbers with separators
    formatNumber: (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    },
    
    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Generate random wallet address
    generateWalletAddress: () => {
        const chars = '0123456789abcdef';
        let result = '0x';
        for (let i = 0; i < 40; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralMeshApp;
}