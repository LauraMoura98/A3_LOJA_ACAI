# Base de produção com Nginx
FROM nginx:1.27.2-alpine-slim

# Define o diretório de trabalho
WORKDIR /usr/share/nginx/html

# Copia os arquivos do frontend diretamente para o diretório do Nginx
COPY ./frontend /usr/share/nginx/html

# Copia a configuração customizada do Nginx (opcional)
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
