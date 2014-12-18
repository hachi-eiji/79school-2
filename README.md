適当掲示板
========

79schoolの課題

* GitHubのアカウントでログイン
* 記事をmarkdownで書けるようにする
* タグ検索あり

サンプル http://jsfiddle.net/hachi_eiji/jyaybkvh/3/embedded/result/

データモデル
===

### user ユーザ情報格納

```
id: 111
loginId: hachi-eiji
avatarUrl: http://www.example.com
```


### item 記事

```
id: userIdとtimeをhashしたもの
ownerId: 1111
title: 記事タイトル
body: 本文(markdown)
likes: [1,2,3]
published: boolean
tags:["daily", "foo", "javascript", "テスト"] // 英語のみの場合は全部小文字
```

### reply 返信記事

```
id: reply用のid itemIdと時間をhash化したもの
itemId: itemId
body: 本文
```


