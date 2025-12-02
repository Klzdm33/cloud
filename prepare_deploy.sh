#!/usr/bin/env bash
set -euo pipefail

# prepare_deploy.sh
# Copia todo o conteúdo extraído para um diretório `deployable/` e
# extrai zips aninhados, além de preparar comandos para instalar dependências.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXTRACTED="$ROOT_DIR/extracted"
TARGET="$ROOT_DIR/deployable/site"

echo "Preparando deploy em: $TARGET"
rm -rf "$ROOT_DIR/deployable"
mkdir -p "$TARGET"

if [ ! -d "$EXTRACTED" ]; then
  echo "Diretório extracted/ não encontrado em $ROOT_DIR" >&2
  exit 1
fi

echo "Copiando arquivos de extracted/ para deployable/site..."
cp -a "$EXTRACTED/"* "$TARGET/"

# Extrair zips aninhados (ex.: neuralmesh-mvp.zip)
find "$TARGET" -type f -iname "*.zip" | while read -r zipfile; do
  dir="${zipfile%.*}"
  echo "Extraindo $zipfile -> $dir"
  mkdir -p "$dir"
  unzip -o "$zipfile" -d "$dir"
done

echo "Criando scripts de instalação em deployable/"
cat > "$ROOT_DIR/deployable/install-deps.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)/site"
echo "Procurando por package.json e requirements.txt em $ROOT"

# Node installs
find "$ROOT" -type f -name package.json -print0 | while IFS= read -r -d '' pkg; do
  dir=$(dirname "$pkg")
  echo "Instalando dependências Node em: $dir"
  if command -v npm >/dev/null 2>&1; then
    (cd "$dir" && npm install --no-audit --no-fund)
  else
    echo "npm não encontrado — pule instalação Node em $dir"
  fi
done

# Python installs
find "$ROOT" -type f -name requirements.txt -print0 | while IFS= read -r -d '' req; do
  dir=$(dirname "$req")
  echo "Criando virtualenv e instalando em: $dir"
  python3 -m venv "$dir/.venv" || python -m venv "$dir/.venv"
  . "$dir/.venv/bin/activate"
  pip install -U pip
  pip install -r "$req"
done

echo "Instalação concluída."
SH

chmod +x "$ROOT_DIR/deployable/install-deps.sh"

cat > "$ROOT_DIR/deployable/run_site.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)/site"
if command -v npx >/dev/null 2>&1; then
  echo "Servindo site com 'npx serve' (recomendado)"
  npx serve -s "$ROOT"
elif command -v python3 >/dev/null 2>&1; then
  echo "Servindo site com 'python3 -m http.server'"
  (cd "$ROOT" && python3 -m http.server 8000)
else
  echo "Nenhuma ferramenta de servidor disponível (npx ou python)." >&2
  exit 1
fi
SH

chmod +x "$ROOT_DIR/deployable/run_site.sh"

echo "Pronto. Abra deployable/ e execute 'install-deps.sh' e depois 'run_site.sh' para testar localmente."
