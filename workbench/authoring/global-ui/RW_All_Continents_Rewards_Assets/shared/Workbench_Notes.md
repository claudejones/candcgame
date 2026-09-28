# Shared rewards utilities v1.0
Import once for every continent and difficulty. Atlas96×32 transparent RGBA; three32×32 cells: heart_empty[0,0,32,32], heart_full[32,0,32,32], perfect_star[64,0,32,32]. Rectangles are x,y,width,height. Replace obsolete128×32 four-cell sheet; do not reuse old numeric star index3. Use semantic IDs.

Hollow heart has a truly transparent interior. Full red heart has identical outer silhouette. Gold star preserves previous artwork. Display at32px or integer multiples where practical, nearest-neighbor; keep live accessible labels. Utility icons supplement text and are not touch targets themselves.

Show three rating slots under trophy; earned slots red, remainder hollow. Zero stored rating means unearned. Best ratings only increase. Star beside passport means all three stage bests are3. No special assisted/disabled heart exists. Unlimited Health completion earns no new rewards or improvements; existing legitimate records stay unchanged. Completion label: Stage complete — rewards disabled while Unlimited Health is on. No trophy/stamp award animation for assisted completion.

No buttons, animation frames or audio supplied. These icons appear in reward/achievement/result UI. Runtime may reveal a newly earned heart or perfect star alongside the reward; reduced motion immediate. Artwork writes no save state. Workbench handles persistence and input. Continent packages reference this dependency without duplicate PNGs. Final consolidated reward bundle contains it once.

Original code-authored utility PNG and identical integration atlas included; enlarged review-only preview is not an import asset. Hollow/full shape, transparency, frame isolation and ZIP checks verified; actual-device review remains with Workbench.
