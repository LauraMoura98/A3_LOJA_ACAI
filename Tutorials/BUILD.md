Para fazer o build do seu front-end em React e do back-end em Django usando Docker, você pode criar arquivos `Dockerfile` separados para cada serviço e gerenciá-los com o `docker-compose` para facilitar o processo de build e execução conjunta. Vou te mostrar como fazer isso.

### Passo 1: Estrutura de Arquivos
A estrutura do projeto deve ser algo assim:
```
meu_projeto/
├── backend/
│   ├── Dockerfile
│   └── manage.py
│   └── ... (outros arquivos do Django)
├── frontend/
│   ├── Dockerfile
│   └── package.json
│   └── ... (outros arquivos do React)
└── docker-compose.yml
```

### Passo 2: Configurar o Dockerfile do Backend (Django)

Crie um `Dockerfile` dentro do diretório `backend/`:

```dockerfile
# Dockerfile para o backend
# Use a imagem base do Python
FROM python:3.10

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o arquivo de requisitos e instale as dependências
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copie o restante dos arquivos do Django para o container
COPY . .

# Expõe a porta que o Django vai usar
EXPOSE 8000

# Comando para iniciar o servidor Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Passo 3: Configurar o Dockerfile do Frontend (React)

Crie um `Dockerfile` dentro do diretório `frontend/`:

```dockerfile
# Dockerfile para o frontend
# Use a imagem base do Node
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o arquivo de dependências e instale-as
COPY package.json package-lock.json ./
RUN npm install

# Copie o restante dos arquivos do React para o container
COPY . .

# Build da aplicação para produção
RUN npm run build

# Expõe a porta que o React vai usar
EXPOSE 3000

# Comando para iniciar o servidor do React (ou um servidor de produção, como serve)
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

### Passo 4: Configurar o docker-compose.yml

No diretório raiz do projeto, crie o arquivo `docker-compose.yml` para definir como os serviços devem ser executados:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: meu_banco
      POSTGRES_USER: meu_usuario
      POSTGRES_PASSWORD: minha_senha
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### Passo 5: Rodar os Containers

Para construir e rodar os containers, use os comandos abaixo no terminal, dentro da pasta do projeto:

1. Para construir as imagens:
   ```bash
   docker-compose build
   ```

2. Para iniciar os containers:
   ```bash
   docker-compose up
   ```

3. Para rodar em segundo plano (detached mode):
   ```bash
   docker-compose up -d
   ```

### Passo 6: Acessar os Serviços

- O backend estará acessível em `http://localhost:8000`.
- O frontend estará acessível em `http://localhost:3000`.

Com essa configuração, você terá um ambiente isolado para o front-end e o back-end em Docker, podendo também modificar o `docker-compose.yml` para facilitar o desenvolvimento e o deploy.