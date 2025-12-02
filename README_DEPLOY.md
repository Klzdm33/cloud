# Deploy local do site

Este diretório contém scripts para preparar o conteúdo extraído em `extracted/` e torná-lo pronto para execução local.

Passos:

1. Preparar a pasta `deployable/` (copia `extracted/`, extrai zips aninhados):

```bash
cd /workspaces/cloud
./prepare_deploy.sh
```

2. Instalar dependências (Node/Python) automaticamente:

```bash
cd /workspaces/cloud/deployable
./install-deps.sh
```

3. Executar (servir) o site localmente:

```bash
cd /workspaces/cloud/deployable
./run_site.sh
```

Observações:
- Os scripts devem ser executados localmente no seu ambiente de desenvolvimento (no container/devbox onde o repositório esteja montado).
- `install-deps.sh` usa `npm` para projetos com `package.json` e cria virtualenvs Python quando encontra `requirements.txt`.
- Se o repositório tiver projetos adicionais, verifique os `package.json`/`requirements.txt` apropriados.
