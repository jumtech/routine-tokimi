# 元になるimageを指定
FROM node:7.1.0

# コマンド実行時のディレクトリ
RUN mkdir /app
WORKDIR /app

# 各種インストール
# vim
RUN apt-get update
RUN apt-get -y install vim

# expressコマンド
# ファイル変更時に自動でサーバ再起動してくれるdemon
RUN npm install -g \
  express-generator \
  nodemon
