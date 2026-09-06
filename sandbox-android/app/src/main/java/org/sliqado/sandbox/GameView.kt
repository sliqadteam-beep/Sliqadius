package org.sliqado.sandbox

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.view.MotionEvent
import android.view.View
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.random.Random

class GameView(context: Context) : View(context) {
    companion object E {
        const val AIR = 0
        const val SAND = 1
        const val WATER = 2
        const val STONE = 3
        const val WOOD = 4
        const val FIRE = 5
        const val OIL = 6
        const val SEED = 7
        const val ACID = 8
        const val SALT = 9
        const val STEAM = 10
        const val ICE = 11
        const val LAVA = 12
        const val METAL = 13
        const val COPPER = 14
        const val WIRE = 15
        const val BATTERY = 16
        const val HEATER = 17
        const val COOLER = 18
        const val LAMP = 19
        const val SPARK = 20
        const val GUNPOWDER = 21
        const val GLASS = 22
        const val COAL = 23
        const val SMOKE = 24
        const val GAS = 25
        const val SALTWATER = 26
        const val MUD = 27
        const val SNOW = 28
        const val LIQUID_NITROGEN = 29
        const val ANT = 30
        const val SUGAR = 31
        const val WAX = 32
        const val MOLTEN_WAX = 33
        const val MOLTEN_METAL = 34
        const val MOLTEN_COPPER = 35
        const val MOLTEN_GLASS = 36
        const val MERCURY = 37
        const val ALCOHOL = 38
        const val FOAM = 39
        const val CONCRETE = 40
        const val CEMENT = 41
        const val CLAY = 42
        const val URANIUM = 43
        const val PLASMA = 44
        const val ASH = 45
        const val CHARCOAL = 46
        const val HONEY = 47
        const val SPONGE = 48
    }

    private enum class MotionKind { STATIC, POWDER, LIQUID, GAS, ANT }
    private enum class ViewMode { MATERIAL, HEAT, ELECTRIC }

    private data class Def(
        val id: Int,
        val name: String,
        val short: String,
        val color: Int,
        val motion: MotionKind,
        val conductive: Boolean = false,
        val resistance: Float = 6f,
        val hot: Boolean = false,
        val cold: Boolean = false,
        val flammable: Boolean = false,
        val category: Int = 0
    )

    private val defs = arrayOfNulls<Def>(49)
    private val list = ArrayList<Def>(48)
    private fun add(d: Def) { defs[d.id] = d; list.add(d) }

    private val GW = 160
    private val GH = 240
    private val N = GW * GH
    private val type = ByteArray(N)
    private val life = ShortArray(N)
    private val temp = FloatArray(N) { 20f }
    private val volt = FloatArray(N)
    private val moved = IntArray(N)
    private val heatNext = FloatArray(N)
    private val pixels = IntArray(N)
    private val queue = IntArray(N)
    private val bitmap = Bitmap.createBitmap(GW, GH, Bitmap.Config.ARGB_8888)
    private val src = Rect(0, 0, GW, GH)
    private val dst = RectF()
    private val card = RectF()

    private val p = Paint(Paint.ANTI_ALIAS_FLAG)
    private val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE
        textAlign = Paint.Align.CENTER
        typeface = android.graphics.Typeface.DEFAULT_BOLD
    }
    private val thin = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2f
        color = Color.rgb(80, 84, 92)
    }
    private val rnd = Random(System.nanoTime())

    private var selected = SAND
    private var brush = 4
    private var paused = false
    private var viewMode = ViewMode.MATERIAL
    private var tick = 1
    private var frame = 0
    private var erasing = false

    private var simBottom = 0f
    private var controlH = 0f
    private var controlW = 0f
    private var materialsTop = 0f
    private var materialW = 0f
    private var materialH = 0f
    private var elementScrollX = 0f

    private var touchInWorld = false
    private var touchInPanel = false
    private var touchInMaterials = false
    private var lastX = -1f
    private var lastY = -1f
    private var panelDownX = 0f
    private var panelDownY = 0f
    private var panelLastX = 0f
    private var panelDragged = false
    private var cursorX = 0f
    private var cursorY = 0f
    private var cursorVisible = false

    private val loop = object : Runnable {
        override fun run() {
            if (!paused && frame % 2 == 0) step()
            frame++
            invalidate()
            postOnAnimation(this)
        }
    }

    init {
        isFocusable = true
        keepScreenOn = true
        buildDefinitions()
        demoWorld()
        postOnAnimation(loop)
    }

    private fun buildDefinitions() {
        fun d(
            id: Int, n: String, s: String, c: Int, m: MotionKind,
            cond: Boolean = false, r: Float = 6f, hot: Boolean = false,
            cold: Boolean = false, flamm: Boolean = false, cat: Int = 0
        ) = add(Def(id, n, s, c, m, cond, r, hot, cold, flamm, cat))

        d(SAND, "Sand", "SA", 0xffd8b45f.toInt(), MotionKind.POWDER)
        d(WATER, "Water", "WA", 0xff3489e8.toInt(), MotionKind.LIQUID)
        d(STONE, "Stone", "ST", 0xff777d82.toInt(), MotionKind.STATIC)
        d(WOOD, "Wood", "WO", 0xff9a5f36.toInt(), MotionKind.STATIC, flamm = true)
        d(FIRE, "Fire", "FI", 0xffff6a16.toInt(), MotionKind.GAS, hot = true, cat = 1)
        d(OIL, "Oil", "OI", 0xff332b24.toInt(), MotionKind.LIQUID, flamm = true, cat = 2)
        d(SEED, "Seeds", "SE", 0xff8b632c.toInt(), MotionKind.POWDER, flamm = true, cat = 3)
        d(ACID, "Acid", "AC", 0xff79db36.toInt(), MotionKind.LIQUID, cat = 2)
        d(SALT, "Salt", "SL", 0xfff0eee9.toInt(), MotionKind.POWDER)
        d(STEAM, "Steam", "VM", 0xffc5d0d4.toInt(), MotionKind.GAS, hot = true, cat = 1)
        d(ICE, "Ice", "IC", 0xff9edff5.toInt(), MotionKind.STATIC, cold = true, cat = 1)
        d(LAVA, "Lava", "LV", 0xffef4315.toInt(), MotionKind.LIQUID, hot = true, cat = 1)
        d(METAL, "Metal", "ME", 0xff9ca7ad.toInt(), MotionKind.STATIC, true, 4f, cat = 4)
        d(COPPER, "Copper", "CU", 0xffc7723c.toInt(), MotionKind.STATIC, true, 1.5f, cat = 4)
        d(WIRE, "Wire", "WI", 0xffd2a139.toInt(), MotionKind.STATIC, true, 1.5f, cat = 4)
        d(BATTERY, "Battery", "BA", 0xff66b85a.toInt(), MotionKind.STATIC, true, .5f, cat = 4)
        d(HEATER, "Heater", "HT", 0xffd75f3e.toInt(), MotionKind.STATIC, true, 2.5f, hot = true, cat = 4)
        d(COOLER, "Cooler", "CL", 0xff4caedc.toInt(), MotionKind.STATIC, true, 2.5f, cold = true, cat = 4)
        d(LAMP, "Lamp", "LA", 0xffffdc55.toInt(), MotionKind.STATIC, true, 3f, cat = 4)
        d(SPARK, "Spark", "SP", 0xffa6efff.toInt(), MotionKind.GAS, true, 1f, hot = true, cat = 4)
        d(GUNPOWDER, "Gunpowder", "GP", 0xff45433f.toInt(), MotionKind.POWDER, flamm = true, cat = 2)
        d(GLASS, "Glass", "GL", 0xff87b7c3.toInt(), MotionKind.STATIC)
        d(COAL, "Coal", "CO", 0xff292d30.toInt(), MotionKind.POWDER, flamm = true)
        d(SMOKE, "Smoke", "SM", 0xff596065.toInt(), MotionKind.GAS)
        d(GAS, "Gas", "GA", 0xffb6a174.toInt(), MotionKind.GAS, flamm = true, cat = 2)
        d(SALTWATER, "Salt Water", "SW", 0xff3d95bf.toInt(), MotionKind.LIQUID, true, 5f, cat = 2)
        d(MUD, "Mud", "MU", 0xff6d4d36.toInt(), MotionKind.LIQUID)
        d(SNOW, "Snow", "SN", 0xffe9f7fb.toInt(), MotionKind.POWDER, cold = true, cat = 1)
        d(LIQUID_NITROGEN, "Liquid N2", "N2", 0xffb5f1ff.toInt(), MotionKind.LIQUID, cold = true, cat = 5)
        d(ANT, "Ants", "AN", 0xff151517.toInt(), MotionKind.ANT, cat = 5)
        d(SUGAR, "Sugar", "SU", 0xfffff0cf.toInt(), MotionKind.POWDER, flamm = true, cat = 5)
        d(WAX, "Wax", "WX", 0xffffdfa0.toInt(), MotionKind.STATIC, flamm = true, cat = 5)
        d(MOLTEN_WAX, "Molten Wax", "MW", 0xffffae43.toInt(), MotionKind.LIQUID, hot = true, flamm = true, cat = 5)
        d(MOLTEN_METAL, "Molten Metal", "MM", 0xffff8a42.toInt(), MotionKind.LIQUID, true, 3f, hot = true, cat = 5)
        d(MOLTEN_COPPER, "Molten Copper", "MC", 0xffff7133.toInt(), MotionKind.LIQUID, true, 1.5f, hot = true, cat = 5)
        d(MOLTEN_GLASS, "Molten Glass", "MG", 0xffffc47a.toInt(), MotionKind.LIQUID, hot = true, cat = 5)
        d(MERCURY, "Mercury", "HG", 0xffbdc7ce.toInt(), MotionKind.LIQUID, true, 2.5f, cat = 5)
        d(ALCOHOL, "Alcohol", "AL", 0xffb9d8ed.toInt(), MotionKind.LIQUID, flamm = true, cat = 5)
        d(FOAM, "Foam", "FO", 0xffeef4f4.toInt(), MotionKind.LIQUID, cat = 5)
        d(CONCRETE, "Concrete", "CR", 0xff8d8c87.toInt(), MotionKind.STATIC, cat = 5)
        d(CEMENT, "Cement", "CE", 0xffb7b2aa.toInt(), MotionKind.POWDER, cat = 5)
        d(CLAY, "Clay", "CY", 0xffa5644b.toInt(), MotionKind.POWDER, cat = 5)
        d(URANIUM, "Uranium", "UR", 0xff76b842.toInt(), MotionKind.POWDER, true, 7f, hot = true, cat = 5)
        d(PLASMA, "Plasma", "PL", 0xffff5ce8.toInt(), MotionKind.GAS, true, 1f, hot = true, cat = 5)
        d(ASH, "Ash", "AS", 0xff74716c.toInt(), MotionKind.POWDER, cat = 5)
        d(CHARCOAL, "Charcoal", "CH", 0xff202224.toInt(), MotionKind.POWDER, flamm = true, cat = 5)
        d(HONEY, "Honey", "HO", 0xffd28713.toInt(), MotionKind.LIQUID, flamm = true, cat = 5)
        d(SPONGE, "Sponge", "SG", 0xffffd94e.toInt(), MotionKind.STATIC, flamm = true, cat = 5)
    }

    private fun id(x: Int, y: Int) = x + y * GW
    private fun inside(x: Int, y: Int) = x >= 0 && x < GW && y >= 0 && y < GH
    private fun tAt(x: Int, y: Int): Int = if (inside(x, y)) type[id(x, y)].toInt() and 255 else STONE

    private fun defaultTemp(t: Int) = when (t) {
        LAVA -> 1250f
        FIRE -> 820f
        PLASMA -> 2200f
        SPARK -> 550f
        MOLTEN_METAL -> 1550f
        MOLTEN_COPPER -> 1180f
        MOLTEN_GLASS -> 1500f
        MOLTEN_WAX -> 85f
        ICE -> -12f
        SNOW -> -8f
        LIQUID_NITROGEN -> -196f
        COOLER -> -20f
        else -> 20f
    }

    private fun setCell(x: Int, y: Int, t: Int, l: Int = 0, temperature: Float? = null) {
        if (!inside(x, y)) return
        val i = id(x, y)
        type[i] = t.toByte()
        life[i] = l.coerceIn(0, 32767).toShort()
        temp[i] = temperature ?: defaultTemp(t)
        volt[i] = 0f
        moved[i] = tick
    }

    private fun clearCell(i: Int) {
        type[i] = AIR.toByte()
        life[i] = 0
        temp[i] = 20f
        volt[i] = 0f
        moved[i] = tick
    }

    private fun swap(a: Int, b: Int) {
        val tt = type[a]; type[a] = type[b]; type[b] = tt
        val ll = life[a]; life[a] = life[b]; life[b] = ll
        val tp = temp[a]; temp[a] = temp[b]; temp[b] = tp
        val vv = volt[a]; volt[a] = volt[b]; volt[b] = vv
        moved[a] = tick
        moved[b] = tick
    }

    private fun neighbor(x: Int, y: Int, target: Int): Int {
        for (dy in -1..1) for (dx in -1..1) {
            if (dx == 0 && dy == 0) continue
            val nx = x + dx
            val ny = y + dy
            if (!inside(nx, ny)) continue
            val i = id(nx, ny)
            if ((type[i].toInt() and 255) == target) return i
        }
        return -1
    }

    private fun neighborAny(x: Int, y: Int, vararg targets: Int): Int {
        for (dy in -1..1) for (dx in -1..1) {
            if (dx == 0 && dy == 0) continue
            val nx = x + dx
            val ny = y + dy
            if (!inside(nx, ny)) continue
            val i = id(nx, ny)
            val q = type[i].toInt() and 255
            for (t in targets) if (q == t) return i
        }
        return -1
    }

    private fun hasNeighbor(x: Int, y: Int, vararg targets: Int) = neighborAny(x, y, *targets) >= 0

    private fun isFluid(t: Int) = when (t) {
        WATER, OIL, ACID, SALTWATER, MUD, LAVA, LIQUID_NITROGEN, MOLTEN_WAX,
        MOLTEN_METAL, MOLTEN_COPPER, MOLTEN_GLASS, MERCURY, ALCOHOL, FOAM, HONEY -> true
        else -> false
    }

    private fun density(t: Int) = when (t) {
        AIR -> 0
        FOAM -> 20
        OIL -> 70
        ALCOHOL -> 76
        LIQUID_NITROGEN -> 80
        WATER -> 100
        SALTWATER -> 108
        MUD -> 130
        HONEY -> 145
        MOLTEN_WAX -> 88
        MERCURY -> 260
        LAVA -> 215
        MOLTEN_GLASS -> 185
        MOLTEN_METAL -> 235
        MOLTEN_COPPER -> 225
        ACID -> 112
        SAND -> 165
        SALT -> 190
        SUGAR -> 125
        SNOW -> 45
        ASH -> 55
        CHARCOAL -> 85
        COAL -> 150
        GUNPOWDER -> 145
        CEMENT -> 155
        CLAY -> 170
        URANIUM -> 210
        else -> 200
    }

    private fun powderCanEnter(current: Int, target: Int): Boolean {
        if (target == AIR) return true
        return isFluid(target) && density(current) > density(target) + 5
    }

    private fun powder(x: Int, y: Int, slow: Int = 1): Int {
        val i = id(x, y)
        if (slow > 1 && tick % slow != 0) return i
        val current = type[i].toInt() and 255
        if (y + 1 < GH && powderCanEnter(current, tAt(x, y + 1))) {
            val j = id(x, y + 1)
            swap(i, j)
            return j
        }
        val first = if (rnd.nextBoolean()) 1 else -1
        for (dx in intArrayOf(first, -first)) {
            val nx = x + dx
            val ny = y + 1
            if (inside(nx, ny) && powderCanEnter(current, tAt(nx, ny))) {
                val j = id(nx, ny)
                swap(i, j)
                return j
            }
        }
        return i
    }

    private fun liquid(x: Int, y: Int, spread: Int = 4, viscosity: Int = 1): Int {
        val i = id(x, y)
        if (viscosity > 1 && tick % viscosity != 0) return i
        val current = type[i].toInt() and 255
        val currentDensity = density(current)

        if (y + 1 < GH) {
            val q = tAt(x, y + 1)
            if (q == AIR || (isFluid(q) && q != current && currentDensity > density(q) + 5)) {
                val j = id(x, y + 1)
                swap(i, j)
                return j
            }
        }

        val first = if (rnd.nextBoolean()) 1 else -1
        for (d in 1..spread) {
            for (sign in intArrayOf(first, -first)) {
                val nx = x + sign * d
                if (!inside(nx, y)) continue
                val q = tAt(nx, y)
                if (q == AIR) {
                    val j = id(nx, y)
                    swap(i, j)
                    return j
                }
                if (isFluid(q) && q != current && currentDensity > density(q) + 20) {
                    val j = id(nx, y)
                    swap(i, j)
                    return j
                }
                if (q != current) break
            }
        }
        return i
    }

    private fun gas(x: Int, y: Int, spread: Int = 2): Int {
        val i = id(x, y)
        if (y > 0 && tAt(x, y - 1) == AIR) {
            val j = id(x, y - 1)
            swap(i, j)
            return j
        }
        val first = if (rnd.nextBoolean()) 1 else -1
        for (d in 1..spread) {
            for (sign in intArrayOf(first, -first)) {
                val nx = x + sign * d
                if (inside(nx, y - 1) && tAt(nx, y - 1) == AIR) {
                    val j = id(nx, y - 1)
                    swap(i, j)
                    return j
                }
                if (inside(nx, y) && tAt(nx, y) == AIR) {
                    val j = id(nx, y)
                    swap(i, j)
                    return j
                }
            }
        }
        return i
    }

    private fun igniteAround(x: Int, y: Int, heat: Float) {
        for (dy in -1..1) for (dx in -1..1) {
            if (dx == 0 && dy == 0) continue
            val nx = x + dx
            val ny = y + dy
            if (!inside(nx, ny)) continue
            val i = id(nx, ny)
            val q = type[i].toInt() and 255
            val d = defs[q]
            if (d?.flammable == true) {
                val chance = when (q) {
                    GAS, GUNPOWDER, ALCOHOL -> .30f
                    OIL -> .15f
                    else -> .05f
                }
                if (rnd.nextFloat() < chance) {
                    type[i] = FIRE.toByte()
                    life[i] = 0
                    temp[i] = max(temp[i], heat)
                }
            }
        }
    }

    private fun Int.sign() = when {
        this < 0 -> -1
        this > 0 -> 1
        else -> 0
    }

    private fun updateAnt(x: Int, y: Int) {
        val i = id(x, y)
        if (temp[i] > 80f || hasNeighbor(x, y, FIRE, LAVA, PLASMA, ACID)) {
            clearCell(i)
            return
        }
        if (hasNeighbor(x, y, WATER, SALTWATER, LIQUID_NITROGEN) && rnd.nextFloat() < .07f) {
            clearCell(i)
            return
        }

        var tx = 0
        var ty = 0
        var found = false
        loop@ for (r in 1..7) {
            for (dy in -r..r) for (dx in -r..r) {
                val nx = x + dx
                val ny = y + dy
                if (!inside(nx, ny)) continue
                val q = tAt(nx, ny)
                if (q == SEED || q == SUGAR || q == HONEY) {
                    tx = dx.sign()
                    ty = dy.sign()
                    found = true
                    break@loop
                }
            }
        }

        if (found && abs(tx) <= 1 && abs(ty) <= 1) {
            val nx = x + tx
            val ny = y + ty
            if (inside(nx, ny)) {
                val food = id(nx, ny)
                val q = type[food].toInt() and 255
                if (q == SEED || q == SUGAR || q == HONEY) {
                    clearCell(food)
                    life[i] = min(300, (life[i].toInt() and 0xffff) + 20).toShort()
                    return
                }
            }
        }

        val choices = if (found) {
            arrayOf(intArrayOf(tx, ty), intArrayOf(tx, 0), intArrayOf(0, ty))
        } else {
            arrayOf(
                intArrayOf(if (rnd.nextBoolean()) 1 else -1, 0),
                intArrayOf(0, if (rnd.nextBoolean()) 1 else -1),
                intArrayOf(if (rnd.nextBoolean()) 1 else -1, if (rnd.nextBoolean()) 1 else -1)
            )
        }

        for (c in choices) {
            val nx = x + c[0]
            val ny = y + c[1]
            if (!inside(nx, ny) || tAt(nx, ny) != AIR) continue
            val support = tAt(nx, ny + 1) != AIR || tAt(nx - 1, ny) != AIR || tAt(nx + 1, ny) != AIR
            if (support) {
                swap(i, id(nx, ny))
                return
            }
        }
    }

    private fun phaseChanges(i: Int, t: Int) {
        val tt = temp[i]
        when (t) {
            WATER, SALTWATER -> if (tt < 0f) {
                type[i] = ICE.toByte(); life[i] = 0
            } else if (tt > 104f) {
                type[i] = STEAM.toByte(); life[i] = 0
            }
            ICE, SNOW -> if (tt > 1f) { type[i] = WATER.toByte(); life[i] = 0 }
            STEAM -> if (tt < 88f) { type[i] = WATER.toByte(); life[i] = 0 }
            WAX -> if (tt > 62f) { type[i] = MOLTEN_WAX.toByte(); life[i] = 0 }
            MOLTEN_WAX -> if (tt < 54f) { type[i] = WAX.toByte(); life[i] = 0 }
            METAL -> if (tt > 1450f) { type[i] = MOLTEN_METAL.toByte(); life[i] = 0 }
            MOLTEN_METAL -> if (tt < 1330f) { type[i] = METAL.toByte(); life[i] = 0 }
            COPPER, WIRE -> if (tt > 1085f) { type[i] = MOLTEN_COPPER.toByte(); life[i] = 0 }
            MOLTEN_COPPER -> if (tt < 980f) { type[i] = COPPER.toByte(); life[i] = 0 }
            GLASS -> if (tt > 1400f) { type[i] = MOLTEN_GLASS.toByte(); life[i] = 0 }
            MOLTEN_GLASS -> if (tt < 850f) { type[i] = GLASS.toByte(); life[i] = 0 }
            STONE -> if (tt > 1350f) { type[i] = LAVA.toByte(); life[i] = 0 }
            LAVA -> if (tt < 680f) { type[i] = STONE.toByte(); life[i] = 0 }
            SUGAR -> if (tt > 185f) { type[i] = HONEY.toByte(); life[i] = 0 }
            ALCOHOL -> if (tt > 78f) { type[i] = GAS.toByte(); life[i] = 0 }
            MERCURY -> if (tt > 357f) { type[i] = GAS.toByte(); life[i] = 0 }
            CLAY -> if (tt > 1050f) { type[i] = STONE.toByte(); life[i] = 0 }
            MUD -> if (tt > 115f) { type[i] = CLAY.toByte(); life[i] = 0 }
            FOAM -> if (tt > 105f) { type[i] = STEAM.toByte(); life[i] = 0 }
        }
    }

    private fun reactLocal(x: Int, y: Int, i: Int, t: Int): Boolean {
        if (t == GUNPOWDER && (temp[i] > 190f || hasNeighbor(x, y, FIRE, SPARK, PLASMA))) {
            for (dy in -3..3) for (dx in -3..3) {
                val nx = x + dx
                val ny = y + dy
                if (!inside(nx, ny)) continue
                val j = id(nx, ny)
                temp[j] += 280f
                val q = type[j].toInt() and 255
                if (q == GUNPOWDER || rnd.nextFloat() < .18f) {
                    type[j] = FIRE.toByte()
                    life[j] = 0
                }
            }
            return true
        }

        if (t == ACID) {
            for (dy in -1..1) for (dx in -1..1) {
                if (dx == 0 && dy == 0) continue
                val nx = x + dx
                val ny = y + dy
                if (!inside(nx, ny)) continue
                val j = id(nx, ny)
                val q = type[j].toInt() and 255
                if (q != AIR && q != ACID && q != GLASS && q != MOLTEN_GLASS && rnd.nextFloat() < .025f) {
                    clearCell(j)
                    if (rnd.nextFloat() < .10f) {
                        clearCell(i)
                        return true
                    }
                }
            }
        }

        if (t == SALT) {
            val w = neighborAny(x, y, WATER)
            if (w >= 0 && rnd.nextFloat() < .18f) {
                type[w] = SALTWATER.toByte()
                clearCell(i)
                return true
            }
        }

        if (t == WATER || t == SALTWATER) {
            val lava = neighborAny(x, y, LAVA)
            if (lava >= 0 && rnd.nextFloat() < .16f) {
                type[lava] = STONE.toByte()
                temp[lava] = 420f
                type[i] = STEAM.toByte()
                temp[i] = 115f
                life[i] = 0
                return true
            }
            val sand = neighborAny(x, y, SAND)
            if (sand >= 0 && rnd.nextFloat() < .0018f) type[sand] = MUD.toByte()
        }

        if (t == CEMENT) {
            val w = neighborAny(x, y, WATER, SALTWATER)
            if (w >= 0 && rnd.nextFloat() < .08f) {
                clearCell(w)
                type[i] = CONCRETE.toByte()
                life[i] = 0
                return true
            }
        }

        if (t == LIQUID_NITROGEN) {
            val w = neighborAny(x, y, WATER, SALTWATER)
            if (w >= 0 && rnd.nextFloat() < .20f) {
                type[w] = ICE.toByte()
                temp[w] = -25f
            }
            val fire = neighborAny(x, y, FIRE, SPARK)
            if (fire >= 0) clearCell(fire)
        }

        if (t == FOAM) {
            val fire = neighborAny(x, y, FIRE, SPARK)
            if (fire >= 0 && rnd.nextFloat() < .40f) {
                clearCell(fire)
                temp[i] = min(temp[i], 35f)
            }
        }

        if (defs[t]?.flammable == true) {
            val ignition = when (t) {
                GAS, ALCOHOL -> 150f
                OIL, GUNPOWDER -> 180f
                else -> 300f
            }
            if (temp[i] > ignition || hasNeighbor(x, y, FIRE, SPARK, PLASMA)) {
                val chance = when (t) {
                    GAS, ALCOHOL -> .30f
                    OIL, GUNPOWDER -> .16f
                    else -> .045f
                }
                if (rnd.nextFloat() < chance) {
                    type[i] = FIRE.toByte()
                    life[i] = 0
                    temp[i] = max(temp[i], 500f)
                    return true
                }
            }
        }

        return false
    }

    private fun updateCell(x: Int, y: Int) {
        val i = id(x, y)
        if (moved[i] == tick) return
        val t = type[i].toInt() and 255
        if (t == AIR) return

        phaseChanges(i, t)
        val afterPhase = type[i].toInt() and 255
        if (afterPhase != t) return
        if (reactLocal(x, y, i, t)) return
        if ((type[i].toInt() and 255) != t) return

        when (t) {
            SAND, SALT, SUGAR, CEMENT, CLAY, ASH, CHARCOAL, COAL, GUNPOWDER -> powder(x, y)
            SNOW -> powder(x, y, 2)
            URANIUM -> {
                val j = powder(x, y, 2)
                temp[j] += .25f
                if (tick % 12 == 0) {
                    val ux = j % GW
                    val uy = j / GW
                    for (dy in -1..1) for (dx in -1..1) {
                        if (inside(ux + dx, uy + dy)) temp[id(ux + dx, uy + dy)] += .3f
                    }
                }
            }
            WATER, SALTWATER, ACID -> liquid(x, y, 5)
            OIL -> liquid(x, y, 7)
            ALCOHOL -> liquid(x, y, 7)
            MERCURY -> liquid(x, y, 3)
            MUD -> liquid(x, y, 2, 3)
            FOAM -> liquid(x, y, 5, 2)
            HONEY -> liquid(x, y, 2, 4)
            MOLTEN_WAX -> liquid(x, y, 3, 2)
            LAVA, MOLTEN_METAL, MOLTEN_COPPER, MOLTEN_GLASS -> liquid(x, y, 2, 2)
            LIQUID_NITROGEN -> {
                val age = (life[i].toInt() and 0xffff) + 1
                life[i] = age.coerceAtMost(32767).toShort()
                for (dy in -1..1) for (dx in -1..1) {
                    val nx = x + dx
                    val ny = y + dy
                    if (inside(nx, ny)) temp[id(nx, ny)] -= 4.2f
                }
                val warm = max(0f, temp[i] + 196f)
                val limit = max(20f, 120f - warm * .22f)
                if (age > limit || rnd.nextFloat() < warm / 8000f) {
                    clearCell(i)
                    return
                }
                liquid(x, y, 6)
            }
            STEAM, SMOKE, GAS -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).coerceAtMost(32767).toShort()
                gas(x, y, 3)
                if ((life[i].toInt() and 0xffff) > 420 && t != GAS) clearCell(i)
            }
            FIRE -> {
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
            SPARK -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).toShort()
                temp[i] = 550f
                igniteAround(x, y, 640f)
                if ((life[i].toInt() and 0xffff) > 18) clearCell(i) else gas(x, y, 1)
            }
            PLASMA -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).toShort()
                temp[i] = 2200f
                igniteAround(x, y, 1700f)
                for (dy in -1..1) for (dx in -1..1) {
                    if (inside(x + dx, y + dy)) temp[id(x + dx, y + dy)] += 35f
                }
                if ((life[i].toInt() and 0xffff) > 70) type[i] = FIRE.toByte() else gas(x, y, 2)
            }
            SEED -> {
                val j = powder(x, y)
                if ((type[j].toInt() and 255) != SEED) return
                val sx = j % GW
                val sy = j / GW
                if (temp[j] in 4f..46f && hasNeighbor(sx, sy, WATER, SALTWATER) &&
                    (tAt(sx, sy + 1) == MUD || tAt(sx, sy + 1) == SAND || tAt(sx, sy + 1) == CLAY)
                ) {
                    val age = (life[j].toInt() and 0xffff) + 1
                    life[j] = age.coerceAtMost(32767).toShort()
                    if (age > 35 && rnd.nextFloat() < .025f) {
                        val ny = sy - 1
                        if (inside(sx, ny) && tAt(sx, ny) == AIR) {
                            setCell(sx, ny, SEED, min(220, age + 30), temp[j])
                        }
                    }
                }
            }
            ANT -> updateAnt(x, y)
            SPONGE -> {
                var stored = life[i].toInt() and 0xffff
                if (stored < 220) {
                    val water = neighborAny(x, y, WATER, SALTWATER)
                    if (water >= 0 && rnd.nextFloat() < .14f) {
                        clearCell(water)
                        stored = min(220, stored + 20)
                        life[i] = stored.toShort()
                    }
                }
                if (temp[i] > 105f && stored > 0 && y > 0 && tAt(x, y - 1) == AIR && rnd.nextFloat() < .08f) {
                    setCell(x, y - 1, STEAM, 0, 105f)
                    life[i] = max(0, stored - 8).toShort()
                }
            }
        }
    }

    private fun conductive(t: Int) = defs.getOrNull(t)?.conductive == true || t == SALTWATER || t == MERCURY || t == PLASMA

    private fun computeElectricity() {
        java.util.Arrays.fill(volt, 0f)
        var head = 0
        var tail = 0
        for (i in 0 until N) {
            when (type[i].toInt() and 255) {
                BATTERY -> { volt[i] = 100f; if (tail < N) queue[tail++] = i }
                SPARK, PLASMA -> { volt[i] = 78f; if (tail < N) queue[tail++] = i }
            }
        }
        while (head < tail) {
            val i = queue[head++]
            val vv = volt[i]
            if (vv < 1.5f) continue
            val x = i % GW
            val y = i / GW
            fun push(j: Int) {
                val q = type[j].toInt() and 255
                if (!conductive(q)) return
                val nv = vv - (defs[q]?.resistance ?: 6f)
                if (nv > volt[j] + .35f) {
                    volt[j] = nv
                    if (tail < N) queue[tail++] = j
                }
            }
            if (x > 0) push(i - 1)
            if (x < GW - 1) push(i + 1)
            if (y > 0) push(i - GW)
            if (y < GH - 1) push(i + GW)
        }

        for (i in 0 until N) {
            when (type[i].toInt() and 255) {
                HEATER -> if (volt[i] > 8f) temp[i] = min(900f, temp[i] + 22f)
                COOLER -> if (volt[i] > 8f) temp[i] = max(-190f, temp[i] - 19f)
                LAMP -> if (volt[i] > 8f) temp[i] += .9f
            }
        }
    }

    private fun updateHeat() {
        for (i in 0 until N) heatNext[i] = temp[i]
        for (y in 1 until GH - 1) for (x in 1 until GW - 1) {
            val i = id(x, y)
            val t = type[i].toInt() and 255
            val target = when (t) {
                LAVA -> 1250f
                FIRE -> 820f
                PLASMA -> 2200f
                MOLTEN_METAL -> 1550f
                MOLTEN_COPPER -> 1180f
                MOLTEN_GLASS -> 1500f
                LIQUID_NITROGEN -> -196f
                ICE -> -12f
                SNOW -> -8f
                else -> 20f
            }
            val source = when (t) {
                LAVA, FIRE, PLASMA, MOLTEN_METAL, MOLTEN_COPPER, MOLTEN_GLASS, LIQUID_NITROGEN -> .08f
                ICE, SNOW -> .025f
                AIR -> .004f
                else -> 0f
            }
            if (source > 0f) heatNext[i] += (target - temp[i]) * source
            val k = when (t) {
                COPPER, MOLTEN_COPPER -> .18f
                METAL, MOLTEN_METAL, WIRE -> .13f
                WATER, SALTWATER, MERCURY -> .085f
                STONE, CONCRETE, GLASS -> .05f
                else -> .025f
            }
            val avg = (temp[i - 1] + temp[i + 1] + temp[i - GW] + temp[i + GW]) * .25f
            heatNext[i] += (avg - temp[i]) * k
        }
        for (i in 0 until N) temp[i] = heatNext[i].coerceIn(-210f, 2600f)
    }

    private fun step() {
        tick++
        if (tick == Int.MAX_VALUE) {
            java.util.Arrays.fill(moved, 0)
            tick = 1
        }
        if (tick % 3 == 0) computeElectricity()
        if (tick % 4 == 0) updateHeat()

        for (y in GH - 2 downTo 0) {
            if (rnd.nextBoolean()) {
                for (x in 0 until GW) {
                    val t = type[id(x, y)].toInt() and 255
                    if (t !in intArrayOf(FIRE, STEAM, SMOKE, GAS, PLASMA, SPARK)) updateCell(x, y)
                }
            } else {
                for (x in GW - 1 downTo 0) {
                    val t = type[id(x, y)].toInt() and 255
                    if (t !in intArrayOf(FIRE, STEAM, SMOKE, GAS, PLASMA, SPARK)) updateCell(x, y)
                }
            }
        }

        for (y in 1 until GH) {
            if (rnd.nextBoolean()) {
                for (x in 0 until GW) {
                    val t = type[id(x, y)].toInt() and 255
                    if (t == FIRE || t == STEAM || t == SMOKE || t == GAS || t == PLASMA || t == SPARK) updateCell(x, y)
                }
            } else {
                for (x in GW - 1 downTo 0) {
                    val t = type[id(x, y)].toInt() and 255
                    if (t == FIRE || t == STEAM || t == SMOKE || t == GAS || t == PLASMA || t == SPARK) updateCell(x, y)
                }
            }
        }
    }

    private fun blend(a: Int, b: Int, f: Float): Int {
        val q = f.coerceIn(0f, 1f)
        val r = (Color.red(a) + (Color.red(b) - Color.red(a)) * q).roundToInt()
        val g = (Color.green(a) + (Color.green(b) - Color.green(a)) * q).roundToInt()
        val bl = (Color.blue(a) + (Color.blue(b) - Color.blue(a)) * q).roundToInt()
        return Color.rgb(r, g, bl)
    }

    private fun heatColor(v: Float): Int = when {
        v < -100f -> Color.rgb(70, 85, 255)
        v < 0f -> blend(Color.rgb(70, 85, 255), Color.rgb(70, 220, 255), (v + 100f) / 100f)
        v < 100f -> blend(Color.rgb(70, 220, 255), Color.rgb(255, 220, 70), v / 100f)
        v < 700f -> blend(Color.rgb(255, 220, 70), Color.rgb(255, 70, 20), (v - 100f) / 600f)
        else -> blend(Color.rgb(255, 70, 20), Color.WHITE, (v - 700f) / 1200f)
    }

    private fun materialColor(i: Int, t: Int, x: Int, y: Int): Int {
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

    private fun renderBitmap() {
        for (y in 0 until GH) for (x in 0 until GW) {
            val i = id(x, y)
            val t = type[i].toInt() and 255
            pixels[i] = when (viewMode) {
                ViewMode.MATERIAL -> materialColor(i, t, x, y)
                ViewMode.HEAT -> if (t == AIR) 0xff050711.toInt() else heatColor(temp[i])
                ViewMode.ELECTRIC -> if (t == AIR) {
                    0xff050711.toInt()
                } else if (volt[i] > 1f) {
                    blend(0xff3b3000.toInt(), 0xfffff36a.toInt(), min(1f, volt[i] / 100f))
                } else {
                    blend(materialColor(i, t, x, y), 0xff0b1020.toInt(), .70f)
                }
            }
        }
        bitmap.setPixels(pixels, 0, GW, 0, 0, GW, GH)
    }

    override fun onDraw(c: Canvas) {
        super.onDraw(c)
        c.drawColor(0xff0b0d12.toInt())

        simBottom = height * .70f
        val panelH = height - simBottom
        controlH = panelH * .34f
        controlW = width / 7f
        materialsTop = simBottom + controlH
        materialH = (height - materialsTop) / 2f
        materialW = width / 4.25f

        renderBitmap()
        dst.set(0f, 0f, width.toFloat(), simBottom)
        p.isFilterBitmap = false
        c.drawBitmap(bitmap, src, dst, p)

        drawHud(c)
        drawBrushPreview(c)
        drawPanel(c)
    }

    private fun drawHud(c: Canvas) {
        val margin = max(8f, width * .018f)
        val h = max(32f, height * .036f)
        val name = if (erasing) "Eraser" else defs[selected]?.name ?: "Material"
        val label = "$name   Brush $brush"
        p.style = Paint.Style.FILL
        p.color = 0xaa10141c.toInt()
        card.set(margin, margin, min(width - margin, margin + width * .48f), margin + h)
        c.drawRoundRect(card, h * .28f, h * .28f, p)
        text.color = Color.WHITE
        text.textSize = h * .42f
        text.typeface = android.graphics.Typeface.DEFAULT_BOLD
        c.drawText(label, card.centerX(), card.centerY() + text.textSize * .34f, text)
    }

    private fun drawBrushPreview(c: Canvas) {
        if (!cursorVisible || cursorY >= simBottom) return
        val radius = max(3f, brush * width / GW.toFloat())
        thin.style = Paint.Style.STROKE
        thin.strokeWidth = max(2f, width / 360f)
        thin.color = 0xccffffff.toInt()
        c.drawCircle(cursorX, cursorY, radius, thin)
    }

    private fun drawPanel(c: Canvas) {
        p.style = Paint.Style.FILL
        p.color = 0xff11141a.toInt()
        c.drawRect(0f, simBottom, width.toFloat(), height.toFloat(), p)
        drawControls(c)
        drawElements(c)
    }

    private fun controlCard(c: Canvas, index: Int, label: String, sub: String, active: Boolean = false) {
        val gap = max(2f, width / 320f)
        val left = index * controlW + gap
        val top = simBottom + gap
        val right = (index + 1) * controlW - gap
        val bottom = materialsTop - gap
        card.set(left, top, right, bottom)
        p.style = Paint.Style.FILL
        p.color = if (active) 0xff343b48.toInt() else 0xff20242c.toInt()
        c.drawRoundRect(card, controlH * .10f, controlH * .10f, p)
        thin.style = Paint.Style.STROKE
        thin.strokeWidth = if (active) max(2.5f, width / 220f) else max(1.5f, width / 420f)
        thin.color = if (active) 0xfff3f6fa.toInt() else 0xff3c424e.toInt()
        c.drawRoundRect(card, controlH * .10f, controlH * .10f, thin)

        text.color = Color.WHITE
        text.typeface = android.graphics.Typeface.DEFAULT_BOLD
        text.textSize = controlH * .29f
        c.drawText(label, card.centerX(), top + controlH * .45f, text)
        text.color = 0xffaab2bf.toInt()
        text.textSize = controlH * .105f
        c.drawText(sub, card.centerX(), top + controlH * .73f, text)
    }

    private fun drawControls(c: Canvas) {
        controlCard(c, 0, "NEW", "clear")
        val viewLabel = when (viewMode) {
            ViewMode.MATERIAL -> "MAT"
            ViewMode.HEAT -> "HOT"
            ViewMode.ELECTRIC -> "ELE"
        }
        controlCard(c, 1, viewLabel, "view", viewMode != ViewMode.MATERIAL)
        controlCard(c, 2, if (paused) ">" else "II", if (paused) "play" else "pause", paused)
        controlCard(c, 3, "ER", "erase", erasing)
        controlCard(c, 4, "-", "brush")
        controlCard(c, 5, brush.toString(), "size", true)
        controlCard(c, 6, "+", "brush")
    }

    private fun categoryColor(d: Def) = when {
        d.id == ANT || d.id == SEED -> 0xff31452f.toInt()
        d.category == 4 -> 0xff383246.toInt()
        d.cold -> 0xff29414b.toInt()
        d.hot || d.flammable -> 0xff493b27.toInt()
        d.motion == MotionKind.LIQUID -> 0xff263d48.toInt()
        d.motion == MotionKind.GAS -> 0xff343940.toInt()
        else -> 0xff303238.toInt()
    }

    private fun drawMaterialCard(c: Canvas, x: Float, y: Float, d: Def, active: Boolean) {
        val gap = max(3f, width / 300f)
        card.set(x + gap, y + gap, x + materialW - gap, y + materialH - gap)
        p.style = Paint.Style.FILL
        p.color = if (active) blend(categoryColor(d), Color.WHITE, .11f) else categoryColor(d)
        c.drawRoundRect(card, materialH * .10f, materialH * .10f, p)

        thin.style = Paint.Style.STROKE
        thin.strokeWidth = if (active) max(3f, width / 180f) else max(1.5f, width / 430f)
        thin.color = if (active) Color.WHITE else 0xff454b55.toInt()
        c.drawRoundRect(card, materialH * .10f, materialH * .10f, thin)

        val iconSize = min(materialW * .35f, materialH * .47f)
        PixelSprites.drawIcon(c, d.id, card.left + (card.width() - iconSize) / 2f, card.top + materialH * .06f, iconSize, d.color, p)

        text.color = Color.WHITE
        text.typeface = android.graphics.Typeface.DEFAULT_BOLD
        text.textSize = materialH * .18f
        c.drawText(d.short, card.centerX(), card.top + materialH * .65f, text)
        text.color = 0xffc6ccd5.toInt()
        text.textSize = materialH * if (d.name.length > 10) .092f else .105f
        c.drawText(d.name, card.centerX(), card.top + materialH * .84f, text)
    }

    private fun maxElementScroll(): Float {
        val columns = ceil(list.size / 2.0).toInt()
        return max(0f, columns * materialW - width)
    }

    private fun drawElements(c: Canvas) {
        val maxScroll = maxElementScroll()
        elementScrollX = elementScrollX.coerceIn(0f, maxScroll)

        for (n in list.indices) {
            val col = n / 2
            val row = n % 2
            val x = col * materialW - elementScrollX
            val y = materialsTop + row * materialH
            if (x + materialW < 0f || x > width) continue
            val d = list[n]
            drawMaterialCard(c, x, y, d, d.id == selected && !erasing)
        }

        if (maxScroll > 0f) {
            val trackH = max(3f, height / 420f)
            val thumbW = max(width * .16f, width * (width / (maxScroll + width)))
            val thumbX = (elementScrollX / maxScroll) * (width - thumbW)
            p.style = Paint.Style.FILL
            p.color = 0xff303640.toInt()
            c.drawRect(0f, height - trackH, width.toFloat(), height.toFloat(), p)
            p.color = 0xffaeb6c2.toInt()
            c.drawRoundRect(thumbX, height - trackH, thumbX + thumbW, height.toFloat(), trackH / 2f, trackH / 2f, p)
        }
    }

    override fun onTouchEvent(e: MotionEvent): Boolean {
        val x = e.x
        val y = e.y
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                lastX = x
                lastY = y
                panelDownX = x
                panelDownY = y
                panelLastX = x
                panelDragged = false
                if (y < simBottom) {
                    touchInWorld = true
                    touchInPanel = false
                    touchInMaterials = false
                    cursorVisible = true
                    cursorX = x
                    cursorY = y
                    paintWorld(x, y)
                } else {
                    touchInWorld = false
                    touchInPanel = true
                    touchInMaterials = y >= materialsTop
                }
            }
            MotionEvent.ACTION_MOVE -> {
                if (touchInWorld) {
                    cursorVisible = true
                    cursorX = x
                    cursorY = y
                    paintLine(lastX, lastY, x, y)
                    lastX = x
                    lastY = y
                } else if (touchInPanel && touchInMaterials) {
                    val dx = x - panelLastX
                    if (abs(x - panelDownX) > 8f) panelDragged = true
                    elementScrollX = (elementScrollX - dx).coerceIn(0f, maxElementScroll())
                    panelLastX = x
                    invalidate()
                }
            }
            MotionEvent.ACTION_UP -> {
                if (touchInPanel && !panelDragged && abs(x - panelDownX) < 24f && abs(y - panelDownY) < 24f) {
                    handlePanelTap(x, y)
                }
                touchInWorld = false
                touchInPanel = false
                touchInMaterials = false
                cursorVisible = false
                performClick()
                invalidate()
            }
            MotionEvent.ACTION_CANCEL -> {
                touchInWorld = false
                touchInPanel = false
                touchInMaterials = false
                cursorVisible = false
            }
        }
        return true
    }

    override fun performClick(): Boolean {
        super.performClick()
        return true
    }

    private fun handlePanelTap(x: Float, y: Float) {
        if (y < materialsTop) {
            val col = (x / controlW).toInt().coerceIn(0, 6)
            when (col) {
                0 -> newWorld()
                1 -> viewMode = when (viewMode) {
                    ViewMode.MATERIAL -> ViewMode.HEAT
                    ViewMode.HEAT -> ViewMode.ELECTRIC
                    ViewMode.ELECTRIC -> ViewMode.MATERIAL
                }
                2 -> paused = !paused
                3 -> erasing = !erasing
                4 -> brush = max(1, brush - 1)
                5 -> brush = 4
                6 -> brush = min(18, brush + 1)
            }
            return
        }

        val row = ((y - materialsTop) / materialH).toInt().coerceIn(0, 1)
        val col = ((x + elementScrollX) / materialW).toInt()
        val n = col * 2 + row
        if (n in list.indices) {
            selected = list[n].id
            erasing = false
        }
    }

    private fun worldPoint(px: Float, py: Float): Pair<Int, Int> {
        val x = (px / width * GW).toInt().coerceIn(0, GW - 1)
        val y = (py / simBottom * GH).toInt().coerceIn(0, GH - 1)
        return x to y
    }

    private fun paintWorld(px: Float, py: Float) {
        val (cx, cy) = worldPoint(px, py)
        val t = if (erasing) AIR else selected
        for (dy in -brush..brush) for (dx in -brush..brush) {
            if (dx * dx + dy * dy > brush * brush) continue
            val x = cx + dx
            val y = cy + dy
            if (!inside(x, y)) continue
            val i = id(x, y)
            if (t == AIR) clearCell(i) else setCell(x, y, t)
        }
    }

    private fun paintLine(x0: Float, y0: Float, x1: Float, y1: Float) {
        val screenRadius = max(3f, brush * width / GW.toFloat())
        val steps = max(1, (max(abs(x1 - x0), abs(y1 - y0)) / max(2f, screenRadius * .55f)).toInt())
        for (s in 0..steps) {
            val f = s.toFloat() / steps
            paintWorld(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f)
        }
    }

    private fun newWorld() {
        java.util.Arrays.fill(type, AIR.toByte())
        java.util.Arrays.fill(life, 0)
        java.util.Arrays.fill(volt, 0f)
        java.util.Arrays.fill(temp, 20f)
        for (x in 0 until GW) setCell(x, GH - 1, STONE)
    }

    private fun demoWorld() {
        java.util.Arrays.fill(type, AIR.toByte())
        java.util.Arrays.fill(life, 0)
        java.util.Arrays.fill(volt, 0f)
        java.util.Arrays.fill(temp, 20f)
        for (x in 0 until GW) setCell(x, GH - 1, STONE)
        for (x in 10..45) for (y in 200 until GH - 1) if (rnd.nextFloat() < .72f) setCell(x, y, SAND)
        for (x in 58..96) for (y in 208 until GH - 1) if (rnd.nextFloat() < .72f) setCell(x, y, WATER)
        for (x in 110..138) setCell(x, 214, WOOD)
        for (x in 116..132) for (y in 215 until GH - 1) if (rnd.nextFloat() < .50f) setCell(x, y, OIL)
        for (x in 145..156) for (y in 220 until GH - 1) if (rnd.nextFloat() < .65f) setCell(x, y, LAVA)
        for (x in 18..28) setCell(x, 197, SEED)
        for (x in 72..80) setCell(x, 202, LIQUID_NITROGEN)
        for (x in 32..38) setCell(x, 196, ANT)
        for (x in 104..108) setCell(x, 190, BATTERY)
        for (x in 109..130) setCell(x, 190, WIRE)
        setCell(131, 190, LAMP)
    }
}
