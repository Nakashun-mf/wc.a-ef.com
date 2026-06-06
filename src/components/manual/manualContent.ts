export interface ContentBlock {
  type: 'p' | 'steps' | 'tip' | 'warn'
  text?: string
  items?: string[]
}

export interface ManualEntry {
  id: string
  category: string
  titleJa: string
  titleEn: string
  bodyJa: ContentBlock[]
  bodyEn: ContentBlock[]
}

export interface ManualCategory {
  id: string
  labelJa: string
  labelEn: string
}

export const CATEGORIES: ManualCategory[] = [
  { id: 'basics',       labelJa: '基本',             labelEn: 'Basics' },
  { id: 'add-points',   labelJa: '点を追加する',      labelEn: 'Adding Points' },
  { id: 'ortho',        labelJa: '直交モード',         labelEn: 'Ortho Mode' },
  { id: 'point-ops',    labelJa: '点の操作',           labelEn: 'Point Operations' },
  { id: 'segment-ops',  labelJa: '線の操作',           labelEn: 'Segment Operations' },
  { id: 'pan-zoom',     labelJa: 'パン・ズーム',       labelEn: 'Pan & Zoom' },
  { id: 'coord-list',   labelJa: '座標リスト',         labelEn: 'Coordinate List' },
  { id: 'undo-redo',    labelJa: '元に戻す・やり直す', labelEn: 'Undo & Redo' },
  { id: 'simulation',   labelJa: 'シミュレーション',   labelEn: 'Simulation' },
  { id: 'route-mgmt',   labelJa: '経路の保存・管理',   labelEn: 'Route Management' },
  { id: 'settings',     labelJa: '設定',               labelEn: 'Settings' },
]

export const ENTRIES: ManualEntry[] = [
  // ── 基本 ─────────────────────────────────────────────────────────────
  {
    id: 'about',
    category: 'basics',
    titleJa: 'このアプリについて',
    titleEn: 'About this app',
    bodyJa: [
      { type: 'p', text: 'ワイヤ放電加工（ワイヤEDM）の加工経路を計画・確認するためのプログラミング支援アプリです。点を順番に置いていくだけで加工経路が完成し、直交モードを使えば縦・横に整列した精密な経路を自動生成できます。' },
      { type: 'p', text: 'シミュレーション機能でワイヤーの動きをリアルタイムに確認でき、経路はブラウザ内に自動保存されます。スマートフォン・タブレット・PCすべてに対応しています。' },
      { type: 'tip', text: '経路はブラウザのローカルデータベースに保存されるため、インターネット接続がなくても使えます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'A programming support app for planning and verifying Wire EDM machining paths. Simply tap to place points in sequence; Ortho mode automatically generates precise horizontal/vertical routes.' },
      { type: 'p', text: 'The simulation feature previews wire movement in real time, and paths are auto-saved in the browser. Works on smartphones, tablets, and PCs.' },
      { type: 'tip', text: 'Paths are stored in a local browser database, so no internet connection is required.' },
    ],
  },
  {
    id: 'screen-layout',
    category: 'basics',
    titleJa: '画面の構成',
    titleEn: 'Interface overview',
    bodyJa: [
      { type: 'p', text: 'アプリは大きく3つのエリアに分かれています。' },
      { type: 'steps', items: [
        'ツールバー（上部）：新規作成・Undo/Redo・直交モード・スナップ・グリッド・シミュレーション・設定などのボタンが並びます',
        'キャンバス（中央）：点を置いたり経路を操作したりするメインエリアです。左下に座標軸マーク（X→ Y↑）が常に表示されます',
        'サイドパネル（右側）：座標リストと保存済み経路の履歴が表示されます。スマートフォンでは右上のメニューボタンから引き出せます',
      ]},
      { type: 'tip', text: 'スマートフォンでは画面右上の「≡」ボタンをタップするとサイドパネル（ドロワー）が開きます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'The app is divided into three main areas.' },
      { type: 'steps', items: [
        'Toolbar (top): Contains buttons for New, Undo/Redo, Ortho, Snap, Grid, Simulation, and Settings',
        'Canvas (center): The main work area for placing and editing points. A coordinate axis marker (X→ Y↑) is always shown in the bottom-left corner',
        'Side panel (right): Shows the coordinate list and saved route history. On smartphones, open it by tapping the ≡ menu button in the top-right corner',
      ]},
      { type: 'tip', text: 'On smartphones, tap the ≡ button in the top-right to open the side panel drawer.' },
    ],
  },
  {
    id: 'coordinate-system',
    category: 'basics',
    titleJa: '座標系（X・Y軸）について',
    titleEn: 'Coordinate system (X / Y axes)',
    bodyJa: [
      { type: 'p', text: '一般的な数学・機械加工の標準座標系を使用しています。X軸は右がプラス（＋）・左がマイナス（−）、Y軸は上がプラス（＋）・下がマイナス（−）です。単位はすべてミリメートル（mm）です。' },
      { type: 'p', text: '画面左下の軸マーク（X→ Y↑）で向きをいつでも確認できます。キャンバスをパンしても原点位置は変わりますが、軸の向きは変わりません。' },
      { type: 'warn', text: '一部のCADソフトやスクリーン座標では「Y軸は下がプラス」として扱うことがあります。このアプリは「Y軸は上がプラス」なので注意してください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'This app uses the standard mathematical/machining coordinate system. X increases to the right, decreases to the left. Y increases upward, decreases downward. All values are in millimeters (mm).' },
      { type: 'p', text: 'The axis marker (X→ Y↑) in the bottom-left corner always shows the current orientation. Panning the canvas moves the origin but never changes axis directions.' },
      { type: 'warn', text: 'Some CAD tools and screen coordinate systems treat downward as positive Y. This app uses upward as positive Y — be aware of the difference.' },
    ],
  },

  // ── 点を追加 ───────────────────────────────────────────────────────────
  {
    id: 'add-mode',
    category: 'add-points',
    titleJa: '追加モードに切り替える（スマホ）',
    titleEn: 'Switch to Add mode (mobile)',
    bodyJa: [
      { type: 'p', text: 'スマホ・タブレットには「追加モード」と「編集モード」の2つがあり、モードによってタッチ操作の意味が変わります。アプリ起動時のデフォルトは追加モードです。' },
      { type: 'p', text: '追加モード中の操作：タップ → 点を追加　／　2本指ピンチ → ズーム　／　2本指ドラッグ → パン（画面移動）' },
      { type: 'p', text: '編集モード中の操作：タップ → 点・線を選択（点は追加されない）　／　1本指ドラッグ → パン（画面移動）　／　点をドラッグ → 点を移動' },
      { type: 'steps', items: [
        'ツールバー左の「追加」アイコン（ペンマーク）をタップ',
        'ボタンが青くハイライトされれば追加モードです',
      ]},
      { type: 'tip', text: 'PCでは追加モード固定で、ドラッグは常にパンとして動作するため、モード切り替えは不要です。' },
    ],
    bodyEn: [
      { type: 'p', text: 'On smartphones and tablets there are two modes — Add and Edit — and the meaning of touch gestures changes depending on which is active. The app starts in Add mode.' },
      { type: 'p', text: 'Add mode gestures: Tap → place a new point  /  Two-finger pinch → zoom  /  Two-finger drag → pan the canvas' },
      { type: 'p', text: 'Edit mode gestures: Tap → select a point or segment (no new point placed)  /  One-finger drag → pan the canvas  /  Drag a point → move the point' },
      { type: 'steps', items: [
        'Tap the Add icon (pen mark) on the left side of the toolbar',
        'The button turns blue when Add mode is active',
      ]},
      { type: 'tip', text: 'On PC, the app is always in Add mode and one-finger drag always pans — no mode switch is needed.' },
    ],
  },
  {
    id: 'add-point',
    category: 'add-points',
    titleJa: 'タップして点を追加する',
    titleEn: 'Tap to add a point',
    bodyJa: [
      { type: 'p', text: '追加モード中にキャンバスの空いた場所をタップすると、その位置に点が追加されます。最初の点はP1、次の点はP2と順番に番号が付きます。点が2つ以上になると、直前の点との間に自動的に線が引かれて経路が形成されます。' },
      { type: 'steps', items: [
        '追加モードになっていることを確認する（ツールバーのペンアイコンが青い）',
        'キャンバスの追加したい位置をタップする',
        '点（Pn のラベル付き）が追加される。2点目からは前の点と線で結ばれる',
      ]},
      { type: 'tip', text: 'スナップがオンの場合、点はグリッドに自動で吸着します。グリッドに吸着させたくない場合はスナップをオフにしてください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'While in Add mode, tap any empty spot on the canvas to place a point. The first point is labeled P1, the next P2, and so on. Once two or more points exist, a line is automatically drawn between consecutive points to form the route.' },
      { type: 'steps', items: [
        'Confirm you are in Add mode (pen icon in the toolbar is highlighted blue)',
        'Tap the desired location on the canvas',
        'A point with a Pn label appears; from the second point onward, a line connects it to the previous point',
      ]},
      { type: 'tip', text: 'When Snap is on, points automatically snap to the nearest grid intersection. Turn Snap off for free placement.' },
    ],
  },
  {
    id: 'point-label',
    category: 'add-points',
    titleJa: '点の番号（P1, P2…）',
    titleEn: 'Point labels (P1, P2…)',
    bodyJa: [
      { type: 'p', text: '各点にはP1、P2、P3…と追加された順番に番号ラベルが表示されます。この番号は経路の方向（始点→終点）を示しています。' },
      { type: 'p', text: 'ラベルの位置は、接続されている線と重ならないよう自動で調整されます。設定で「点の座標を表示」をオンにすると、番号の下にXY座標も表示されます。' },
      { type: 'tip', text: '点が直交モードで拘束されている場合、ラベルの横に鎖のアイコンが表示されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Each point is labeled P1, P2, P3… in the order it was placed. These numbers indicate the route sequence and direction (start → end).' },
      { type: 'p', text: "Label positions are automatically adjusted to avoid overlapping connected segments. Enable 'Show point coordinates' in Settings to also display XY values under each label." },
      { type: 'tip', text: 'When a point is constrained by Ortho mode, a chain icon appears next to its label.' },
    ],
  },
  {
    id: 'snap-to-grid',
    category: 'add-points',
    titleJa: 'グリッドスナップ',
    titleEn: 'Snap to grid',
    bodyJa: [
      { type: 'p', text: 'スナップ機能がオンの場合、点を追加したりドラッグしたりすると、最も近いグリッドの交点に自動で吸着します。整数座標や規則的な間隔で点を配置しやすくなります。' },
      { type: 'p', text: 'グリッドの間隔は1mmです。スナップとグリッド表示は独立して切り替えられます（スナップオンのままグリッドを非表示にすることも可能）。' },
      { type: 'steps', items: [
        'ツールバーの「スナップ」ボタン（磁石アイコン）をタップしてオン/オフを切り替える',
        'ボタンが青くハイライトされているときがオン',
      ]},
      { type: 'tip', text: '直交モードをオンにすると、スナップも自動でオンになります。' },
    ],
    bodyEn: [
      { type: 'p', text: 'When Snap is on, points snap to the nearest grid intersection when placed or dragged. This makes it easy to position points at integer coordinates or regular intervals.' },
      { type: 'p', text: 'Grid spacing is 1 mm. Snap and grid visibility are independent — you can have snap on without showing the grid.' },
      { type: 'steps', items: [
        'Tap the Snap button (magnet icon) in the toolbar to toggle it on or off',
        'The button is highlighted blue when Snap is on',
      ]},
      { type: 'tip', text: 'Enabling Ortho mode also enables Snap automatically.' },
    ],
  },

  // ── 直交モード ──────────────────────────────────────────────────────────
  {
    id: 'ortho-on',
    category: 'ortho',
    titleJa: '直交モードをオンにする',
    titleEn: 'Enable Ortho mode',
    bodyJa: [
      { type: 'p', text: '直交モードをオンにすると、新しく追加する点と前の点の間の線が自動的に水平または垂直に固定されます。縦・横だけで構成された精密な加工経路を簡単に作成できます。' },
      { type: 'steps', items: [
        'ツールバーの「直交モード」ボタンをタップしてオンにする（青くハイライトされる）',
        '直交モードがオンの状態で点を追加すると、前の点からの線が自動で縦・横に整列する',
        '水平な線は青、垂直な線は緑で表示される',
      ]},
      { type: 'tip', text: '直交モードをオンにすると同時にスナップも自動でオンになります。再度ボタンをタップするとオフになります。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Enabling Ortho mode constrains each new segment to be either horizontal or vertical automatically. This makes it easy to build precise machining paths with right-angle turns only.' },
      { type: 'steps', items: [
        'Tap the Ortho mode button in the toolbar to turn it on (it turns blue)',
        'With Ortho on, each new point connects to the previous one with a horizontal or vertical segment',
        'Horizontal segments appear blue; vertical segments appear green',
      ]},
      { type: 'tip', text: 'Turning on Ortho mode also enables Snap automatically. Tap the button again to turn Ortho off.' },
    ],
  },
  {
    id: 'horizontal-line',
    category: 'ortho',
    titleJa: '水平線（青）',
    titleEn: 'Horizontal constraint (blue)',
    bodyJa: [
      { type: 'p', text: '直交モードがオンのとき、水平方向に固定された線は青色で表示されます。水平拘束が設定されており、片方の端点を上下にドラッグしても両端が同じY座標を保つように自動調整されます。' },
      { type: 'p', text: '線の中央には鎖アイコンが表示され、拘束が設定されていることを示します。' },
      { type: 'tip', text: '水平拘束を解除したい場合は、線を右クリック（PCのみ）またはモバイルで長押しするとコンテキストメニューが表示されます。座標リストからも解除できます。' },
    ],
    bodyEn: [
      { type: 'p', text: "In Ortho mode, horizontally constrained segments appear blue. The constraint keeps both endpoints at the same Y coordinate — dragging one endpoint up or down repositions it to maintain the horizontal alignment." },
      { type: 'p', text: 'A chain icon at the midpoint of the segment confirms the active constraint.' },
      { type: 'tip', text: 'To release a horizontal constraint, right-click the segment (PC) or long-press (mobile) to open the context menu. You can also release it from the coordinate list.' },
    ],
  },
  {
    id: 'vertical-line',
    category: 'ortho',
    titleJa: '垂直線（緑）',
    titleEn: 'Vertical constraint (green)',
    bodyJa: [
      { type: 'p', text: '直交モードがオンのとき、垂直方向に固定された線は緑色で表示されます。垂直拘束が設定されており、端点を左右にドラッグしても両端が同じX座標を保つように自動調整されます。' },
      { type: 'p', text: '線の中央の鎖アイコンで垂直拘束を確認できます。' },
      { type: 'tip', text: '青＝水平、緑＝垂直と覚えておくと便利です。この色分けはテーマに関わらず固定です。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Vertically constrained segments appear green in Ortho mode. The constraint keeps both endpoints at the same X coordinate — dragging one endpoint left or right repositions it to maintain vertical alignment.' },
      { type: 'p', text: 'A chain icon at the midpoint confirms the vertical constraint is active.' },
      { type: 'tip', text: 'Blue always means horizontal; green always means vertical. These colors are fixed regardless of theme.' },
    ],
  },
  {
    id: 'constraint-mark',
    category: 'ortho',
    titleJa: '拘束マーク（鎖アイコン）',
    titleEn: 'Constraint mark (chain icon)',
    bodyJa: [
      { type: 'p', text: '直交モードで追加された点や線には鎖のアイコンが表示されます。これは「拘束あり」を意味し、縦・横の位置関係が制約されていることを示します。' },
      { type: 'p', text: '鎖アイコンは2か所に表示されます。①線の中央（その線自体が拘束されている）、②点のラベル（Pn）の横（その点に接続されている線に拘束があることを示す）。' },
      { type: 'tip', text: '拘束マークが表示されていても、点のドラッグや座標入力で位置を変更できます。ただし接続されている拘束線の方向（縦・横）は維持されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Points and segments added in Ortho mode display a chain icon indicating they are constrained — their relative positions (horizontal or vertical alignment) are enforced.' },
      { type: 'p', text: 'The chain icon appears in two places: at the midpoint of a constrained segment, and next to the Pn label of any point connected to at least one constrained segment.' },
      { type: 'tip', text: "A constraint mark doesn't prevent you from moving a point. It means connected constrained segments will auto-adjust to stay horizontal or vertical after each move." },
    ],
  },
  {
    id: 'free-segment',
    category: 'ortho',
    titleJa: '拘束なしの線（Unlinkアイコン）',
    titleEn: 'Unconstrained segment (Unlink icon)',
    bodyJa: [
      { type: 'p', text: '直交モードがオンでも、線の拘束を解除すると「拘束なし」の状態になります。拘束なしの線は灰色で表示され、線の中央にはUnlinkアイコンが表示されます。' },
      { type: 'p', text: '拘束なしの線は任意の角度になることができ、両端の点は縦・横の自動整列なしに自由に移動できます。' },
      { type: 'tip', text: '直交モードをオフにして追加した線も拘束なしになります。一度解除した線に再度拘束をかけることはできません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'A segment becomes unconstrained (free) when its constraint is released. Free segments appear gray with an Unlink icon at the midpoint.' },
      { type: 'p', text: 'Free segments can be at any angle, and their endpoints can move freely without any automatic horizontal or vertical alignment.' },
      { type: 'tip', text: 'Segments added while Ortho mode is off are always free. Once a constraint is released, it cannot be re-applied to that segment.' },
    ],
  },

  // ── 点の操作 ──────────────────────────────────────────────────────────
  {
    id: 'select-point',
    category: 'point-ops',
    titleJa: '点を選択する',
    titleEn: 'Select a point',
    bodyJa: [
      { type: 'p', text: '点をタップすると選択状態になり、青くハイライト表示されます。座標リストでも同じ点の行がハイライトされ、インライン編集パネルが展開します。' },
      { type: 'steps', items: [
        'キャンバス上の任意の点をタップする',
        '点が青くなり選択状態になる',
        '右側の座標リストでも対応する行がハイライトされて編集パネルが開く',
      ]},
      { type: 'tip', text: '選択済みの点をもう一度タップすると選択解除されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tap a point to select it. The selected point turns blue and the corresponding row in the coordinate list is highlighted, revealing the inline edit panel.' },
      { type: 'steps', items: [
        'Tap any point on the canvas',
        'The point turns blue to indicate selection',
        'The matching row in the coordinate list also highlights and expands the edit panel',
      ]},
      { type: 'tip', text: 'Tap the selected point again to deselect it.' },
    ],
  },
  {
    id: 'drag-point',
    category: 'point-ops',
    titleJa: '点をドラッグして移動する',
    titleEn: 'Drag to move a point',
    bodyJa: [
      { type: 'p', text: '点の上で指（またはマウスカーソル）を置いてそのままドラッグすると、点を新しい位置に移動できます。直交モードがオンの場合、接続されている拘束線は移動後も縦・横を維持します。' },
      { type: 'steps', items: [
        '移動したい点の上で指（またはマウスカーソル）を置く',
        'そのまま目的の位置まで指を滑らせる（ドラッグ）',
        '指を離すと点が新しい位置に確定する',
      ]},
      { type: 'tip', text: 'スナップがオンの場合、グリッドに吸着しながら移動します。正確な座標は座標リストのインライン入力か、長押しで開く座標入力ダイアログを使うのが確実です。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Press and drag a point to move it to a new position. In Ortho mode, connected constrained segments automatically adjust to maintain their horizontal or vertical alignment.' },
      { type: 'steps', items: [
        'Place your finger (or mouse cursor) on the point you want to move',
        'Drag to the desired position',
        'Release to confirm the new position',
      ]},
      { type: 'tip', text: 'With Snap on, the point snaps to grid intersections as you drag. For precise positioning, use the inline coordinate input in the list panel or long-press to open the coordinate editor.' },
    ],
  },
  {
    id: 'deselect-point',
    category: 'point-ops',
    titleJa: '選択を解除する',
    titleEn: 'Deselect a point',
    bodyJa: [
      { type: 'p', text: '選択状態の点を再度タップすることで選択を解除できます。キャンバスの空いた場所をタップして解除することもできますが、追加モード中は新しい点が追加されてしまうので注意が必要です。' },
      { type: 'steps', items: [
        '選択済みの点をもう一度タップする',
        '点の青いハイライトが消え、選択解除される',
      ]},
      { type: 'tip', text: '座標リストで選択中の行をもう一度タップしても選択解除できます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tap the selected point again to deselect it. Tapping an empty canvas area also deselects, but in Add mode this will also place a new point — tap the selected point itself to deselect safely.' },
      { type: 'steps', items: [
        'Tap the already-selected point once more',
        'The blue highlight disappears and the point is deselected',
      ]},
      { type: 'tip', text: 'Tapping the highlighted row in the coordinate list again also deselects the point.' },
    ],
  },
  {
    id: 'longpress-point',
    category: 'point-ops',
    titleJa: '長押しで座標入力ダイアログを開く',
    titleEn: 'Long-press to open coordinate editor',
    bodyJa: [
      { type: 'p', text: '点を長押し（約500ms以上押し続ける）すると、座標入力ダイアログが開きます。XとYの座標を数値で直接入力して、点の正確な位置を指定できます。' },
      { type: 'steps', items: [
        '座標を編集したい点の上で指（またはマウスボタン）を押し続ける',
        '約0.5秒後に座標入力ダイアログが開く',
        'XとY座標を入力して「確定」ボタンを押す',
      ]},
      { type: 'tip', text: 'ドラッグ操作と区別するため、長押し中は指を動かさないようにしてください。指がずれるとドラッグ移動と判定されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Long-pressing a point (holding for about 500 ms) opens the coordinate editor dialog, where you can type exact X and Y coordinates in millimeters.' },
      { type: 'steps', items: [
        'Press and hold your finger (or mouse button) on the point you want to edit',
        'After about 0.5 seconds, the coordinate editor dialog opens',
        'Enter the X and Y coordinates and tap Confirm',
      ]},
      { type: 'tip', text: 'Keep your finger still while long-pressing — any movement is interpreted as a drag.' },
    ],
  },
  {
    id: 'coord-dialog',
    category: 'point-ops',
    titleJa: '座標入力ダイアログ',
    titleEn: 'Coordinate editor dialog',
    bodyJa: [
      { type: 'p', text: '座標入力ダイアログでは点のXY座標をmm単位で数値入力できます。ダイアログには「確定」「キャンセル」ボタンのほか、「この点を削除」ボタンも含まれます。' },
      { type: 'p', text: '「確定」ボタンを押すと座標が更新されてダイアログが閉じます。この操作はUndoで元に戻せます。「キャンセル」を押すと変更は破棄されます。' },
      { type: 'tip', text: '小数点以下2桁まで入力できます（例：12.50）。整数で入力しても小数点以下2桁で管理されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'The coordinate editor dialog lets you type exact X and Y values in mm. It also includes a Delete Point button alongside Confirm and Cancel.' },
      { type: 'p', text: 'Pressing Confirm updates the position and closes the dialog. This action can be undone. Cancel discards any changes.' },
      { type: 'tip', text: 'Values are stored to 2 decimal places (e.g., 12.50). Entering an integer is fine — it will be displayed with .00.' },
    ],
  },
  {
    id: 'delete-point',
    category: 'point-ops',
    titleJa: '点を削除する',
    titleEn: 'Delete a point',
    bodyJa: [
      { type: 'p', text: '点を削除すると、その点とその点に接続されているすべての線が削除されます。前後に点が残っている場合、削除された点をスキップして経路が再構成されます。' },
      { type: 'steps', items: [
        '方法①：点を長押しして座標入力ダイアログを開き、「この点を削除」ボタンをタップする',
        '方法②：点を選択（タップ）し、座標リストの編集パネルにあるゴミ箱アイコンをタップする',
        '確認ダイアログで「はい」を選ぶ',
      ]},
      { type: 'tip', text: '削除はUndoで元に戻せます。誤って削除した場合はすぐにツールバーの「元に戻す」をタップしてください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Deleting a point removes that point and all segments connected to it. If points remain on both sides, the route is re-linked around the deleted point.' },
      { type: 'steps', items: [
        'Method 1: Long-press the point to open the coordinate editor, then tap Delete Point',
        'Method 2: Select the point (tap it), then tap the trash icon in the edit panel in the coordinate list',
        'Tap Yes in the confirmation dialog',
      ]},
      { type: 'tip', text: 'Deletion can be undone. If you accidentally delete a point, tap Undo in the toolbar right away.' },
    ],
  },

  // ── 線の操作 ──────────────────────────────────────────────────────────
  {
    id: 'select-segment',
    category: 'segment-ops',
    titleJa: '線を選択する',
    titleEn: 'Select a segment',
    bodyJa: [
      { type: 'p', text: '線をタップすると選択状態になり、琥珀色（黄みがかったオレンジ）でハイライト表示されます。線は細いですが、タップできる判定エリアは広めに設定されているので、少し外れてもタップできます。' },
      { type: 'steps', items: [
        'キャンバス上の線をタップする',
        '線が琥珀色にハイライトされて選択状態になる',
      ]},
      { type: 'tip', text: '線を選択した状態でPC上で右クリックするか、モバイルで長押しするとコンテキストメニューが表示されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tap a segment to select it. The selected segment is highlighted in amber (warm orange-yellow). The tap hit area is generous, so you do not need to tap exactly on the line.' },
      { type: 'steps', items: [
        'Tap a segment on the canvas',
        'The segment turns amber to indicate selection',
      ]},
      { type: 'tip', text: 'After selecting a segment, right-click (PC) or long-press (mobile) to open a context menu with options like Release Constraint.' },
    ],
  },
  {
    id: 'release-constraint-canvas',
    category: 'segment-ops',
    titleJa: 'キャンバスから拘束を解除する',
    titleEn: 'Release constraint from canvas',
    bodyJa: [
      { type: 'p', text: '拘束されている線（青または緑）の拘束を解除すると、縦・横の整列制約が外れ、灰色のUnlinkアイコン付きの自由な線になります。' },
      { type: 'steps', items: [
        '方法①（PC）：拘束された線を右クリックしてコンテキストメニューを開き、「拘束を解除」を選ぶ',
        '方法②（スマホ）：拘束された線を長押しするとコンテキストメニューが表示される',
        '方法③：座標リストで点を選択し、編集パネルのUnlinkアイコンをタップする',
      ]},
      { type: 'tip', text: '拘束の解除はUndoで元に戻せます。一度解除した線に再度拘束をかけることはできません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Releasing a constraint on a blue or green segment removes the horizontal/vertical alignment requirement, turning it into a free (gray) segment with an Unlink icon.' },
      { type: 'steps', items: [
        'Method 1 (PC): Right-click the constrained segment and choose Release Constraint',
        'Method 2 (Mobile): Long-press the constrained segment to open the context menu',
        'Method 3: Select the point in the coordinate list and tap the Unlink icon in the edit panel',
      ]},
      { type: 'tip', text: 'Releasing a constraint can be undone. Once released, the constraint cannot be re-applied to that segment.' },
    ],
  },
  {
    id: 'segment-context-menu',
    category: 'segment-ops',
    titleJa: '線のコンテキストメニュー',
    titleEn: 'Segment context menu',
    bodyJa: [
      { type: 'p', text: '拘束された線（青または緑）を右クリック（PC）または長押し（スマホ）すると、コンテキストメニューが表示されます。現在のメニューには「拘束を解除」の項目があります。' },
      { type: 'steps', items: [
        'PC：拘束された線の上でマウスの右ボタンをクリックする',
        'スマホ：拘束された線を長押しする',
        'コンテキストメニューが表示されるので「拘束を解除」を選択する',
      ]},
      { type: 'tip', text: '拘束のない線（灰色）を右クリックしてもコンテキストメニューは表示されません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Right-clicking (PC) or long-pressing (mobile) a constrained segment opens a context menu. Currently the menu contains the Release Constraint option.' },
      { type: 'steps', items: [
        'PC: Right-click a constrained (blue or green) segment',
        'Mobile: Long-press a constrained segment',
        'Select Release Constraint from the context menu',
      ]},
      { type: 'tip', text: 'The context menu only appears on constrained segments. Free (gray) segments do not show a context menu.' },
    ],
  },

  // ── パン・ズーム ──────────────────────────────────────────────────────
  {
    id: 'edit-mode',
    category: 'pan-zoom',
    titleJa: '編集モードに切り替える（スマホ）',
    titleEn: 'Switch to Edit mode (mobile)',
    bodyJa: [
      { type: 'p', text: '編集モードはスマホ・タブレット専用のモードです。追加モードでは1本指タップで点が追加されてしまうため、画面移動や点の選択・移動だけを行いたい場面で切り替えます。' },
      { type: 'p', text: '編集モード中の操作：タップ → 点・線を選択（点は追加されない）　／　1本指ドラッグ → パン（画面移動）　／　点をドラッグ → 点を移動' },
      { type: 'steps', items: [
        'ツールバー左の「編集」アイコン（矢印マーク）をタップ',
        'ボタンが青くハイライトされれば編集モードです',
        '点の追加を再開したいときは「追加」アイコン（ペンマーク）で追加モードに戻す',
      ]},
      { type: 'tip', text: 'PCでは1本指ドラッグが常にパンとして動作するため、このモードは存在しません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Edit mode is exclusive to smartphones and tablets. In Add mode every tap places a new point, so switch to Edit mode when you want to pan, select, or reposition points without accidentally adding new ones.' },
      { type: 'p', text: 'Edit mode gestures: Tap → select a point or segment (no new point placed)  /  One-finger drag → pan the canvas  /  Drag a point → move the point' },
      { type: 'steps', items: [
        'Tap the Edit icon (arrow/cursor mark) on the left side of the toolbar',
        'The button turns blue when Edit mode is active',
        'To start adding points again, tap the Add (pen) icon to return to Add mode',
      ]},
      { type: 'tip', text: 'On PC, one-finger drag always pans, so this mode does not exist.' },
    ],
  },
  {
    id: 'pan-canvas',
    category: 'pan-zoom',
    titleJa: 'ドラッグで画面を移動する',
    titleEn: 'Pan the canvas by dragging',
    bodyJa: [
      { type: 'p', text: 'キャンバスをドラッグすると、表示領域を移動できます（パン）。点が画面外に出たときや、作業エリアを変更したいときに使います。' },
      { type: 'steps', items: [
        'スマートフォン：編集モードに切り替えてからキャンバスをドラッグする',
        'PC：キャンバスの空いた場所をマウスでドラッグする（追加モードでも可）',
      ]},
      { type: 'tip', text: 'パン操作はキャンバス内の座標には影響しません。点の位置（mm）は変わらず、画面上の見え方だけが変わります。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Drag the canvas to pan the view. This is useful when points go off-screen or when you want to shift the working area.' },
      { type: 'steps', items: [
        'Smartphone: Switch to Edit mode first, then drag the canvas',
        'PC: Drag an empty area of the canvas with the mouse (works in Add mode too)',
      ]},
      { type: 'tip', text: 'Panning only changes what is visible — it does not affect the actual coordinates (mm) of any points.' },
    ],
  },
  {
    id: 'pinch-zoom',
    category: 'pan-zoom',
    titleJa: 'ピンチで拡大・縮小する',
    titleEn: 'Pinch to zoom (mobile)',
    bodyJa: [
      { type: 'p', text: 'スマートフォン・タブレットでは2本指でピンチイン・ピンチアウトすることでキャンバスを拡大・縮小できます。精密な操作には拡大、全体を確認したいときは縮小すると便利です。' },
      { type: 'steps', items: [
        '2本の指をキャンバスに置く',
        '広げるように動かすと拡大、狭めるように動かすと縮小する',
      ]},
      { type: 'tip', text: 'PCではマウスホイールを回すことで拡大縮小できます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'On smartphones and tablets, use a two-finger pinch gesture to zoom in or out on the canvas. Zoom in for precision work; zoom out to see the full path.' },
      { type: 'steps', items: [
        'Place two fingers on the canvas',
        'Spread fingers apart to zoom in; pinch together to zoom out',
      ]},
      { type: 'tip', text: 'On PC, use the mouse scroll wheel to zoom in and out.' },
    ],
  },
  {
    id: 'snap-toggle',
    category: 'pan-zoom',
    titleJa: 'スナップのオン/オフ',
    titleEn: 'Toggle snap',
    bodyJa: [
      { type: 'p', text: 'スナップ機能のオン/オフはツールバーの磁石アイコンで切り替えられます。オン時は点がグリッドに吸着し、オフ時は任意の位置に配置できます。' },
      { type: 'steps', items: [
        'ツールバーの「スナップ」ボタン（磁石アイコン）をタップする',
        'ボタンが青くなればオン、通常色に戻ればオフ',
      ]},
      { type: 'tip', text: '直交モードをオンにすると自動でスナップもオンになります。スナップをオフにしても直交モードはオフになりません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Toggle Snap on or off using the magnet icon in the toolbar. When on, points snap to grid intersections; when off, points can be placed anywhere.' },
      { type: 'steps', items: [
        'Tap the Snap button (magnet icon) in the toolbar',
        'Blue = on, normal color = off',
      ]},
      { type: 'tip', text: 'Enabling Ortho mode automatically enables Snap. Disabling Snap does not disable Ortho mode.' },
    ],
  },
  {
    id: 'grid-toggle',
    category: 'pan-zoom',
    titleJa: 'グリッドの表示切り替え',
    titleEn: 'Toggle grid visibility',
    bodyJa: [
      { type: 'p', text: 'グリッドはキャンバス上に表示される方眼線です。点の位置確認や整列の補助として使えます。ツールバーのグリッドアイコンで表示/非表示を切り替えられます。' },
      { type: 'steps', items: [
        'ツールバーの「グリッド」ボタン（格子アイコン）をタップする',
        'ボタンが青くなればグリッド表示オン、通常色に戻ればオフ',
      ]},
      { type: 'tip', text: 'グリッドは表示の補助のためのものです。グリッドを非表示にしてもスナップ機能は引き続き動作します。' },
    ],
    bodyEn: [
      { type: 'p', text: 'The grid displays reference lines on the canvas to help with point placement and alignment. Toggle it with the grid icon in the toolbar.' },
      { type: 'steps', items: [
        'Tap the Grid button (grid icon) in the toolbar',
        'Blue = grid visible, normal color = hidden',
      ]},
      { type: 'tip', text: 'The grid is a visual aid only. Hiding the grid does not affect the Snap function.' },
    ],
  },

  // ── 座標リスト ────────────────────────────────────────────────────────
  {
    id: 'list-overview',
    category: 'coord-list',
    titleJa: '座標リストの見方',
    titleEn: 'Reading the coordinate list',
    bodyJa: [
      { type: 'p', text: '画面右側のサイドパネル上部に座標リストが表示されます。各行に点の番号（P1, P2…）、X座標（mm）、Y座標（mm）が表示されます。' },
      { type: 'p', text: '点に拘束がある場合は番号の横に鎖アイコンが表示されます。行をタップすると点が選択状態になり、キャンバス上の対応する点もハイライトされます。' },
      { type: 'tip', text: 'スマートフォンでは右上の「≡」ボタンをタップしてドロワーを開くと座標リストが表示されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'The coordinate list is shown at the top of the right side panel. Each row shows the point number (P1, P2…), X coordinate (mm), and Y coordinate (mm).' },
      { type: 'p', text: 'A chain icon next to a point number indicates a constrained point. Tapping a row selects the corresponding point and highlights it on the canvas.' },
      { type: 'tip', text: 'On mobile, open the ≡ menu to reveal the side panel with the coordinate list.' },
    ],
  },
  {
    id: 'list-select',
    category: 'coord-list',
    titleJa: 'リストから点を選択する',
    titleEn: 'Select a point from the list',
    bodyJa: [
      { type: 'p', text: '座標リストの行をタップすると、その点が選択状態になります。キャンバス上の対応する点も青くハイライトされ、インライン編集パネルが展開します。' },
      { type: 'steps', items: [
        'サイドパネルの座標リストから選択したい点の行をタップする',
        'その行がハイライトされ、下に編集パネルが展開する',
        'キャンバス上の対応する点も青くなる',
      ]},
      { type: 'tip', text: '点がキャンバス上で見えていなくても、リストからタップして選択できます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tap a row in the coordinate list to select that point. The corresponding point on the canvas is highlighted blue, and the inline edit panel expands below the row.' },
      { type: 'steps', items: [
        'Tap the desired point row in the coordinate list',
        'The row highlights and an edit panel expands below it',
        'The corresponding point on the canvas also turns blue',
      ]},
      { type: 'tip', text: 'You can select a point from the list even if it is not currently visible on the canvas.' },
    ],
  },
  {
    id: 'list-inline-edit',
    category: 'coord-list',
    titleJa: 'リストで座標を直接入力する',
    titleEn: 'Edit coordinates inline in the list',
    bodyJa: [
      { type: 'p', text: '座標リストで点を選択すると、その行の下にインライン編集パネルが表示されます。XとYの入力欄に数値を入力してEnterキーを押すか、入力欄の外をタップすると座標が更新されます。' },
      { type: 'steps', items: [
        '座標リストで編集したい点の行をタップして選択する',
        '展開した編集パネルのX欄またはY欄に数値を入力する',
        'Enterキーを押すか、他の場所をタップして確定する',
      ]},
      { type: 'tip', text: '無効な数値を入力した場合は、元の値に戻ります。小数点以下2桁まで入力できます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'When a point is selected in the coordinate list, an inline edit panel appears below its row. Type new X or Y values and press Enter (or tap outside) to apply.' },
      { type: 'steps', items: [
        'Tap a row in the coordinate list to select it',
        'Type a new number in the X or Y field of the edit panel below',
        'Press Enter or tap elsewhere to apply the change',
      ]},
      { type: 'tip', text: 'If you enter an invalid number, the value reverts to the previous coordinate. Up to 2 decimal places are supported.' },
    ],
  },
  {
    id: 'list-release-constraint',
    category: 'coord-list',
    titleJa: 'リストから拘束を解除する',
    titleEn: 'Release constraint from the list',
    bodyJa: [
      { type: 'p', text: '拘束されている点を座標リストで選択すると、編集パネルにUnlinkアイコンボタンが表示されます。このボタンをタップすると確認ダイアログが表示され、確認後にその点に接続されているすべての拘束線を一度に解除できます。' },
      { type: 'steps', items: [
        '鎖アイコン付きの行をタップして選択する',
        '編集パネルのUnlinkアイコンをタップする',
        '確認ダイアログで「はい」を選ぶ',
        'その点に接続されているすべての拘束が解除される',
      ]},
      { type: 'tip', text: 'この操作はUndoで元に戻せます。複数の拘束線がある場合は一括で解除されます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'When a constrained point is selected in the coordinate list, an Unlink icon button appears in the edit panel. Tapping it opens a confirmation dialog and then releases all constraints on segments connected to that point.' },
      { type: 'steps', items: [
        'Tap a constrained point row (one with a chain icon) to select it',
        'Tap the Unlink icon in the edit panel',
        'Confirm by tapping Yes in the dialog',
        'All constraints on that point\'s connected segments are released',
      ]},
      { type: 'tip', text: 'This action can be undone. If multiple constrained segments are connected, all are released in one action.' },
    ],
  },
  {
    id: 'show-coords-option',
    category: 'coord-list',
    titleJa: '点の座標を表示するオプション',
    titleEn: 'Show coordinates on the canvas',
    bodyJa: [
      { type: 'p', text: '「点の座標を表示」オプションをオンにすると、キャンバス上の各点ラベル（P1, P2…）の下にXY座標が数値で表示されます。座標の確認に便利です。' },
      { type: 'steps', items: [
        'ツールバー右端の設定アイコン（歯車）をタップする',
        '「表示」セクションの「点の座標を表示」トグルをオンにする',
        'キャンバスの各点に座標が表示される',
      ]},
      { type: 'tip', text: 'この設定はブラウザに保存されるため、ページを再読み込みしても維持されます。' },
    ],
    bodyEn: [
      { type: 'p', text: "Enabling 'Show point coordinates' displays XY values under each point label (P1, P2…) directly on the canvas. Useful for checking values at a glance." },
      { type: 'steps', items: [
        'Tap the Settings icon (gear) at the right end of the toolbar',
        "Toggle on 'Show point coordinates' in the Display section",
        'XY values appear under each Pn label on the canvas',
      ]},
      { type: 'tip', text: 'This setting is saved in the browser and persists across page reloads.' },
    ],
  },

  // ── 元に戻す・やり直す ────────────────────────────────────────────────
  {
    id: 'undo',
    category: 'undo-redo',
    titleJa: '直前の操作を元に戻す',
    titleEn: 'Undo the last action',
    bodyJa: [
      { type: 'p', text: '「元に戻す」機能を使うと、直前の操作（点の追加・移動・削除、拘束解除など）を取り消せます。何度でも繰り返し使用できます。' },
      { type: 'steps', items: [
        'ツールバーの「元に戻す」ボタン（逆方向の矢印）をタップする',
        'またはキーボードショートカット Ctrl+Z（Mac：⌘+Z）を使う',
        '操作が取り消されてひとつ前の状態に戻る',
      ]},
      { type: 'tip', text: '元に戻せる操作は最大50ステップです。新規作成ボタンを押した後はUndoスタックがリセットされます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Undo reverses the most recent action (adding, moving, or deleting a point, releasing a constraint, etc.). It can be used repeatedly.' },
      { type: 'steps', items: [
        'Tap the Undo button (left-arrow icon) in the toolbar',
        'Or use the keyboard shortcut Ctrl+Z (Mac: ⌘+Z)',
        'The last action is reversed and the path reverts to its previous state',
      ]},
      { type: 'tip', text: 'Up to 50 steps can be undone. The undo history resets when you tap the New button to start a fresh path.' },
    ],
  },
  {
    id: 'redo',
    category: 'undo-redo',
    titleJa: '元に戻した操作をやり直す',
    titleEn: 'Redo an undone action',
    bodyJa: [
      { type: 'p', text: '「やり直す」はUndoで取り消した操作を再度適用します。Undoの直後にのみ使えます。新しい操作を行うとRedoスタックはクリアされます。' },
      { type: 'steps', items: [
        'ツールバーの「やり直す」ボタン（順方向の矢印）をタップする',
        'またはキーボードショートカット Ctrl+Y（Mac：⌘+Y）を使う',
      ]},
      { type: 'tip', text: 'Undoを複数回行った後にRedoを使うと、取り消した操作を順に戻せます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Redo re-applies an action that was just undone. It is only available immediately after Undo. Performing any new action clears the redo history.' },
      { type: 'steps', items: [
        'Tap the Redo button (right-arrow icon) in the toolbar',
        'Or use the keyboard shortcut Ctrl+Y (Mac: ⌘+Y)',
      ]},
      { type: 'tip', text: 'If you undo several steps, Redo steps forward through the reversed actions one at a time.' },
    ],
  },
  {
    id: 'undo-limit',
    category: 'undo-redo',
    titleJa: 'Undoできる回数（最大50回）',
    titleEn: 'Undo limit (up to 50 steps)',
    bodyJa: [
      { type: 'p', text: 'Undoは最大50ステップまで保存されます。51ステップ以上遡ることはできません。' },
      { type: 'p', text: '「新規作成」ボタンを押すと新しい経路が始まり、それ以前のUndoスタックはリセットされます。ページのリロードでもスタックは消えますが、経路そのものは自動保存されています。' },
      { type: 'tip', text: '重要な経路の節目では「新規作成」で明示的に保存しておくことをお勧めします。保存された経路はいつでも履歴から呼び出せます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Undo stores up to 50 steps. You cannot undo beyond 50 actions.' },
      { type: 'p', text: 'Tapping the New button starts a fresh path and resets the undo stack. Reloading the page also clears the stack, but the route itself is automatically saved.' },
      { type: 'tip', text: 'At key milestones, explicitly save the route with New. Saved routes can always be recalled from the history panel.' },
    ],
  },

  // ── シミュレーション ───────────────────────────────────────────────────
  {
    id: 'sim-requirements',
    category: 'simulation',
    titleJa: '開始に必要な条件',
    titleEn: 'Requirements to start',
    bodyJa: [
      { type: 'p', text: 'シミュレーションを開始するには、現在の経路に2つ以上の点が必要です。点が1つ以下の場合、シミュレーションボタン（▶）はグレーアウトして押せない状態になります。' },
      { type: 'p', text: 'またシミュレーション中は点の追加・移動・削除などの編集操作は行えません。シミュレーションを停止してから編集してください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Simulation requires at least 2 points in the current route. If there is only 1 point or fewer, the Simulate button (▶) is grayed out and cannot be pressed.' },
      { type: 'p', text: 'While simulation is running, you cannot add, move, or delete points. Stop the simulation first, then resume editing.' },
    ],
  },
  {
    id: 'sim-start',
    category: 'simulation',
    titleJa: 'シミュレーションを開始する',
    titleEn: 'Start simulation',
    bodyJa: [
      { type: 'p', text: 'シミュレーションを開始すると、ワイヤーの先端を模したアイコンが経路の始点（P1）から動き出し、終点まで移動します。終点に到達すると自動で停止します。' },
      { type: 'steps', items: [
        '経路に2点以上あることを確認する',
        'ツールバーの「シミュレーション」ボタン（▶）をタップする',
        '画面下部にシミュレーションコントロールが表示され、ワイヤーヘッドがP1から動き始める',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'Starting the simulation launches a wire-head icon from the first point (P1), moving along the route to the last point, then automatically stopping.' },
      { type: 'steps', items: [
        'Ensure the route has at least 2 points',
        'Tap the Simulate button (▶) in the toolbar',
        'Simulation controls appear at the bottom and the wire head starts moving from P1',
      ]},
    ],
  },
  {
    id: 'sim-speed',
    category: 'simulation',
    titleJa: '再生速度を変える',
    titleEn: 'Adjust playback speed',
    bodyJa: [
      { type: 'p', text: 'シミュレーションの再生速度は画面下部のコントロールパネルにあるスライダーで調整できます。単位はmm/秒です。' },
      { type: 'steps', items: [
        'シミュレーション中、下部コントロールの「速度」スライダーを左右にドラッグする',
        '左にドラッグすると低速、右にドラッグすると高速になる',
      ]},
      { type: 'tip', text: '速度を変えても経路の距離は変わりません。経路をじっくり確認したい場合は低速に設定してください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Adjust the simulation playback speed using the Speed slider in the control panel at the bottom of the screen. The unit is mm/second.' },
      { type: 'steps', items: [
        'During simulation, drag the Speed slider in the bottom control panel left or right',
        'Left = slower, right = faster',
      ]},
      { type: 'tip', text: 'Changing speed does not affect the route itself. Set a slow speed to carefully inspect the path step by step.' },
    ],
  },
  {
    id: 'sim-pause',
    category: 'simulation',
    titleJa: '一時停止する',
    titleEn: 'Pause',
    bodyJa: [
      { type: 'p', text: 'シミュレーション中に「一時停止」ボタンをタップすると、ワイヤーヘッドがその場で静止します。再開ボタンを押すまで停止状態が続きます。' },
      { type: 'steps', items: [
        'シミュレーション中、下部コントロールの「一時停止」ボタンをタップする',
        'ワイヤーヘッドが現在位置で静止する',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'Tapping the Pause button during simulation freezes the wire head at its current position until you resume.' },
      { type: 'steps', items: [
        'Tap the Pause button in the simulation control panel',
        'The wire head stops at its current position',
      ]},
    ],
  },
  {
    id: 'sim-resume',
    category: 'simulation',
    titleJa: '再開する',
    titleEn: 'Resume',
    bodyJa: [
      { type: 'p', text: '一時停止中に「再開」ボタンをタップすると、停止した位置からシミュレーションが再開します。' },
      { type: 'steps', items: [
        '一時停止中、コントロールの「再開」ボタンをタップする',
        'ワイヤーヘッドが停止位置から動き始める',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'Tap the Resume button to continue the simulation from where it was paused.' },
      { type: 'steps', items: [
        'While paused, tap the Resume button in the control panel',
        'The wire head continues from where it stopped',
      ]},
    ],
  },
  {
    id: 'sim-restart',
    category: 'simulation',
    titleJa: '最初から再生する',
    titleEn: 'Restart from beginning',
    bodyJa: [
      { type: 'p', text: '「再スタート」ボタンをタップすると、ワイヤーヘッドが経路の始点（P1）に戻り、最初から再生が始まります。一時停止中でも再生中でも使えます。' },
      { type: 'steps', items: [
        'コントロールの「再スタート」ボタンをタップする',
        'ワイヤーヘッドがP1に戻り、最初から再生される',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'Tapping Restart returns the wire head to the first point (P1) and replays the route from the beginning. Works whether paused or playing.' },
      { type: 'steps', items: [
        'Tap the Restart button in the control panel',
        'The wire head jumps to P1 and starts playing from the beginning',
      ]},
    ],
  },
  {
    id: 'sim-skip',
    category: 'simulation',
    titleJa: '末尾にスキップする',
    titleEn: 'Skip to end',
    bodyJa: [
      { type: 'p', text: '「スキップ」ボタンをタップすると、ワイヤーヘッドが経路の末尾（最終点）に瞬時に移動します。終点の位置だけを素早く確認したいときに便利です。' },
      { type: 'steps', items: [
        'シミュレーション中またはON時にコントロールの「スキップ」ボタンをタップする',
        'ワイヤーヘッドが終点に瞬時にジャンプする',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'The Skip button instantly moves the wire head to the last point of the route. Useful for checking the end position without watching the full simulation.' },
      { type: 'steps', items: [
        'Tap the Skip button in the control panel while simulation is running or paused',
        'The wire head jumps instantly to the last point',
      ]},
    ],
  },
  {
    id: 'sim-stop',
    category: 'simulation',
    titleJa: 'シミュレーションを停止する',
    titleEn: 'Stop simulation',
    bodyJa: [
      { type: 'p', text: '「停止」ボタンをタップするとシミュレーションが完全に終了し、コントロールパネルが閉じ、キャンバスが通常の編集状態に戻ります。' },
      { type: 'steps', items: [
        'コントロールパネルの「停止」ボタンをタップする',
        'シミュレーションが終了し、キャンバスの編集が再び可能になる',
      ]},
      { type: 'tip', text: '「終了」と「停止」の違い：「終了」はシミュレーションが経路の末尾に到達して自動停止すること。「停止」はユーザーが途中で手動停止することです。どちらも編集モードに戻ります。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tapping Stop ends the simulation entirely, closes the control panel, and returns the canvas to normal editing mode.' },
      { type: 'steps', items: [
        'Tap the Stop button in the simulation control panel',
        'The simulation ends and the canvas returns to editing mode',
      ]},
      { type: 'tip', text: 'Difference between End and Stop: End means the simulation reached the last point automatically. Stop means you manually halted it mid-route. Both return to editing mode.' },
    ],
  },
  {
    id: 'sim-trail',
    category: 'simulation',
    titleJa: '通過済みの軌跡（琥珀色）',
    titleEn: 'Trail display (amber)',
    bodyJa: [
      { type: 'p', text: 'シミュレーション中、ワイヤーヘッドが通過した部分の経路は琥珀色（黄みがかったオレンジ）の太い線で表示されます。加工済みの部分と未加工の部分を視覚的に区別できます。' },
      { type: 'p', text: '直交モードで設定した青（水平）や緑（垂直）とは異なる色で表示されるため、通常の経路色と混同しにくくなっています。' },
    ],
    bodyEn: [
      { type: 'p', text: 'During simulation, the portion of the route already traveled by the wire head is shown as a thick amber (warm orange-yellow) line. This visually distinguishes the completed portion from the remaining path.' },
      { type: 'p', text: 'The amber trail is intentionally different from the blue (horizontal) and green (vertical) segment colors, to avoid confusion.' },
    ],
  },

  // ── 経路の保存・管理 ──────────────────────────────────────────────────
  {
    id: 'new-path',
    category: 'route-mgmt',
    titleJa: '新規作成で経路を保存する',
    titleEn: 'Save route and start new',
    bodyJa: [
      { type: 'p', text: '「新規作成」ボタンをタップすると、現在の経路が自動で保存されてから、新しい空の経路が始まります。複数の経路を分けて管理したいときに使います。' },
      { type: 'steps', items: [
        'ツールバーの「新規作成」ボタン（FilePlusアイコン）をタップする',
        '現在の経路が履歴に保存される',
        'キャンバスが空になり、新しい経路の入力が始められる',
      ]},
      { type: 'tip', text: '保存された経路は右側の「履歴」パネルから呼び出せます。経路名は日時で自動設定されますが、履歴パネルから変更できます。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tapping the New button automatically saves the current route to history and starts a fresh empty canvas. Use this to work on multiple separate routes.' },
      { type: 'steps', items: [
        'Tap the New button (FilePlus icon) in the toolbar',
        'The current route is saved to history',
        'The canvas clears and a new route begins',
      ]},
      { type: 'tip', text: 'Saved routes appear in the History panel on the right. Names default to the current date/time but can be renamed from the panel.' },
    ],
  },
  {
    id: 'open-path',
    category: 'route-mgmt',
    titleJa: '履歴から経路を呼び出す',
    titleEn: 'Open a route from history',
    bodyJa: [
      { type: 'p', text: '履歴パネルに保存されている過去の経路をタップして「開く」を選ぶと、その経路をキャンバスに呼び出せます。現在の経路は自動で保存されてから切り替わります。' },
      { type: 'steps', items: [
        '右側サイドパネル下部の「履歴」セクションを開く',
        '呼び出したい経路名の行をタップする',
        '「開く」を選択する',
        'その経路がキャンバスに表示される',
      ]},
      { type: 'tip', text: '経路を開く前に現在の経路が自動で保存されます。作業中のデータが失われる心配はありません。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tap a saved route in the History panel and select Open to load it onto the canvas. The current route is automatically saved before switching.' },
      { type: 'steps', items: [
        'Open the History section at the bottom of the right side panel',
        'Tap the desired route name row',
        'Select Open',
        'That route is loaded onto the canvas',
      ]},
      { type: 'tip', text: 'The current route is automatically saved before a history route is opened, so you will not lose your work.' },
    ],
  },
  {
    id: 'rename-path',
    category: 'route-mgmt',
    titleJa: '経路の名前を変更する',
    titleEn: 'Rename a route',
    bodyJa: [
      { type: 'p', text: '履歴パネルの経路名の横にある「名前を変更」オプションから、経路に分かりやすい名前を付けられます。' },
      { type: 'steps', items: [
        '履歴パネルで名前を変更したい経路の行をタップする',
        '「名前を変更」を選択する',
        '入力欄に新しい名前を入力してEnterを押す',
      ]},
      { type: 'tip', text: '経路名は日時（例：2025-06-01 14:30）から始まりますが、好きな名前に変更できます。加工品番や材料名などを入れると管理しやすくなります。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Use the Rename option in the History panel to give a route a descriptive name.' },
      { type: 'steps', items: [
        'Tap the route row in the History panel',
        'Select Rename',
        'Type the new name in the input field and press Enter',
      ]},
      { type: 'tip', text: 'Route names default to a timestamp (e.g., 2025-06-01 14:30). Renaming with a part number or material name makes history management easier.' },
    ],
  },
  {
    id: 'delete-path',
    category: 'route-mgmt',
    titleJa: '履歴の経路を削除する',
    titleEn: 'Delete a route from history',
    bodyJa: [
      { type: 'p', text: '不要になった経路は履歴パネルから削除できます。削除した経路は復元できません。' },
      { type: 'steps', items: [
        '履歴パネルで削除したい経路の行をタップする',
        '「削除」を選択する',
        '確認ダイアログで「はい」を選ぶ',
      ]},
      { type: 'warn', text: '削除した経路は復元できません。削除前に必要な情報は手元に控えておいてください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Remove unneeded routes from the History panel. Deleted routes cannot be recovered.' },
      { type: 'steps', items: [
        'Tap the route row in the History panel',
        'Select Delete',
        'Tap Yes in the confirmation dialog',
      ]},
      { type: 'warn', text: 'Deleted routes cannot be recovered. Make sure you no longer need the route before deleting.' },
    ],
  },
  {
    id: 'clear-path',
    category: 'route-mgmt',
    titleJa: '現在の経路をクリアする',
    titleEn: 'Clear the current route',
    bodyJa: [
      { type: 'p', text: 'ツールバーの「クリア」ボタンをタップすると、現在のキャンバス上の経路をすべて削除できます。この操作は元に戻せません。' },
      { type: 'steps', items: [
        'ツールバーの「クリア」ボタン（消しゴムアイコン）をタップする',
        '確認ダイアログが表示される',
        '「はい」を選択すると経路がクリアされる',
      ]},
      { type: 'warn', text: 'クリアは元に戻せません。大切な経路は先に「新規作成」で保存してください。' },
    ],
    bodyEn: [
      { type: 'p', text: 'Tapping the Clear button in the toolbar removes all points from the current canvas. This action cannot be undone.' },
      { type: 'steps', items: [
        'Tap the Clear button (eraser icon) in the toolbar',
        'A confirmation dialog appears',
        'Tap Yes to clear the route',
      ]},
      { type: 'warn', text: 'Clear cannot be undone. Save the route with New first if you want to keep it.' },
    ],
  },
  {
    id: 'autosave',
    category: 'route-mgmt',
    titleJa: '自動保存について',
    titleEn: 'About auto-save',
    bodyJa: [
      { type: 'p', text: 'このアプリは経路の変更を自動でブラウザのデータベース（IndexedDB）に保存します。点を追加・移動・削除するたびに保存が行われるため、ページを閉じたり更新したりしても次回起動時に最後の状態から再開できます。' },
      { type: 'p', text: '保存はブラウザのローカルストレージを使用しているため、インターネット接続がなくても機能します。ただし、ブラウザのキャッシュをクリアすると保存データが消える可能性があります。' },
      { type: 'tip', text: '大切な経路は「新規作成」ボタンで明示的に保存し、履歴からいつでも呼び出せる状態にしておくことをお勧めします。' },
    ],
    bodyEn: [
      { type: 'p', text: 'The app automatically saves route changes to a browser database (IndexedDB) whenever you add, move, or delete a point. When you reload or reopen the page, the app resumes from where you left off.' },
      { type: 'p', text: 'Storage is local to the browser and works without an internet connection. Note that clearing browser cache may delete saved data.' },
      { type: 'tip', text: 'For important routes, explicitly save them with the New button so they appear in History and can always be recalled.' },
    ],
  },

  // ── 設定 ──────────────────────────────────────────────────────────────
  {
    id: 'theme',
    category: 'settings',
    titleJa: 'テーマを変更する',
    titleEn: 'Change theme',
    bodyJa: [
      { type: 'p', text: '「設定」メニューでアプリのテーマ（外観）を変更できます。「システム設定に従う」「ライト」「ダーク」の3つから選べます。' },
      { type: 'steps', items: [
        'ツールバー右端の設定アイコン（歯車）をタップする',
        '「テーマ」セクションで希望のテーマを選択する',
      ]},
      { type: 'tip', text: '夜間作業ではダークテーマが目に優しく便利です。設定はブラウザに保存されます。' },
    ],
    bodyEn: [
      { type: 'p', text: "Change the app's visual theme in the Settings menu. Choose from System (follow OS setting), Light, or Dark." },
      { type: 'steps', items: [
        'Tap the Settings icon (gear) at the right end of the toolbar',
        'Select your preferred theme in the Theme section',
      ]},
      { type: 'tip', text: 'Dark mode is easier on the eyes during nighttime work. The setting is saved in the browser.' },
    ],
  },
  {
    id: 'language',
    category: 'settings',
    titleJa: '言語を切り替える',
    titleEn: 'Switch language',
    bodyJa: [
      { type: 'p', text: 'アプリの表示言語を日本語と英語で切り替えられます。設定はブラウザに保存されます。' },
      { type: 'steps', items: [
        'ツールバー右端の設定アイコンをタップする',
        '「言語」セクションで「日本語」または「English」を選択する',
      ]},
    ],
    bodyEn: [
      { type: 'p', text: 'Switch the app display language between Japanese and English. The setting is saved in the browser.' },
      { type: 'steps', items: [
        'Tap the Settings icon (gear) at the right end of the toolbar',
        'Select 日本語 or English in the Language section',
      ]},
    ],
  },
  {
    id: 'show-coords-setting',
    category: 'settings',
    titleJa: '点の座標表示の設定',
    titleEn: 'Show point coordinates setting',
    bodyJa: [
      { type: 'p', text: '「設定」の「表示」セクションにある「点の座標を表示」トグルをオンにすると、キャンバス上の各点ラベルの下にXY座標が数値で表示されます。' },
      { type: 'steps', items: [
        '設定アイコンをタップして設定メニューを開く',
        '「表示」セクションの「点の座標を表示」トグルをオンにする',
        'キャンバスの各点のP番号の下に座標が表示される',
      ]},
      { type: 'tip', text: '座標を常時表示すると画面が少し見づらくなる場合があります。確認作業が終わったらオフに戻すとよいでしょう。' },
    ],
    bodyEn: [
      { type: 'p', text: "The 'Show point coordinates' toggle in the Display section of Settings displays XY values under each point's Pn label on the canvas." },
      { type: 'steps', items: [
        'Tap the Settings icon to open the Settings menu',
        "Toggle on 'Show point coordinates' in the Display section",
        'XY values appear under each Pn label on the canvas',
      ]},
      { type: 'tip', text: 'Keeping coordinates always visible can feel cluttered. Turn it off after checking values if you prefer a cleaner view.' },
    ],
  },
]
