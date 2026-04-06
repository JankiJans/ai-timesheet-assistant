# Używamy lekkiego obrazu Node.js
FROM node:18-alpine 

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy pliki z zależnościami
COPY package*.json ./

# Instalujemy wszystkie pakiety
RUN npm install

# Kopiujemy resztę kodu aplikacji
COPY . .

# Generujemy klienta Prismy dla bazy danych wewnątrz Dockera
RUN npx prisma generate

# Kompilujemy aplikację NestJS (tworzy folder /dist)
RUN npm run build

# Otwieramy port, na którym działa Twój NestJS
EXPOSE 5000

# Uruchamiamy skompilowaną aplikację produkcyjnie
CMD ["npm", "run", "start:prod"]