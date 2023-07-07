# フロント

https://github.com/FirebaseExtended/firebase-auth-service-worker-sessions
が、今現状のnodeのバージョンでは動かないなど有りましたので、単純に作り直してみました。

React+Viteです。
Viteのpluginを使ってService WorkerとReactを使っています。

## コンセプト

sw.tsがそのままサービスワーカーとしてinstallされ、起動します

## 起動方法

firebase.tsの以下の部分を埋めてください

```ts
export const app = firebase.initializeApp({
  apiKey: "xxxxxxx",
  authDomain: "xxxxxxx",
  projectId: "xxxxxxx",
  storageBucket: "xxxxxxx",
  messagingSenderId: "xxxxxxx",
  appId: "xxxxxxx",
  measurementId: "xxxxxxx",
});
```

起動コマンド
```bash
npm i
npm run dev
```
