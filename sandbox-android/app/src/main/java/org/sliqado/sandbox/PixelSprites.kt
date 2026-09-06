package org.sliqado.sandbox

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint

object PixelSprites {
    private fun blend(a: Int, b: Int, f: Float): Int {
        val q = f.coerceIn(0f, 1f)
        fun mix(x: Int, y: Int) = (x + (y - x) * q).toInt().coerceIn(0, 255)
        return Color.rgb(
            mix(Color.red(a), Color.red(b)),
            mix(Color.green(a), Color.green(b)),
            mix(Color.blue(a), Color.blue(b))
        )
    }

    private fun light(c: Int, f: Float) = blend(c, Color.WHITE, f)
    private fun dark(c: Int, f: Float) = blend(c, Color.BLACK, f)

    fun textureColor(id: Int, x: Int, y: Int, base: Int, phase: Int = 0): Int {
        val p = phase and 255
        val n = ((x * 17 + y * 31 + id * 53 + p * 3) xor (x * y * 7 + id * 91 + p)) and 255
        return when (id) {
            1 -> when { n % 13 == 0 -> dark(base, .30f); n % 5 == 0 -> light(base, .18f); else -> base }
            2 -> when { (y + x / 4 + p / 6) % 7 == 0 -> light(base, .34f); (y + x / 3 + p / 10) % 5 == 0 -> dark(base, .10f); else -> base }
            3 -> when { (x + y * 2) % 19 == 0 -> dark(base, .42f); n % 11 == 0 -> light(base, .13f); else -> base }
            4 -> when { x % 7 == 0 -> dark(base, .32f); (x + y / 4) % 9 == 0 -> light(base, .15f); else -> base }
            5 -> when { (x + y + p / 3) % 6 == 0 -> Color.rgb(255, 239, 112); n % 3 == 0 -> Color.rgb(255, 74, 12); else -> Color.rgb(255, 145, 28) }
            6 -> when { (x - y + 64 + p / 12) % 15 == 0 -> light(base, .36f); n % 5 == 0 -> dark(base, .18f); else -> base }
            7 -> when { n % 9 == 0 -> Color.rgb(83, 49, 20); n % 5 == 0 -> Color.rgb(181, 124, 61); else -> base }
            8 -> when { n % 23 == 0 -> Color.rgb(224, 255, 106); n % 7 == 0 -> light(base, .30f); else -> base }
            9 -> when { (x + y) % 6 == 0 -> Color.WHITE; n % 9 == 0 -> dark(base, .15f); else -> base }
            10 -> when { (x + y + p / 7) % 5 == 0 -> light(base, .28f); n % 11 == 0 -> dark(base, .10f); else -> base }
            11 -> when { (x - y + 64) % 10 == 0 -> Color.WHITE; (x + y) % 12 == 0 -> light(base, .34f); else -> base }
            12 -> when { (x * 2 + y + p / 8) % 12 == 0 -> Color.rgb(78, 22, 5); n % 7 == 0 -> Color.rgb(255, 218, 58); else -> base }
            13 -> when { (x + y) % 14 == 0 -> Color.WHITE; (x - y + 48) % 10 == 0 -> light(base, .36f); else -> dark(base, .05f) }
            14 -> when { (x + y) % 12 == 0 -> Color.rgb(255, 193, 139); n % 9 == 0 -> dark(base, .24f); else -> base }
            15 -> when { y % 6 == 0 -> light(base, .38f); y % 6 == 3 -> dark(base, .18f); else -> base }
            16 -> when { x % 9 == 0 -> dark(base, .48f); y % 10 == 0 -> light(base, .30f); else -> base }
            17 -> when { (x + y) % 7 == 0 -> Color.rgb(255, 138, 61); n % 9 == 0 -> dark(base, .20f); else -> base }
            18 -> when { (x - y + 64) % 8 == 0 -> Color.rgb(218, 252, 255); n % 11 == 0 -> dark(base, .12f); else -> base }
            19 -> when { (x + y) % 7 == 0 -> Color.WHITE; n % 8 == 0 -> Color.rgb(255, 243, 151); else -> base }
            20 -> when { (x + y + p / 2) % 4 == 0 -> Color.WHITE; else -> Color.rgb(130, 231, 255) }
            21 -> when { n % 6 == 0 -> Color.BLACK; n % 11 == 0 -> light(base, .15f); else -> base }
            22 -> when { (x - y + 48) % 13 == 0 -> Color.WHITE; n % 10 == 0 -> light(base, .31f); else -> dark(base, .08f) }
            23 -> when { n % 9 == 0 -> light(base, .23f); n % 5 == 0 -> dark(base, .16f); else -> base }
            24 -> when { (x + y + p / 9) % 5 == 0 -> light(base, .16f); n % 9 == 0 -> dark(base, .11f); else -> base }
            25 -> when { (x + y + p / 12) % 10 == 0 -> light(base, .22f); else -> base }
            26 -> when { (y + x / 3 + p / 7) % 7 == 0 -> light(base, .30f); n % 19 == 0 -> Color.WHITE; else -> base }
            27 -> when { n % 7 == 0 -> dark(base, .24f); n % 11 == 0 -> light(base, .08f); else -> base }
            28 -> when { (x + y) % 5 == 0 -> Color.WHITE; n % 11 == 0 -> dark(base, .04f); else -> base }
            29 -> when { n % 9 == 0 -> Color.WHITE; (x + y + p / 8) % 7 == 0 -> Color.rgb(194, 246, 255); else -> base }
            30 -> when { (x + y) % 6 == 0 -> Color.rgb(87, 47, 22); else -> Color.rgb(15, 15, 17) }
            31 -> when { n % 6 == 0 -> Color.WHITE; n % 13 == 0 -> dark(base, .07f); else -> base }
            32 -> when { (x + y) % 10 == 0 -> light(base, .28f); n % 13 == 0 -> dark(base, .08f); else -> base }
            33 -> when { (x + y + p / 10) % 8 == 0 -> Color.rgb(255, 239, 115); else -> base }
            34 -> when { n % 9 == 0 -> Color.WHITE; n % 4 == 0 -> Color.rgb(255, 208, 92); else -> base }
            35 -> when { n % 7 == 0 -> Color.rgb(255, 221, 105); n % 11 == 0 -> light(base, .28f); else -> base }
            36 -> when { (x - y + 48 + p / 10) % 9 == 0 -> Color.WHITE; else -> base }
            37 -> when { (x + y + p / 10) % 9 == 0 -> Color.WHITE; n % 6 == 0 -> dark(base, .21f); else -> base }
            38 -> when { (y + x / 3 + p / 8) % 10 == 0 -> light(base, .29f); else -> base }
            39 -> when { n % 7 == 0 -> Color.WHITE; n % 11 == 0 -> dark(base, .13f); else -> base }
            40 -> when { n % 14 == 0 -> dark(base, .30f); n % 8 == 0 -> light(base, .14f); else -> base }
            41 -> when { n % 8 == 0 -> dark(base, .20f); n % 13 == 0 -> light(base, .10f); else -> base }
            42 -> when { (x + y) % 11 == 0 -> dark(base, .22f); n % 9 == 0 -> light(base, .07f); else -> base }
            43 -> when { n % 9 == 0 -> Color.rgb(196, 255, 79); n % 19 == 0 -> Color.WHITE; else -> base }
            44 -> when { (x + y + p / 2) % 4 == 0 -> Color.WHITE; n % 5 == 0 -> Color.rgb(120, 75, 255); else -> base }
            45 -> when { n % 6 == 0 -> light(base, .16f); n % 10 == 0 -> dark(base, .12f); else -> base }
            46 -> when { n % 12 == 0 -> light(base, .22f); n % 5 == 0 -> dark(base, .18f); else -> base }
            47 -> when { (x + y + p / 12) % 10 == 0 -> Color.rgb(255, 213, 73); n % 6 == 0 -> dark(base, .12f); else -> base }
            48 -> when { n % 10 == 0 -> dark(base, .34f); n % 7 == 0 -> light(base, .22f); else -> base }
            else -> when { n % 11 == 0 -> light(base, .18f); n % 7 == 0 -> dark(base, .15f); else -> base }
        }
    }

    private fun iconPixel(id: Int, x: Int, y: Int, base: Int): Int {
        val hi = light(base, .35f)
        val lo = dark(base, .35f)
        val white = Color.WHITE
        val clear = Color.TRANSPARENT
        val cx = x - 3
        val cy = y - 3
        val r2 = cx * cx + cy * cy
        return when (id) {
            1 -> if (y >= 3 && x in (3 - (y - 3))..(4 + (y - 3))) if ((x + y) % 3 == 0) hi else base else clear
            2 -> if (y in 2..5 && ((x + y) % 4 != 0 || y >= 4)) if ((x + y) % 5 == 0) hi else base else clear
            3 -> if (x in 1..6 && y in 1..6) if (x == 1 || y == 1) hi else if (x == 6 || y == 6) lo else base else clear
            4 -> if (x in 1..6 && y in 1..6) if (x == 2 || x == 5) lo else base else clear
            5 -> if ((y >= 1 && y <= 6) && r2 <= (if (y < 4) 6 else 10)) if (y < 3) white else if ((x + y) % 3 == 0) hi else base else clear
            6 -> if (r2 <= 8 && y >= 2) if (x <= 3) base else hi else if (y == 1 && x in 3..4) base else clear
            7 -> if ((x in 1..3 && y in 2..4) || (x in 4..6 && y in 4..6)) if ((x + y) % 2 == 0) hi else base else clear
            8 -> if ((y in 1..5 && x in (3 - y / 3)..(4 + y / 3)) || (y == 6 && x in 2..5)) if (x == 4) hi else base else clear
            9 -> if ((x in 1..2 && y in 2..3) || (x in 4..6 && y in 4..6) || (x in 3..4 && y in 1..2)) white else clear
            10 -> if ((r2 <= 7 && y in 2..5) || (x in 1..6 && y == 5)) if ((x + y) % 3 == 0) hi else base else clear
            11 -> if (x == 3 || x == 4 || y == 3 || y == 4 || x == y || x + y == 7) hi else clear
            12 -> if (y >= 2 && y <= 6 && x in 1..6) if ((x + y) % 4 == 0) Color.rgb(255, 220, 70) else if ((x * 2 + y) % 5 == 0) lo else base else clear
            13 -> if (y in 2..5 && x in 1..6) if (y == 2 || x == 1) hi else if (y == 5) lo else base else clear
            14 -> if (y in 2..5 && x in 1..6) if (x == 1 || y == 2) hi else if (x == 6 || y == 5) lo else base else clear
            15 -> if ((x == y) || (x + y == 7) || (y == 3 && x in 1..6)) hi else clear
            16 -> if (x in 1..6 && y in 2..6) if (x == 1 || y == 2) hi else if (x == 6 || y == 6) lo else base else if (y == 1 && x in 3..4) hi else clear
            17 -> if (x in 1..6 && y in 1..6) if ((x + y) % 3 == 0) hi else if ((x + y) % 4 == 0) lo else base else clear
            18 -> if (x == 3 || x == 4 || y == 3 || y == 4 || x + y == 7) hi else clear
            19 -> if (r2 <= 7 && y <= 5) if (r2 <= 2) white else base else if (y == 6 && x in 2..5) lo else clear
            20 -> if ((x == 4 && y <= 2) || (x == 3 && y in 2..4) || (x == 2 && y == 4) || (x == 4 && y in 4..6) || (x == 5 && y == 3)) white else clear
            21 -> if ((x + y) % 3 == 0 && x in 1..6 && y in 1..6) if ((x * y) % 2 == 0) hi else base else clear
            22 -> if (x in 1..6 && y in 1..6) if (x == 1 || y == 1 || x == 6 || y == 6 || x == y) hi else dark(base, .10f) else clear
            23 -> if (r2 <= 9 && y in 2..6) if ((x + y) % 3 == 0) hi else base else clear
            24 -> if ((r2 <= 8 && y in 2..5) || (x in 1..6 && y == 5)) if ((x + y) % 3 == 0) hi else base else clear
            25 -> if ((r2 <= 9 && y in 2..5) || (x in 1..6 && y == 5)) if ((x + y) % 4 == 0) hi else base else clear
            26 -> if (y in 2..5 && x in 1..6) if (y == 3) white else if ((x + y) % 4 == 0) hi else base else clear
            27 -> if (y in 3..6 && x in 1..6) if (y == 3) hi else if ((x + y) % 5 == 0) lo else base else clear
            28 -> if (x == 3 || x == 4 || y == 3 || y == 4 || x == y || x + y == 7) white else clear
            29 -> if (r2 <= 8 && y >= 2) if (x == 3 || y == 4) white else base else if (y == 1 && x in 3..4) hi else clear
            30 -> if ((y == 3 && x in 1..6) || (x in 2..5 && y in 2..4 && (x == 2 || x == 4 || x == 5))) if (x in 2..5) base else lo else clear
            31 -> if ((x in 1..2 && y in 2..3) || (x in 4..6 && y in 4..6) || (x in 3..4 && y in 1..2)) white else clear
            32 -> if (x in 2..5 && y in 2..6) if (y == 2) hi else if (x == 2 || x == 5) lo else base else if (y == 1 && x == 3) Color.rgb(255, 160, 55) else clear
            33 -> if (r2 <= 8 && y >= 2) if (x == 4) hi else base else clear
            34 -> if (y in 2..5 && x in 1..6) if (y == 2) white else if ((x + y) % 3 == 0) hi else base else clear
            35 -> if (y in 2..5 && x in 1..6) if (y == 2) Color.rgb(255, 224, 115) else if ((x + y) % 3 == 0) hi else base else clear
            36 -> if (r2 <= 9 && y >= 2) if ((x + y) % 4 == 0) white else base else clear
            37 -> if (r2 <= 8 && y >= 2) if (x <= 3) hi else base else clear
            38 -> if (x in 2..5 && y in 1..6) if (y == 1 || x == 2 || x == 5 || y == 6) hi else base else clear
            39 -> if ((r2 in 2..5) || ((x - 1) * (x - 1) + (y - 5) * (y - 5) in 1..3) || ((x - 6) * (x - 6) + (y - 4) * (y - 4) in 1..3)) white else clear
            40 -> if (x in 1..6 && y in 1..6) if (x == 1 || y == 1) hi else if (x == 6 || y == 6) lo else base else clear
            41 -> if (x in 1..6 && y in 2..6) if (x == 1 || x == 6 || y == 6) lo else if (y == 2) hi else base else clear
            42 -> if (x in 1..6 && y in 2..5) if (y == 2) hi else if ((x + y) % 4 == 0) lo else base else clear
            43 -> if (r2 <= 9 && y in 1..6) if ((x == 3 || x == 4 || y == 3 || y == 4)) Color.rgb(212, 255, 92) else base else clear
            44 -> if (x == 3 || x == 4 || y == 3 || y == 4 || x == y || x + y == 7) if ((x + y) % 2 == 0) white else base else clear
            45 -> if ((x + y) % 3 == 0 && x in 1..6 && y in 2..6) if ((x * y) % 2 == 0) hi else base else clear
            46 -> if (r2 <= 9 && y in 2..6) if ((x + y) % 4 == 0) hi else base else clear
            47 -> if (r2 <= 8 && y >= 2) if (x >= 4) hi else base else if (y == 1 && x in 3..4) base else clear
            48 -> if (x in 1..6 && y in 1..6) if ((x == 2 && y == 2) || (x == 5 && y == 3) || (x == 3 && y == 5)) lo else if (x == 1 || y == 1) hi else base else clear
            else -> if (x in 1..6 && y in 1..6) textureColor(id, x, y, base) else clear
        }
    }

    fun drawIcon(canvas: Canvas, id: Int, left: Float, top: Float, size: Float, base: Int, paint: Paint) {
        val cell = size / 8f
        for (y in 0 until 8) {
            for (x in 0 until 8) {
                val color = iconPixel(id, x, y, base)
                if (Color.alpha(color) == 0) continue
                paint.style = Paint.Style.FILL
                paint.color = color
                val l = left + x * cell
                val t = top + y * cell
                canvas.drawRect(l, t, l + cell + .6f, t + cell + .6f, paint)
            }
        }
    }
}
