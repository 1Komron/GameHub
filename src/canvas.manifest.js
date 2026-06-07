export const manifest = {
  screens: {
    scr_g82rl2: { name: "Home", route: "/", position: { "x": 160, "y": 1820 } },
    scr_5hu3qo: { name: "Mode Select", route: "/game/tic-tac-toe/mode", position: { "x": 1560, "y": 1820 } },
    scr_cr4jmx: { name: "Lobby", route: "/lobby/TEST123", position: { "x": 2960, "y": 1820 } },
    scr_9mn4nb: { name: "Play Local", route: "/play/local/tic-tac-toe", position: { "x": 5760, "y": 1820 } },
    scr_re3zm7: { name: "Play Online", route: "/play/online/TEST123", position: { "x": 4360, "y": 1820 } },
    scr_stjkyb: { name: "Statistics", route: "/statistics", position: { "x": 160, "y": 3800 } },
    scr_fxreu2: { name: "Settings", route: "/settings", position: { "x": 1560, "y": 3800 } }
  },
  sections: {
    sec_r07zk1: { name: "Gameplay Flow", x: 0, y: 1600, width: 7120, height: 1180 },
    sec_7tjugz: { name: "Utility & Settings", x: 0, y: 3580, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_r07zk1", children: [
    { kind: "screen", id: "scr_g82rl2" },
    { kind: "screen", id: "scr_5hu3qo" },
    { kind: "screen", id: "scr_cr4jmx" },
    { kind: "screen", id: "scr_re3zm7" },
    { kind: "screen", id: "scr_9mn4nb" }]
  },
  { kind: "section", id: "sec_7tjugz", children: [
    { kind: "screen", id: "scr_stjkyb" },
    { kind: "screen", id: "scr_fxreu2" }]
  }]

};