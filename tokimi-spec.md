# ときみ仕様
## ルーチン登録
- `と` or `/登録/`
  - 「新しく登録するルーチン名を入力してね。短い方が覚えやすいから嬉しいな」
    - 例)
  - 「順番に、タスクを教えてね。私の台詞っぽく書くと、会話が自然になるよ。何ごとも、協力が大切だよね」
    - 例) 顔を洗う
  - 「おっけー。まだタスクあったら、教えてー」
    - 選択肢を選ぶか、次のタスクを入力する
    - 選択肢
      1. "登録完了"
        - 「新しいルーチンはこんな感じだよ！\n（タスクリスト）\n一緒に頑張ろうね」
      2. "タスク確認"
        - 「今のところ、ルーチンはこんな感じだよ！」
          - 選択肢
    - 次のタスク入力
      - 「おっけー。まだタスクあったら、教えてー」

## ルーチン実行
- `[routine-name]やる`
  - 選択肢でルーチンを選ぶ
  - 「[routine-name]のルーチンを始めるんだね！頑張ろう！」
  - [task-name-1]
    - 選択肢
      1. "完了"
        - 「お疲れ！次は、[task-name-2]」
      2. "タスク挿入"
        - 「おっけー。このタスクの前に挿入するタスクの名前を教えてね」
        - 「タスクを挿入したよ」
        - 「早速、[new-task-name]」
      3. "削除"
        - 「このタスク、やめちゃうの？」
          - "はい" or "いいえ"
    - 「これで[routine-name]のルーチンはおしまいだよ！よく頑張ったね！」

## ルーチン確認
- `[routine-name]みる` or `[routine-name]見る`
  - 「[routine-name]のルーチンに登録されているタスクは、こんな感じだよー」
  - 「[task-list]」