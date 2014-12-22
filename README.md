適当掲示板
========

79schoolの課題

* GitHubのアカウントでログイン
* 記事をmarkdownで書けるようにする
* タグ検索あり

サンプル http://jsfiddle.net/hachi_eiji/jyaybkvh/3/embedded/result/

使用する環境変数
===

 key | value 
-----|------
NODE_MONGO_URL | mongodb URL
NODE_GITHUB_CLIENT_ID | GitHub Application clinet ID
NODE_GITHUB_SECRET | GitHub Application SECRET KEY

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
tags:["daily", "foo", "javascript", "テスト"] 
searchTag:["daily", "foo", "javascript", "テスト"] // 検索用タグ
createAt: 日付 Numberで格納
updateAt: 日付 Numberで格納
```

### reply 返信記事

```
id: reply用のid itemIdと時間をhash化したもの
itemId: itemId
body: 本文
```

tasks
===

- [ ] 記事詳細に返信
- [ ] 検索
- [ ] 記事詳細に投稿者の詳細情報出す
- [ ] プロフィール系の変更

