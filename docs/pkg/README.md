# Double Pendulum Lab

RustとWebAssemblyで物理計算を行い、ブラウザのCanvasへ描画する二重振り子シミュレーターです。摩擦と空気抵抗のない理想モデルを、固定刻みの4次Runge–Kutta法で計算します。

## 機能

- 質量 `m1`・`m2`、腕の長さ `l1`・`l2`、初期角度 `θ1`・`θ2` の設定
- 二重振り子のリアルタイムアニメーション
- 新しい部分ほど明るくなる第2質点 `m2` の軌跡
- `m1`、`m2`、系全体のエネルギーを示す時系列グラフ
- スタート、一時停止・再開、リセット
- 複数の独立した二重振り子を同時に扱える物理エンジン

## 物理モデル

2本の腕は質量のない剛体とし、各腕の先端に質点を置きます。固定支点を原点として、角度は下向き鉛直から測る絶対角です。

- 重力加速度: `9.80665 m/s²`
- 初期角速度: `ω1 = ω2 = 0`
- 数値積分: 4次Runge–Kutta法（RK4）
- 時間刻み: `1/240 s`
- 位置エネルギーの基準: 両方の腕が真下にある状態

## 構成

- `src/`: Rust製の物理エンジンとWasm公開インターフェース
- `docs/`: GitHub Pagesで公開するHTML、CSS、JavaScript、Wasm生成物

物理エンジンは複数の振り子を安定したIDで管理します。現在の画面は1台を操作しますが、描画データと履歴はIDごとに管理され、将来の複数台表示へ拡張できます。

## ビルド

[Rust](https://www.rust-lang.org/tools/install) と [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) が必要です。

```sh
cargo test
wasm-pack build --target web --release --out-dir docs/pkg
```

`docs/pkg/` はGitHub Pagesが直接読み込むため、生成されたJavaScriptとWasmもGitへ追加してください。`docs/pkg/.gitignore` には生成物を除外するパターンを設定しないでください。

ビルド後、リポジトリのルートで静的HTTPサーバーを起動します。

```sh
python3 -m http.server 8000 --directory docs
```

ブラウザで `http://localhost:8000` を開いてください。Wasmはローカルファイルとして直接開けないため、HTTPサーバー経由で実行します。

## GitHub Pages

リポジトリのPages設定で公開元をデフォルトブランチの `/docs` に指定してください。`docs/pkg/` を含むビルド済みファイルをコミットすれば、そのまま静的サイトとして配信できます。

## テスト

```sh
cargo test
```

真下静止状態、位置とエネルギー、RK4の更新、長時間計算時のエネルギー誤差、複数振り子の独立性とID安定性を検証します。
