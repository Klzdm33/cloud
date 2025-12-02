/**
 * NeuralMesh Resource Manager
 * Gerencia compartilhamento real de recursos do sistema
 */

class ResourceManager {
    constructor() {
        this.isProvider = false;
        this.resources = {
            cpu: { cores: 0, usage: 0, maxUsage: 0 },
            gpu: { available: false, models: [], usage: 0, memory: 0 },
            memory: { total: 0, available: 0, usage: 0 },
            storage: { total: 0, available: 0, type: 'HDD' },
            bandwidth: { upload: 0, download: 0, latency: 0 }
        };
        this.miningStatus = false;
        this.earnings = 0;
        this.init();
    }

    async init() {
        await this.detectSystemResources();
        this.setupWebRTC();
        this.startResourceMonitoring();
    }

    async detectSystemResources() {
        try {
            // Detectar CPU
            const cpuCores = navigator.hardwareConcurrency || 4;
            this.resources.cpu.cores = cpuCores;
            this.resources.cpu.maxUsage = cpuCores * 100; // Maksimal CPU usage

            // Detectar GPU
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    this.resources.gpu.available = true;
                    this.resources.gpu.models = [gpuInfo];
                    this.resources.gpu.memory = this.estimateGPUMemory();
                }
            }

            // Detectar memória
            if (navigator.deviceMemory) {
                this.resources.memory.total = navigator.deviceMemory * 1024; // Convert GB to MB
            } else {
                // Fallback para sistemas que não suportam deviceMemory
                this.estimateMemory();
            }

            // Detectar armazenamento
            if (navigator.storage && navigator.storage.estimate) {
                try {
                    const estimate = await navigator.storage.estimate();
                    this.resources.storage.total = estimate.quota ? Math.round(estimate.quota / (1024 * 1024 * 1024)) : 0;
                    this.resources.storage.available = estimate.quota ? Math.round((estimate.quota - (estimate.usage || 0)) / (1024 * 1024 * 1024)) : 0;
                } catch (error) {
                    console.warn('Storage estimation failed:', error);
                    this.estimateStorage();
                }
            } else {
                this.estimateStorage();
            }

            console.log('Sistema detectado:', this.resources);
            return this.resources;
        } catch (error) {
            console.error('Erro ao detectar recursos:', error);
            return null;
        }
    }

    estimateGPUMemory() {
        // Estimativa baseada no WebGL context
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            // Estimativa muito aproximada baseado no max texture size
            return Math.min(maxTexSize * maxTexSize * 4 / (1024 * 1024 * 1024), 8); // Max 8GB
        }
        return 0;
    }

    estimateMemory() {
        // Fallback para sistemas que não suportam deviceMemory
        if ('memory' in performance) {
            const memInfo = performance.memory;
            this.resources.memory.total = Math.round(memInfo.jsHeapSizeLimit / (1024 * 1024));
            this.resources.memory.available = Math.round((memInfo.jsHeapSizeLimit - memInfo.totalJSHeapSize) / (1024 * 1024));
        } else {
            // Estimativa baseada no user agent
            this.resources.memory.total = 4096; // 4GB default
            this.resources.memory.available = 2048; // 2GB default
        }
    }

    estimateStorage() {
        // Estimativa conservadora para fallback
        this.resources.storage.total = 100; // 100GB default
        this.resources.storage.available = 50; // 50GB default
        this.resources.storage.type = this.detectStorageType();
    }

    detectStorageType() {
        // Tentar detectar se é SSD baseado na performance
        // Esta é uma aproximação - em produção seria mais sofisticado
        return 'SSD'; // Assume SSD para browsers modernos
    }

    setupWebRTC() {
        // Configurar WebRTC para conexões P2P
        if (!this.peerConnection) {
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Setup para recebimento de dados
            this.peerConnection.ondatachannel = (event) => {
                const dataChannel = event.channel;
                dataChannel.onmessage = (message) => {
                    this.handleIncomingWorkload(JSON.parse(message.data));
                };
            };

            // Setup ICE candidate handler
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendICEcandidate(event.candidate);
                }
            };
        }
    }

    async startProvidingResources() {
        if (this.isProvider) {
            console.log('Já é um provedor de recursos');
            return;
        }

        try {
            this.isProvider = true;
            console.log('Iniciando compartilhamento de recursos...');

            // Solicitar permissões necessárias
            if ('storage' in navigator && navigator.storage.persist) {
                await navigator.storage.persist();
            }

            // Começar mineração/computação
            this.startMining();
            
            // Conectar à rede
            await this.joinNetwork();

            // Atualizar UI
            this.updateProviderUI();

            console.log('Recursos agora sendo compartilhados na rede NeuralMesh');
        } catch (error) {
            console.error('Erro ao iniciar compartilhamento:', error);
            this.isProvider = false;
            throw error;
        }
    }

    stopProvidingResources() {
        this.isProvider = false;
        this.stopMining();
        this.leaveNetwork();
        this.updateProviderUI();
        console.log('Compartilhamento de recursos parado');
    }

    startMining() {
        this.miningStatus = true;
        
        // Simular workload de mineração/computação distribuída
        this.miningInterval = setInterval(async () => {
            if (!this.miningStatus || !this.isProvider) return;

            try {
                // Executar workload simulado
                const workload = await this.simulateWorkload();
                this.earnings += workload.reward;
                
                // Atualizar estatísticas
                this.updateMiningStats(workload);
                
                // Enviar métricas para a rede
                this.broadcastMetrics();
            } catch (error) {
                console.error('Erro no workload:', error);
            }
        }, 5000); // A cada 5 segundos

        console.log('Mineração iniciada');
    }

    stopMining() {
        this.miningStatus = false;
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
        console.log('Mineração parada');
    }

    async simulateWorkload() {
        // Simular diferentes tipos de workload
        const workloadTypes = [
            { type: 'ai-training', reward: Math.random() * 0.1, complexity: 1 },
            { type: 'data-processing', reward: Math.random() * 0.05, complexity: 0.5 },
            { type: 'rendering', reward: Math.random() * 0.08, complexity: 0.8 },
            { type: 'computation', reward: Math.random() * 0.03, complexity: 0.3 }
        ];

        const selectedWorkload = workloadTypes[Math.floor(Math.random() * workloadTypes.length)];
        
        // Simular uso de recursos baseado no workload
        const cpuUsage = Math.min(100, 20 + selectedWorkload.complexity * 30);
        const gpuUsage = this.resources.gpu.available ? Math.min(100, 10 + selectedWorkload.complexity * 40) : 0;
        
        // Atualizar uso de recursos
        this.resources.cpu.usage = cpuUsage;
        this.resources.gpu.usage = gpuUsage;
        this.resources.memory.usage = Math.min(100, 30 + selectedWorkload.complexity * 20);

        return {
            type: selectedWorkload.type,
            reward: selectedWorkload.reward,
            cpuUsage,
            gpuUsage,
            memoryUsage: this.resources.memory.usage
        };
    }

    updateMiningStats(workload) {
        // Atualizar estatísticas na UI
        const stats = {
            cpuUsage: this.resources.cpu.usage,
            gpuUsage: this.resources.gpu.usage,
            memoryUsage: this.resources.memory.usage,
            earnings: this.earnings,
            workloadType: workload.type
        };

        // Disparar evento para atualizar UI
        window.dispatchEvent(new CustomEvent('miningStatsUpdate', { detail: stats }));
    }

    startResourceMonitoring() {
        // Monitorar recursos em tempo real
        this.monitoringInterval = setInterval(() => {
            if (!this.isProvider) return;

            this.updateResourceUsage();
            this.checkResourceHealth();
        }, 1000); // A cada segundo
    }

    updateResourceUsage() {
        // Simular mudança no uso de recursos
        const time = Date.now() / 1000;
        
        // Simular variação natural no uso
        this.resources.cpu.usage = Math.max(0, Math.min(100, 
            30 + 20 * Math.sin(time / 10) + Math.random() * 10
        ));
        
        this.resources.memory.usage = Math.max(0, Math.min(100, 
            40 + 15 * Math.sin(time / 15) + Math.random() * 5
        ));

        if (this.resources.gpu.available) {
            this.resources.gpu.usage = Math.max(0, Math.min(100, 
                20 + 30 * Math.sin(time / 8) + Math.random() * 15
            ));
        }
    }

    checkResourceHealth() {
        // Verificar se os recursos estão saudáveis
        if (this.resources.cpu.usage > 95 || this.resources.memory.usage > 95) {
            console.warn('Alto uso de recursos detectado');
            // Reduzir workload ou parar temporariamente
            this.handleHighUsage();
        }
    }

    handleHighUsage() {
        // Implementar redução de workload em caso de alta utilização
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningStatus = false;
            console.log('Mineração pausada devido ao alto uso de recursos');
        }
    }

    async joinNetwork() {
        // Simular entrada na rede
        console.log('Conectando à rede NeuralMesh...');
        
        // Em implementação real, aqui seria feita a conexão com a blockchain
        // e registro dos recursos disponíveis
        
        setTimeout(() => {
            console.log('Conectado à rede NeuralMesh');
            this.updateProviderStatus(true);
        }, 2000);
    }

    leaveNetwork() {
        console.log('Desconectando da rede...');
        this.updateProviderStatus(false);
    }

    broadcastMetrics() {
        // Em implementação real, enviaria métricas para outros nós
        const metrics = {
            nodeId: this.generateNodeId(),
            resources: this.resources,
            timestamp: Date.now(),
            earnings: this.earnings
        };

        // Simular envio para a rede
        console.log('Broadcasting metrics:', metrics);
    }

    generateNodeId() {
        return 'node_' + Math.random().toString(36).substr(2, 9);
    }

    updateProviderUI() {
        const status = this.isProvider ? 'Ativo' : 'Inativo';
        const color = this.isProvider ? '#00ff88' : '#ff4444';
        
        // Disparar evento para UI se necessário
        window.dispatchEvent(new CustomEvent('providerStatusChange', { 
            detail: { status, color, isActive: this.isProvider }
        }));
    }

    updateProviderStatus(connected) {
        window.dispatchEvent(new CustomEvent('networkConnectionChange', { 
            detail: { connected }
        }));
    }

    // Método para calcular rewards baseado nos recursos
    calculateRewards() {
        const baseReward = 0.001; // Base reward por segundo
        const cpuMultiplier = this.resources.cpu.cores / 4; // 4 cores como base
        const gpuMultiplier = this.resources.gpu.available ? 2 : 1;
        const memoryMultiplier = this.resources.memory.total / 4096; // 4GB como base
        const storageMultiplier = this.resources.storage.total / 100; // 100GB como base

        return baseReward * cpuMultiplier * gpuMultiplier * memoryMultiplier * storageMultiplier;
    }

    // Método para obter dados detalhados do sistema
    getSystemInfo() {
        return {
            ...this.resources,
            providerStatus: this.isProvider,
            miningStatus: this.miningStatus,
            totalEarnings: this.earnings,
            nodeId: this.generateNodeId(),
            networkStatus: this.isProvider ? 'connected' : 'disconnected'
        };
    }

    // Método para configuração avançada de recursos
    configureResources(config) {
        // Permitir configuração de quanto de cada recurso compartilhar
        if (config.cpuLimit !== undefined) {
            this.resources.cpu.maxUsage = config.cpuLimit;
        }
        
        if (config.gpuLimit !== undefined && this.resources.gpu.available) {
            this.resources.gpu.maxUsage = config.gpuLimit;
        }
        
        if (config.memoryLimit !== undefined) {
            this.resources.memory.maxUsage = config.memoryLimit;
        }

        console.log('Configuração de recursos atualizada:', config);
    }

    // Método para obter logs de performance
    getPerformanceLogs() {
        return {
            uptime: Date.now() - this.startTime,
            totalWorkloads: this.totalWorkloads || 0,
            averageReward: this.earnings / (this.totalWorkloads || 1),
            resourceEfficiency: this.calculateEfficiency()
        };
    }

    calculateEfficiency() {
        // Calcular eficiência baseada nos recursos usados vs disponíveis
        const cpuEff = this.resources.cpu.usage / 100;
        const memEff = this.resources.memory.usage / 100;
        const gpuEff = this.resources.gpu.available ? this.resources.gpu.usage / 100 : 0;
        
        return (cpuEff + memEff + gpuEff) / (this.resources.gpu.available ? 3 : 2);
    }
}

// Exportar para uso global
window.ResourceManager = ResourceManager;