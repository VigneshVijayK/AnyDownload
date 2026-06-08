FROM node:20-bookworm-slim

RUN apt-get update -qq && apt-get install -y -qq python3 python3-pip ffmpeg curl \
  && pip3 install --break-system-packages yt-dlp -q \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]
