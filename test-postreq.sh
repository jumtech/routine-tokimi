#!/bin/bash

if [ $# -eq 0 ]; then
  TEXT="Hello world!"
  echo "ユーザーからのメッセージ文言を第一引数で渡せますよ。"
  echo "defaultは、\"${TEXT}\"です"
else
  TEXT=$1
fi
echo "送信メッセージ：$TEXT"
JSON="{\"events\": [{\"replyToken\": \"nHuyWiB7yP5Zw52FIkcQobQuGDXCTA\",\"type\": \"message\",\"timestamp\": 1462629479859,\"source\": { \"type\": \"user\", \"userId\": \"U206d25c2ea6bd87c17655609a1c37cb8\" }, \"message\": { \"id\": \"325708\", \"type\": \"text\", \"text\": \"$TEXT\"}}]}"
curl -X POST http://localhost:8080/callback -H "Accept: application/json" -H "Content-type: application/json" -d "$JSON"
