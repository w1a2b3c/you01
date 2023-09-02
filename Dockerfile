FROM node:latest as build
RUN apt-get update && apt-get -y upgrade
RUN git clone https://github.com/cholewa-p/react-tetris.git
WORKDIR "./react-tetris"
RUN npm install
RUN npm run build

FROM build as test
WORKDIR "./react-tetris"
RUN npm run test