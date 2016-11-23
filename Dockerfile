# 元になるimageを指定
FROM node:7.1.0

# コマンド実行時のディレクトリ
RUN mkdir /app
WORKDIR /app

# 各種インストール
# vim
RUN apt-get update
RUN apt-get -y install vim
# entrykit
RUN mkdir tmp && \
    cd tmp && \
    wget https://github.com/progrium/entrykit/releases/download/v0.4.0/entrykit_0.4.0_Linux_x86_64.tgz && \
    tar zxvf entrykit_0.4.0_Linux_x86_64.tgz && \
    cp entrykit /bin/ && \
    /bin/entrykit --symlink && \
    cd ../ && \
    rm -rf tmp

# expressコマンド
# ファイル変更時に自動でサーバ再起動してくれるdemon
RUN npm install -g \
  express-generator \
  nodemon

ENTRYPOINT [ \
  "prehook", "npm install", "--", \
  "switch", \
    "shell=/bin/bash", \
    "version=node -v", \
    "dev=npm run dev", \
    "migrate=/app/node_modules/.bin/sequelize -c config/config.js db:migrate", \
    "rollback=/app/node_modules/.bin/sequelize -c config/config.js db:migrate:undo", \
    "--", \
  "npm", "run", "start" \
]
