# NeuralMesh - Decentralized AI Computing Platform

> **MVP Professional viável para o mercado de cloud descentralizada focada em AI/ML workloads**

## 🚀 Deploy to GitHub Pages

This repository contains the NeuralMesh dashboard that can be deployed to GitHub Pages. Follow these steps to deploy:

### Method 1: Using GitHub Actions (Recommended)

1. Fork this repository to your GitHub account
2. Go to your forked repository settings
3. Under "Pages" section, select "Deploy from a branch"
4. Select `gh-pages` as the source branch
5. Your site will be available at `https://your-username.github.io/repository-name`

### Method 2: Manual Deployment

1. Clone your forked repository:
   ```bash
   git clone https://github.com/your-username/your-repository-name.git
   cd your-repository-name
   ```

2. Make sure you're on the main branch:
   ```bash
   git checkout main
   ```

3. Create a gh-pages branch for GitHub Pages deployment:
   ```bash
   git checkout -b gh-pages
   ```

4. Deploy to GitHub Pages:
   ```bash
   npx serve -p 3000
   ```
   (Note: For actual GitHub Pages deployment, you would use a static site generator or push static files)

### 🎯 About NeuralMesh

NeuralMesh is a decentralized computing platform designed specifically for AI/ML workloads. Our platform offers:

- **GPU Computing Descentralizado** with prices up to 85% lower than AWS/GCP
- **Data Sovereignty** with complete control over data and infrastructure
- **Payment in Crypto** with native DeFi integration
- **Enterprise Compliance** with SLAs and robust governance

### 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS with responsive design
- **Deployment**: GitHub Pages, Vercel, Netlify
- **Web3 Integration**: WalletConnect, MetaMask support

### 📁 Project Structure

```
├── index.html              # Main application entry point
├── styles/
│   └── main.css           # Main stylesheet
├── js/
│   ├── main.js            # Main application logic
│   └── resource-manager.js # Resource management functions
├── README.md              # Main documentation
├── package.json           # Project metadata and scripts
├── vercel.json            # Vercel deployment configuration
└── netlify.toml           # Netlify deployment configuration
```

### 🚀 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser

### 📊 Features

- Real-time GPU marketplace with H100, A100, and RTX 4090 availability
- Dynamic pricing with crypto payments
- Provider reputation system
- Enterprise security with end-to-end encryption
- Responsive design with dark mode support
- Web3 wallet integration

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.