# Double Pendulum Lab 設計ドキュメント

この文書は、プロジェクトのディレクトリ構成、各モジュールの責務、Rust/Wasmとブラウザ間のデータフローを説明します。利用方法は [`README.md`](./README.md) を参照してください。

## ディレクトリ構成

```text
DoublePendulum/
├── Cargo.toml                 Rustパッケージとリリースビルドの設定
├── Cargo.lock                 Rust依存関係の固定
├── build-pages.sh             GitHub Pages用Wasmビルドスクリプト
├── README.md                  利用方法とプロジェクト概要
├── ARCHITECTURE.md            本設計ドキュメント
├── src/                       Rust物理エンジン
│   ├── lib.rs
│   ├── model.rs
│   ├── dynamics.rs
│   ├── integrator.rs
│   ├── pendulum.rs
│   └── world.rs
├── docs/                      GitHub Pagesで直接公開するWebアプリ
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── pendulum.js
│   ├── energy-chart.js
│   ├── favicon.svg
│   └── pkg/                   wasm-packの生成物
└── target/                    Cargoのローカル生成物（Git管理対象外）
```

### ルート

- `Cargo.toml`: `cdylib` と `rlib` を生成し、`wasm-bindgen` を利用する設定です。リリース時はサイズを抑えるためLTOと単一codegen unitを使用します。
- `Cargo.lock`: 使用するRustクレートのバージョンを固定します。
- `build-pages.sh`: `wasm-pack build --target web --release --out-dir docs/pkg` を実行します。続いて、生成物をGitへ含めるため、wasm-packが作る `docs/pkg/.gitignore` を削除します。
- `.gitignore`: ローカルビルド用の `target/` をGit管理から除外します。

### `src/`: Rust物理エンジン

ブラウザやCanvasへ依存しない物理計算と、JavaScriptへ公開するWasm APIを格納します。3台の二重振り子は互いに独立し、同じ固定時間刻みと共有時刻で更新されます。

### `docs/`: 公開Webアプリ

GitHub Pagesの公開ルートです。HTML、CSS、JavaScriptはビルドツールを介さずES Modulesとして読み込まれます。CSSとJavaScriptのURLにある `?v=N` は、GitHub Pagesやブラウザに残った旧ファイルを更新するためのキャッシュバスターです。

### `docs/pkg/`: Wasm生成物

`build-pages.sh` が生成する領域です。

- `double_pendulum_bg.wasm`: コンパイル済み物理エンジン
- `double_pendulum.js`: Wasmのロードと型変換を行うJavaScriptグルーコード
- `double_pendulum.d.ts`、`double_pendulum_bg.wasm.d.ts`: TypeScript型定義
- `package.json`、`README.md`: wasm-packが生成するパッケージ情報

このディレクトリは手動編集せず、Rust側を変更した場合に再生成します。GitHub Pagesはビルド処理を行わないため、生成物もGitへコミットします。

## Rustモジュール設計

### `src/model.rs`

物理計算で共有する値オブジェクトを定義します。

- `Parameters`: `m1`、`m2`、`l1`、`l2`。質量と長さが正の有限値であることを生成時に検証します。
- `State`: `theta1`、`omega1`、`theta2`、`omega2`。角度は下向き鉛直から測る絶対角で、単位はラジアンです。
- `Derivative`: 状態ベクトルの時間微分です。
- `Positions`: 固定支点を原点とする2質点の座標です。Canvasに合わせ、下向きを正のY軸とします。
- `Energy`: `m1` と `m2` が持つ運動エネルギーと位置エネルギーの和です。`total()` で系全体の値を返します。

### `src/dynamics.rs`

二重振り子の力学式を実装します。

- `GRAVITY`: 標準重力加速度 `9.80665 m/s²`
- `derivative()`: 現在のパラメータと状態から、2つの角速度と角加速度を返します。
- `positions()`: `x1 = l1 sin(theta1)` などの式から2質点の座標を求めます。
- `energy()`: 両腕が真下の状態を位置エネルギーゼロとして、各質点と系全体のエネルギーを求めます。

このモジュールは状態を保持せず、入力から結果を返す純粋な計算層です。

### `src/integrator.rs`

運動方程式を数値積分します。

- `STEP_SECONDS`: 固定時間刻み `1/240秒`
- `rk4_step()`: 状態を1ステップ進める4次Runge–Kutta法

描画フレームの長さを積分へ直接渡さず、常に同じ刻みを使用することでブラウザのフレーム変動から物理計算を分離します。

### `src/pendulum.rs`

1台の二重振り子を表現します。

- `Pendulum`: 変更しない `Parameters` と現在の `State` を所有します。
- `advance()`: RK4で1固定ステップ進めます。
- `state()`、`positions()`、`energy()`: 外部へ現在値を読み出します。

履歴、描画色、UI状態は保持しません。

### `src/world.rs`

複数の独立した振り子を同時管理します。

- `World`: `Pendulum` の一覧、次に割り当てるID、共有経過ステップ数を所有します。
- `add()`、`remove()`、`clear()`: 振り子のライフサイクルを管理します。
- `advance(step_count)`: 各固定ステップで全振り子を1回ずつ更新し、その後に共有時刻を進めます。
- `ids()`、`pendulum()`: 安定したIDで振り子を参照します。削除によって他のIDは変化しません。

3台は同じ `World` に登録されますが、力、衝突、状態を相互に共有しません。

### `src/lib.rs`

内部のRust型をJavaScriptから扱えるWasm APIへ変換します。

`SimulationWorld` の公開インターフェース:

| API | 役割 |
|---|---|
| `new()` | 空のWorldを生成 |
| `add_pendulum(...)` | 1台を追加し、安定IDを返す |
| `remove_pendulum(id)` | 指定IDを削除 |
| `clear()` | 全台と共有時刻を初期化 |
| `advance(step_count)` | 全台を指定ステップ数だけ更新 |
| `pendulum_ids()` | 登録中のID一覧を返す |
| `snapshot(id)` | 描画とグラフに必要な現在値を返す |
| `time` | 共有シミュレーション時刻 |
| `step_seconds` | 固定時間刻み |

`PendulumSnapshot` はID、時刻、角度、角速度、座標、`E1`、`E2`、合計エネルギーを読み取り専用getterとして公開します。JavaScript側は値を通常のオブジェクトへコピーした後、Wasmオブジェクトの `free()` を呼びます。

## ブラウザモジュール設計

### `docs/index.html`

画面の意味構造を定義します。

- 6項目 × 3台の初期条件入力表
- スタート、一時停止・再開、リセットボタン
- 二重振り子用Canvas
- エネルギーグラフ用Canvasと表示対象切替ボタン

各数値欄は任意の小数を直接入力できます。JavaScriptが追加する上下スピナーと上下矢印キーでは、現在値から `0.01` ずつ変更します。

### `docs/styles.css`

ダークテーマ、入力表、操作ボタン、Canvas領域、レスポンシブ表示を定義します。狭い画面でも、各項目に対する振り子1〜3の入力欄は横3列を維持します。Canvasの実ピクセル密度調整はCSSではなく各描画モジュールが担当します。

### `docs/app.js`

アプリ全体のコントローラーです。

- Wasmの動的ロードと失敗表示
- 18個の入力値と3台分の設定オブジェクトの同期
- 任意小数対応の `0.01` スピナー生成
- `idle`、`running`、`paused` の状態管理
- `requestAnimationFrame` と時間アキュムレータによる固定ステップ数の決定
- 3台分のスナップショット取得と描画モジュールへの配布
- 選択中の振り子に対応するエネルギーグラフの切り替え

1フレームで取り込む経過時間は最大0.1秒、計算ステップ数は最大24回に制限します。タブがバックグラウンドから復帰した際に、大量の追従計算を行わないためです。

### `docs/pendulum.js`

二重振り子と軌跡のCanvas描画を担当します。

- `PendulumRenderer`: IDごとの軌跡を保持し、3台のスナップショットを描画します。
- 軌跡は1台につき最大2,400点です。
- 古い線分は暗く透明に、新しい線分は明るく不透明に描画します。
- 3台をシアン、オレンジ、紫の系列で区別します。
- 最も長い `l1 + l2` を基準に自動スケーリングし、全方向の運動がCanvas内へ収まるよう支点を中央に配置します。
- 端末のdevice pixel ratioに合わせてCanvasの内部解像度を調整します。

### `docs/energy-chart.js`

エネルギー履歴とグラフ描画を担当します。

- `EnergyChart`: IDごとに直近20秒の履歴を保持します。
- UIで選択された1台の `E1`、`E2`、合計エネルギーを描画します。
- 横軸は秒、縦軸はジュールで、表示履歴に合わせて縦軸上限を自動調整します。
- Canvasの内部解像度をdevice pixel ratioに合わせます。

## 実行時データフロー

```text
18個の入力欄
    │  数値検証、度→ラジアン変換
    ▼
SimulationWorld.add_pendulum() × 3
    │
    ▼
requestAnimationFrame
    │  実時間をアキュムレータへ加算
    ▼
SimulationWorld.advance(step_count)
    │  Rust側で全3台をRK4更新
    ▼
PendulumSnapshot × 3
    ├── PendulumRenderer ── 振り子とm2軌跡
    └── EnergyChart ─────── 選択中1台のエネルギー
```

- スタート時: 入力値を再読込・検証し、Worldへ3台を登録します。軌跡とグラフ履歴を空にします。
- 一時停止時: 描画状態と履歴を保持したまま、物理更新を停止します。
- 再開時: 前回フレーム時刻を破棄し、停止中の実時間を物理時間へ加えず再開します。
- リセット時: World、共有時刻、軌跡、エネルギー履歴を初期化し、入力値に基づく静止プレビューへ戻ります。

## テスト方針

Rustの単体テストは各モジュール内に配置しています。

- 真下静止状態が動かないこと
- 座標と位置エネルギーの基準が正しいこと
- 同一条件の複数台が同じ状態を維持すること
- 1台の削除が他のIDへ影響しないこと
- 60秒計算後の合計エネルギー相対誤差が許容範囲内であること

ブラウザ側は、Wasmロード、18入力の取得、3台同時開始、入力ロック、任意小数とスピナー、エネルギー表示対象の切り替えを統合確認します。

