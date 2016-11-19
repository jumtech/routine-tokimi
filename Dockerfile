# 元になるimageを指定
FROM node

# コマンド実行時のディレクトリ
WORKDIR /root/routine-tokimi

# 各種インストール
# vim
RUN apt-get update
RUN apt-get -y install vim

# expressコマンド
RUN npm install -g express-generator

# ファイル変更時に自動でサーバ再起動してくれるdemon
RUN npm install -g nodemon