FROM node:latest as build
RUN apt-get update && apt-get -y upgrade
RUN git clone https://github.com/cholewa-p/react-tetris.git
WORKDIR "/react-tetris"
EXPOSE 8080
RUN npm install
CMD ["npm", "start"]


