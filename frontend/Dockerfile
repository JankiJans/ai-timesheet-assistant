FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Informujemy o porcie Vite
EXPOSE 5173

# Uruchamiamy Vite z flagą --host, żeby Docker mógł przekazać ruch na zewnątrz
CMD ["npm", "run", "dev", "--", "--host"]