from pathlib import Path

# Give this phone-test build a fresh package ID so Android never treats it as an
# update of an APK signed by a different temporary CI key.
gradle = Path('sandbox-android/app/build.gradle.kts')
s = gradle.read_text(encoding='utf-8')
s = s.replace('applicationId = "org.sliqado.sandbox"', 'applicationId = "org.sliqado.sandbox.phonetest.v32fix1"')
s = s.replace('versionCode = 2', 'versionCode = 321')
s = s.replace('versionName = "3.0"', 'versionName = "3.2-phone-test-fix1"')
s = s.replace('versionName = "2.0-offline"', 'versionName = "3.2-phone-test-fix1"')
gradle.write_text(s, encoding='utf-8')

manifest = Path('sandbox-android/app/src/main/AndroidManifest.xml')
m = manifest.read_text(encoding='utf-8')
m = m.replace('android:label="Sand:Box"', 'android:label="Sand:Box V3.2 Fix"')
manifest.write_text(m, encoding='utf-8')

game = Path('sandbox-android/app/src/main/java/org/sliqado/sandbox/GameView.kt')
s = game.read_text(encoding='utf-8')

old_gases = '''            STEAM, SMOKE, GAS -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).coerceAtMost(32767).toShort()
                gas(x, y, 3)
                if ((life[i].toInt() and 0xffff) > 420 && t != GAS) clearCell(i)
            }
'''
new_gases = '''            STEAM -> {
                val age = (life[i].toInt() and 0xffff) + 1
                life[i] = age.coerceAtMost(32767).toShort()
                val j = if (tick % 2 == 0) gas(x, y, 2) else i
                temp[j] -= .85f
                if (age >= 85 || temp[j] < 92f) {
                    type[j] = WATER.toByte()
                    life[j] = 0
                    temp[j] = min(temp[j], 78f)
                }
            }
            SMOKE -> {
                val age = (life[i].toInt() and 0xffff) + 1
                life[i] = age.coerceAtMost(32767).toShort()
                val j = if (tick % 3 == 0) gas(x, y, 2) else i
                temp[j] += (24f - temp[j]) * .06f
                if (age >= 150 || (age > 75 && rnd.nextFloat() < .015f)) clearCell(j)
            }
            GAS -> gas(x, y, 3)
'''

old_fire = '''            FIRE -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).coerceAtMost(32767).toShort()
                temp[i] = max(temp[i], 820f)
                igniteAround(x, y, 760f)
                if (hasNeighbor(x, y, WATER, SALTWATER, LIQUID_NITROGEN, FOAM) && rnd.nextFloat() < .30f) {
                    clearCell(i)
                    return
                }
                val age = life[i].toInt() and 0xffff
                if (age > 80 + rnd.nextInt(100)) {
                    type[i] = if (rnd.nextFloat() < .55f) SMOKE.toByte() else ASH.toByte()
                    life[i] = 0
                    return
                }
                gas(x, y, 2)
            }
'''
new_fire = '''            FIRE -> {
                val age = (life[i].toInt() and 0xffff) + 1
                life[i] = age.coerceAtMost(32767).toShort()
                temp[i] = max(temp[i], 760f)
                igniteAround(x, y, 700f)

                if (hasNeighbor(x, y, WATER, SALTWATER, LIQUID_NITROGEN, FOAM)) {
                    if (rnd.nextFloat() < .72f) {
                        clearCell(i)
                        return
                    }
                }

                // Flames stay close to the source instead of shooting to the top.
                if (age >= 44 || y <= 2) {
                    val r = rnd.nextFloat()
                    if (r < .46f) {
                        type[i] = SMOKE.toByte()
                        life[i] = 0
                        temp[i] = 145f
                    } else if (r < .66f) {
                        type[i] = ASH.toByte()
                        life[i] = 0
                        temp[i] = 45f
                    } else {
                        clearCell(i)
                    }
                    return
                }

                if (age > 26 && rnd.nextFloat() < .055f) {
                    type[i] = SMOKE.toByte()
                    life[i] = 0
                    temp[i] = 155f
                    return
                }

                // One upward move only every third simulation tick.
                if (tick % 3 == 0) gas(x, y, 1)
            }
'''

if old_gases not in s:
    raise SystemExit('Expected original steam/smoke/gas block not found')
if old_fire not in s:
    raise SystemExit('Expected original fire block not found')
s = s.replace(old_gases, new_gases).replace(old_fire, new_fire)

old_material = '''    private fun materialColor(i: Int, t: Int, x: Int, y: Int): Int {
        if (t == AIR) return 0xff080a12.toInt()
        var c = defs[t]?.color ?: Color.MAGENTA
        if (t == SEED && (life[i].toInt() and 0xffff) > 35) c = 0xff4ead59.toInt()
        if (t == LAMP && volt[i] > 8f) c = 0xfffff4a3.toInt()
        c = PixelSprites.textureColor(t, x, y, c, tick + (life[i].toInt() and 255))
        val tt = temp[i]
        if (tt > 80f) {
            c = blend(c, if (tt > 900f) Color.WHITE else 0xffff5a22.toInt(), min(1f, (tt - 80f) / 900f))
        } else if (tt < 0f) {
            c = blend(c, 0xff62c8ff.toInt(), min(.75f, -tt / 200f))
        }
        return c
    }
'''
new_material = '''    private fun enhanceMaterialTexture(t: Int, x: Int, y: Int, color: Int): Int {
        val n = ((x * 37 + y * 71 + t * 101) xor (x * y * 11 + t * 17)) and 255
        val motion = defs[t]?.motion
        var c = color

        c = when (motion) {
            MotionKind.POWDER -> when {
                n % 11 == 0 -> blend(c, Color.WHITE, .24f)
                n % 7 == 0 -> blend(c, Color.BLACK, .20f)
                else -> c
            }
            MotionKind.LIQUID -> when {
                (y + x / 4 + tick / 4) % 9 == 0 -> blend(c, Color.WHITE, .22f)
                n % 13 == 0 -> blend(c, Color.BLACK, .11f)
                else -> c
            }
            MotionKind.GAS -> when {
                n % 5 == 0 -> blend(c, Color.WHITE, .18f)
                n % 9 == 0 -> blend(c, Color.BLACK, .13f)
                else -> c
            }
            MotionKind.STATIC -> when {
                n % 17 == 0 -> blend(c, Color.WHITE, .18f)
                n % 13 == 0 -> blend(c, Color.BLACK, .18f)
                else -> c
            }
            else -> c
        }

        return when (t) {
            FIRE -> {
                val age = life[id(x, y)].toInt() and 0xffff
                val flicker = ((x * 5 + y * 3 + tick / 2 + age) xor n) and 7
                when {
                    age > 32 -> if (flicker < 3) 0xffff5a12.toInt() else 0xffd92c0b.toInt()
                    flicker == 0 -> 0xfffffff0.toInt()
                    flicker <= 2 -> 0xffffef66.toInt()
                    flicker <= 5 -> 0xffff8a18.toInt()
                    else -> 0xffff3b0b.toInt()
                }
            }
            STEAM -> if (n % 4 == 0) blend(c, Color.WHITE, .42f) else blend(c, 0xffb8d8e8.toInt(), .20f)
            SMOKE -> if (n % 5 == 0) blend(c, Color.BLACK, .24f) else c
            WATER, SALTWATER -> if ((y + x / 5 + tick / 5) % 8 == 0) blend(c, Color.WHITE, .30f) else c
            LAVA -> if (n % 6 == 0) 0xffffd74a.toInt() else if (n % 11 == 0) 0xff7e1908.toInt() else c
            ICE -> if ((x - y + 96) % 11 == 0) Color.WHITE else c
            METAL, COPPER, WIRE, MERCURY -> if ((x + y) % 13 == 0) blend(c, Color.WHITE, .42f) else c
            PLASMA -> if ((x + y + tick / 2) % 4 == 0) Color.WHITE else c
            URANIUM -> if (n % 13 == 0) 0xffd8ff59.toInt() else c
            else -> c
        }
    }

    private fun materialColor(i: Int, t: Int, x: Int, y: Int): Int {
        if (t == AIR) return 0xff080a12.toInt()
        var c = defs[t]?.color ?: Color.MAGENTA
        if (t == SEED && (life[i].toInt() and 0xffff) > 35) c = 0xff4ead59.toInt()
        if (t == LAMP && volt[i] > 8f) c = 0xfffff4a3.toInt()
        c = PixelSprites.textureColor(t, x, y, c, tick + (life[i].toInt() and 255))
        c = enhanceMaterialTexture(t, x, y, c)
        val tt = temp[i]
        if (tt > 80f && t != FIRE) {
            c = blend(c, if (tt > 900f) Color.WHITE else 0xffff5a22.toInt(), min(1f, (tt - 80f) / 900f))
        } else if (tt < 0f) {
            c = blend(c, 0xff62c8ff.toInt(), min(.75f, -tt / 200f))
        }
        return c
    }
'''
if old_material not in s:
    raise SystemExit('Expected materialColor block not found')
s = s.replace(old_material, new_material)
game.write_text(s, encoding='utf-8')

sprites = Path('sandbox-android/app/src/main/java/org/sliqado/sandbox/PixelSprites.kt')
p = sprites.read_text(encoding='utf-8')
old_fire_tex = '            5 -> when { (x + y + p / 3) % 6 == 0 -> Color.rgb(255, 239, 112); n % 3 == 0 -> Color.rgb(255, 74, 12); else -> Color.rgb(255, 145, 28) }'
new_fire_tex = '            5 -> when { ((x * 3 + y * 5 + p / 2) xor n) % 9 == 0 -> Color.rgb(255,255,235); n % 5 == 0 -> Color.rgb(255,236,75); n % 3 == 0 -> Color.rgb(255,120,18); else -> Color.rgb(235,48,8) }'
old_steam_tex = '            10 -> when { (x + y + p / 7) % 5 == 0 -> light(base, .28f); n % 11 == 0 -> dark(base, .10f); else -> base }'
new_steam_tex = '            10 -> when { (x + y + p / 5) % 5 == 0 -> Color.rgb(245,252,255); n % 7 == 0 -> light(base, .42f); n % 13 == 0 -> dark(base, .16f); else -> base }'
old_fire_icon = '            5 -> if ((y >= 1 && y <= 6) && r2 <= (if (y < 4) 6 else 10)) if (y < 3) white else if ((x + y) % 3 == 0) hi else base else clear'
new_fire_icon = '            5 -> if ((y in 1..6) && ((x in 2..5 && y >= 3) || (x in 3..4 && y >= 1) || (x == 2 && y == 2))) when { y <= 2 -> white; x in 3..4 && y <= 4 -> Color.rgb(255,238,88); y >= 5 -> Color.rgb(230,55,10); else -> Color.rgb(255,132,20) } else clear'
for old, new, name in [
    (old_fire_tex, new_fire_tex, 'fire texture'),
    (old_steam_tex, new_steam_tex, 'steam texture'),
    (old_fire_icon, new_fire_icon, 'fire icon'),
]:
    if old not in p:
        raise SystemExit(f'Expected {name} pattern not found')
    p = p.replace(old, new)
sprites.write_text(p, encoding='utf-8')

print('V3.2 phone-test patches applied.')
