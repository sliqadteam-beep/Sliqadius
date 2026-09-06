package org.sliqado.sandbox

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint

object PixelSprites {
    private fun blend(a:Int,b:Int,f:Float):Int{
        val q=f.coerceIn(0f,1f)
        fun m(x:Int,y:Int)= (x+(y-x)*q).toInt().coerceIn(0,255)
        return Color.rgb(m(Color.red(a),Color.red(b)),m(Color.green(a),Color.green(b)),m(Color.blue(a),Color.blue(b)))
    }
    private fun light(c:Int,f:Float)=blend(c,Color.WHITE,f)
    private fun dark(c:Int,f:Float)=blend(c,Color.BLACK,f)

    fun textureColor(id:Int,x:Int,y:Int,base:Int):Int{
        val n=((x*17+y*31+id*53) xor (x*y*7+id*91)) and 255
        return when(id){
            1 -> when { n%11==0->dark(base,.25f); n%5==0->light(base,.18f); else->base }
            2 -> when { (y+x/4)%7==0->light(base,.30f); (y+x/3)%5==0->dark(base,.08f); else->base }
            3 -> when { (x+y*2)%17==0->dark(base,.38f); n%9==0->light(base,.14f); else->base }
            4 -> when { x%6==0->dark(base,.30f); (x+y/5)%7==0->light(base,.13f); else->base }
            5 -> when { (x+y)%5==0->Color.rgb(255,225,80); n%3==0->Color.rgb(255,90,15); else->Color.rgb(255,145,25) }
            6 -> when { (x-y+40)%13==0->light(base,.35f); n%4==0->dark(base,.15f); else->base }
            7 -> when { n%7==0->Color.rgb(90,55,25); n%4==0->Color.rgb(180,125,65); else->base }
            8 -> when { n%19==0->Color.rgb(220,255,100); n%7==0->light(base,.28f); else->base }
            9 -> when { (x+y)%5==0->Color.WHITE; n%7==0->dark(base,.14f); else->base }
            10 -> if(n%4==0) light(base,.25f) else if(n%9==0) dark(base,.10f) else base
            11 -> when { (x-y+64)%9==0->Color.WHITE; (x+y)%11==0->light(base,.30f); else->base }
            12 -> when { (x*2+y)%11==0->Color.rgb(80,25,5); n%6==0->Color.rgb(255,210,45); else->base }
            13 -> when { (x+y)%13==0->Color.WHITE; (x-y+40)%9==0->light(base,.35f); else->dark(base,.05f) }
            14 -> when { (x+y)%11==0->Color.rgb(255,190,135); n%8==0->dark(base,.22f); else->base }
            15 -> if(y%5==0) light(base,.35f) else dark(base,.07f)
            16 -> when { x%8==0->dark(base,.45f); y%9==0->light(base,.28f); else->base }
            17 -> if((x+y)%6==0) Color.rgb(255,130,55) else dark(base,.08f)
            18 -> if((x-y+50)%7==0) Color.rgb(210,250,255) else base
            19 -> if((x+y)%6==0) Color.WHITE else Color.rgb(255,235,110)
            20 -> if((x+y)%3==0) Color.WHITE else Color.rgb(140,235,255)
            21 -> if(n%5==0) Color.BLACK else light(base,.10f)
            22 -> when { (x-y+40)%12==0->Color.WHITE; n%9==0->light(base,.30f); else->dark(base,.08f) }
            23 -> if(n%8==0) light(base,.22f) else dark(base,.10f)
            24 -> if(n%4==0) light(base,.15f) else dark(base,.08f)
            25 -> if(n%9==0) light(base,.20f) else base
            26 -> when { (y+x/3)%7==0->light(base,.28f); n%17==0->Color.WHITE; else->base }
            27 -> if(n%6==0) dark(base,.20f) else light(base,.04f)
            28 -> if((x+y)%4==0) Color.WHITE else dark(base,.03f)
            29 -> when { n%8==0->Color.WHITE; (x+y)%6==0->Color.rgb(190,245,255); else->base }
            30 -> if((x+y)%5==0) Color.rgb(75,40,20) else Color.rgb(15,15,15)
            31 -> if(n%5==0) Color.WHITE else dark(base,.05f)
            32 -> if((x+y)%9==0) light(base,.25f) else base
            33 -> if((x+y)%7==0) Color.rgb(255,235,100) else base
            34 -> when { n%8==0->Color.WHITE; n%4==0->Color.rgb(255,210,90); else->base }
            35 -> if(n%6==0) Color.rgb(255,220,90) else base
            36 -> if((x-y+40)%8==0) Color.WHITE else base
            37 -> when { (x+y)%8==0->Color.WHITE; n%5==0->dark(base,.20f); else->base }
            38 -> if((y+x/3)%9==0) light(base,.28f) else base
            39 -> when { n%6==0->Color.WHITE; n%9==0->dark(base,.12f); else->base }
            40 -> when { n%13==0->dark(base,.28f); n%7==0->light(base,.13f); else->base }
            41 -> if(n%7==0) dark(base,.18f) else base
            42 -> if((x+y)%10==0) dark(base,.20f) else light(base,.05f)
            43 -> when { n%8==0->Color.rgb(190,255,70); n%17==0->Color.WHITE; else->base }
            44 -> when { n%3==0->Color.WHITE; n%5==0->Color.rgb(130,80,255); else->base }
            45 -> if(n%5==0) light(base,.15f) else dark(base,.10f)
            46 -> if(n%11==0) light(base,.20f) else dark(base,.15f)
            47 -> when { (x+y)%9==0->Color.rgb(255,210,70); n%5==0->dark(base,.10f); else->base }
            48 -> when { n%9==0->dark(base,.30f); n%6==0->light(base,.20f); else->base }
            else -> if(n%11==0) light(base,.18f) else if(n%7==0) dark(base,.15f) else base
        }
    }

    fun drawIcon(canvas:Canvas,id:Int,left:Float,top:Float,size:Float,base:Int,paint:Paint){
        val cell=size/8f
        for(y in 0 until 8) for(x in 0 until 8){
            paint.style=Paint.Style.FILL
            paint.color=textureColor(id,x,y,base)
            val l=left+x*cell; val t=top+y*cell
            canvas.drawRect(l,t,l+cell+.5f,t+cell+.5f,paint)
        }
    }
}
