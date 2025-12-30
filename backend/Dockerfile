FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Tạo thư mục uploads nếu chưa có
RUN mkdir -p uploads/avatars uploads/ho-so-di-nuoc-ngoai uploads/regulations uploads/temp uploads/VIEN_CHUC

EXPOSE 3000

CMD ["node", "src/server.js"]
