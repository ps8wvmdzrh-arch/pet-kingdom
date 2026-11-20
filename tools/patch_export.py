# -*- coding: utf-8 -*-
import io, os

BASE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(BASE, '..', 'game.js')
s = io.open(G, encoding='utf-8').read()

old = "window.__RAINBOW__ = { ST: ST, getZone: getZone, saveGame: saveGame, ZONES: ZONES, SPECIES: SPECIES, startBattle: startBattle, zoneWild: zoneWild, say: say, advanceDialog: advanceDialog, STORY: STORY, newPet: newPet };"
new = ("window.__RAINBOW__ = { ST: ST, getZone: getZone, saveGame: saveGame, loadGame: loadGame, ZONES: ZONES, SPECIES: SPECIES,\n"
       "    startBattle: startBattle, zoneWild: zoneWild, say: say, advanceDialog: advanceDialog, STORY: STORY, newPet: newPet,\n"
       "    evoReq: evoReq, doEvolve: doEvolve, petMoves: petMoves, captureChance: captureChance, mountCandidates: mountCandidates,\n"
       "    statOf: statOf, maxhpOf: maxhpOf, maxmpOf: maxmpOf, PASSIVE: PASSIVE, MATS: MATS, SECRET: SECRET, DEX_ORDER: DEX_ORDER,\n"
       "    TOTAL_SPECIES: TOTAL_SPECIES, ZMAPS: ZMAPS, tryThrow: tryThrow, afterStep: afterStep, get hits() { return hits; } };")

if s.count(old) != 1:
    print('FAIL export anchor', s.count(old))
else:
    s = s.replace(old, new, 1)
    io.open(G, 'w', encoding='utf-8', newline='\n').write(s)
    print('ok export patched')
