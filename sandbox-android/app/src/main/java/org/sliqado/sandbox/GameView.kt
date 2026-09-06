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
        const val AIR=0; const val SAND=1; const val WATER=2; const val STONE=3; const val WOOD=4
        const val FIRE=5; const val OIL=6; const val SEED=7; const val ACID=8; const val SALT=9
        const val STEAM=10; const val ICE=11; const val LAVA=12; const val METAL=13; const val COPPER=14
        const val WIRE=15; const val BATTERY=16; const val HEATER=17; const val COOLER=18; const val LAMP=19
        const val SPARK=20; const val GUNPOWDER=21; const val GLASS=22; const val COAL=23; const val SMOKE=24
        const val GAS=25; const val SALTWATER=26; const val MUD=27; const val SNOW=28
        const val LIQUID_NITROGEN=29; const val ANT=30; const val SUGAR=31; const val WAX=32
        const val MOLTEN_WAX=33; const val MOLTEN_METAL=34; const val MOLTEN_COPPER=35
        const val MOLTEN_GLASS=36; const val MERCURY=37; const val ALCOHOL=38; const val FOAM=39
        const val CONCRETE=40; const val CEMENT=41; const val CLAY=42; const val URANIUM=43
        const val PLASMA=44; const val ASH=45; const val CHARCOAL=46; const val HONEY=47
        const val SPONGE=48
    }

    private enum class MotionKind { STATIC, POWDER, LIQUID, GAS, ANT }
    private enum class ViewMode { MATERIAL, HEAT, ELECTRIC }

    private data class Def(
        val id:Int, val name:String, val short:String, val color:Int, val motion:MotionKind,
        val conductive:Boolean=false, val resistance:Float=6f, val hot:Boolean=false,
        val cold:Boolean=false, val flammable:Boolean=false, val category:Int=0
    )

    private val defs = arrayOfNulls<Def>(49)
    private val list = ArrayList<Def>(48)
    private fun add(d:Def){ defs[d.id]=d; list.add(d) }

    private val GW=160
    private val GH=240
    private val N=GW*GH
    private val type=ByteArray(N)
    private val life=ShortArray(N)
    private val temp=FloatArray(N){20f}
    private val volt=FloatArray(N)
    private val moved=IntArray(N)
    private val heatNext=FloatArray(N)
    private val pixels=IntArray(N)
    private val queue=IntArray(N)
    private val bitmap=Bitmap.createBitmap(GW,GH,Bitmap.Config.ARGB_8888)
    private val src=Rect(0,0,GW,GH)
    private val dst=RectF()

    private val p=Paint(Paint.ANTI_ALIAS_FLAG)
    private val text=Paint(Paint.ANTI_ALIAS_FLAG).apply{color=Color.BLACK;textAlign=Paint.Align.CENTER;typeface=android.graphics.Typeface.DEFAULT_BOLD}
    private val thin=Paint(Paint.ANTI_ALIAS_FLAG).apply{style=Paint.Style.STROKE;strokeWidth=2f;color=Color.rgb(38,38,38)}
    private val rnd=Random(System.nanoTime())

    private var selected=SAND
    private var brush=4
    private var paused=false
    private var viewMode=ViewMode.MATERIAL
    private var tick=1
    private var frame=0
    private var simBottom=0f
    private var controlsH=0f
    private var tileW=0f
    private var tileH=0f
    private var elementScroll=0f
    private var touchInWorld=false
    private var touchInPanel=false
    private var lastX=-1f
    private var lastY=-1f
    private var panelLastY=0f
    private var erasing=false

    private val loop=object:Runnable{override fun run(){if(!paused&&frame%2==0)step();frame++;invalidate();postOnAnimation(this)}}

    init {
        isFocusable=true
        keepScreenOn=true
        buildDefinitions()
        demoWorld()
        postOnAnimation(loop)
    }

    private fun buildDefinitions(){
        fun d(id:Int,n:String,s:String,c:Int,m:MotionKind,cond:Boolean=false,r:Float=6f,hot:Boolean=false,cold:Boolean=false,flamm:Boolean=false,cat:Int=0)=add(Def(id,n,s,c,m,cond,r,hot,cold,flamm,cat))
        d(SAND,"Sand","Sa",0xffd9b85d.toInt(),MotionKind.POWDER)
        d(WATER,"Water","Wa",0xff3b8eea.toInt(),MotionKind.LIQUID)
        d(STONE,"Stone","St",0xff858987.toInt(),MotionKind.STATIC)
        d(WOOD,"Wood","Wo",0xffa2673d.toInt(),MotionKind.STATIC,flamm=true)
        d(FIRE,"Fire","Fi",0xffff6b18.toInt(),MotionKind.GAS,hot=true,cat=1)
        d(OIL,"Oil","Oi",0xff67512f.toInt(),MotionKind.LIQUID,flamm=true,cat=2)
        d(SEED,"Seeds","Se",0xff8c6b2f.toInt(),MotionKind.POWDER,flamm=true,cat=3)
        d(ACID,"Acid","Ac",0xff9dde39.toInt(),MotionKind.LIQUID,cat=2)
        d(SALT,"Salt","Sl",0xffeee9dc.toInt(),MotionKind.POWDER)
        d(STEAM,"Steam","Vm",0xffb6c5ca.toInt(),MotionKind.GAS,hot=true,cat=1)
        d(ICE,"Ice","Ic",0xff9edcf1.toInt(),MotionKind.STATIC,cold=true,cat=1)
        d(LAVA,"Lava","Lv",0xffef3d14.toInt(),MotionKind.LIQUID,hot=true,cat=1)
        d(METAL,"Metal","Me",0xff9aa4a9.toInt(),MotionKind.STATIC,true,5f,cat=4)
        d(COPPER,"Copper","Cu",0xffc8793e.toInt(),MotionKind.STATIC,true,2f,cat=4)
        d(WIRE,"Wire","Wi",0xffd7a63e.toInt(),MotionKind.STATIC,true,2f,cat=4)
        d(BATTERY,"Battery","Ba",0xff75c75d.toInt(),MotionKind.STATIC,true,1f,cat=4)
        d(HEATER,"Heater","Ht",0xffdd6b43.toInt(),MotionKind.STATIC,true,3f,hot=true,cat=4)
        d(COOLER,"Cooler","Cl",0xff59b9e5.toInt(),MotionKind.STATIC,true,3f,cold=true,cat=4)
        d(LAMP,"Lamp","La",0xffffe76a.toInt(),MotionKind.STATIC,true,4f,cat=4)
        d(SPARK,"Spark","Sp",0xff9de9ff.toInt(),MotionKind.GAS,true,1f,hot=true,cat=4)
        d(GUNPOWDER,"Gunpowder","Gp",0xff4c4943.toInt(),MotionKind.POWDER,flamm=true,cat=2)
        d(GLASS,"Glass","Gl",0xff9bc3cc.toInt(),MotionKind.STATIC)
        d(COAL,"Coal","Co",0xff323638.toInt(),MotionKind.POWDER,flamm=true)
        d(SMOKE,"Smoke","Sm",0xff5c6467.toInt(),MotionKind.GAS)
        d(GAS,"Gas","Ga",0xffb49d69.toInt(),MotionKind.GAS,flamm=true,cat=2)
        d(SALTWATER,"Salt Water","SW",0xff4da2c9.toInt(),MotionKind.LIQUID,true,6f,cat=2)
        d(MUD,"Mud","Mu",0xff75543b.toInt(),MotionKind.POWDER)
        d(SNOW,"Snow","Sn",0xffe0f5fb.toInt(),MotionKind.POWDER,cold=true,cat=1)
        d(LIQUID_NITROGEN,"Liquid N2","N2",0xffaeeeff.toInt(),MotionKind.LIQUID,cold=true,cat=5)
        d(ANT,"Ants","An",0xff171717.toInt(),MotionKind.ANT,cat=5)
        d(SUGAR,"Sugar","Su",0xfffff1cf.toInt(),MotionKind.POWDER,flamm=true,cat=5)
        d(WAX,"Wax","Wx",0xffffe1a3.toInt(),MotionKind.STATIC,flamm=true,cat=5)
        d(MOLTEN_WAX,"Molten Wax","MW",0xffffb34f.toInt(),MotionKind.LIQUID,hot=true,flamm=true,cat=5)
        d(MOLTEN_METAL,"Molten Metal","MM",0xffff8b48.toInt(),MotionKind.LIQUID,true,4f,hot=true,cat=5)
        d(MOLTEN_COPPER,"Molten Copper","MC",0xffff7138.toInt(),MotionKind.LIQUID,true,2f,hot=true,cat=5)
        d(MOLTEN_GLASS,"Molten Glass","MG",0xffffc97e.toInt(),MotionKind.LIQUID,hot=true,cat=5)
        d(MERCURY,"Mercury","Hg",0xffb9c3c8.toInt(),MotionKind.LIQUID,true,3f,cat=5)
        d(ALCOHOL,"Alcohol","Al",0xffcddff4.toInt(),MotionKind.LIQUID,flamm=true,cat=5)
        d(FOAM,"Foam","Fo",0xfff1f4ef.toInt(),MotionKind.POWDER,cat=5)
        d(CONCRETE,"Concrete","Cr",0xff9b9a91.toInt(),MotionKind.STATIC,cat=5)
        d(CEMENT,"Cement","Ce",0xffbeb9ae.toInt(),MotionKind.POWDER,cat=5)
        d(CLAY,"Clay","Cy",0xffa76d52.toInt(),MotionKind.POWDER,cat=5)
        d(URANIUM,"Uranium","Ur",0xff83bf4b.toInt(),MotionKind.POWDER,true,8f,hot=true,cat=5)
        d(PLASMA,"Plasma","Pl",0xffff65ef.toInt(),MotionKind.GAS,true,1f,hot=true,cat=5)
        d(ASH,"Ash","As",0xff77736c.toInt(),MotionKind.POWDER,cat=5)
        d(CHARCOAL,"Charcoal","Ch",0xff272727.toInt(),MotionKind.POWDER,flamm=true,cat=5)
        d(HONEY,"Honey","Ho",0xffd79118.toInt(),MotionKind.LIQUID,flamm=true,cat=5)
        d(SPONGE,"Sponge","Sg",0xffffdb55.toInt(),MotionKind.STATIC,flamm=true,cat=5)
    }

    private fun id(x:Int,y:Int)=x+y*GW
    private fun inside(x:Int,y:Int)=x>=0&&x<GW&&y>=0&&y<GH
    private fun tAt(x:Int,y:Int):Int = if(inside(x,y)) type[id(x,y)].toInt() and 255 else STONE
    private fun defaultTemp(t:Int)=when(t){LAVA->1250f;FIRE->820f;PLASMA->2200f;SPARK->550f;MOLTEN_METAL->1550f;MOLTEN_COPPER->1180f;MOLTEN_GLASS->1500f;MOLTEN_WAX->85f;ICE->-12f;SNOW->-8f;LIQUID_NITROGEN->-196f;COOLER->-20f;else->20f}
    private fun setCell(x:Int,y:Int,t:Int,l:Int=0,temperature:Float?=null){if(!inside(x,y))return;val i=id(x,y);type[i]=t.toByte();life[i]=l.toShort();temp[i]=temperature?:defaultTemp(t);volt[i]=0f;moved[i]=tick}
    private fun clearCell(i:Int){type[i]=0;life[i]=0;temp[i]=20f;volt[i]=0f;moved[i]=tick}
    private fun swap(a:Int,b:Int){val tt=type[a];type[a]=type[b];type[b]=tt;val ll=life[a];life[a]=life[b];life[b]=ll;val tp=temp[a];temp[a]=temp[b];temp[b]=tp;val vv=volt[a];volt[a]=volt[b];volt[b]=vv;moved[a]=tick;moved[b]=tick}
    private fun neighbor(x:Int,y:Int,target:Int):Int{for(dy in -1..1)for(dx in -1..1){if(dx==0&&dy==0)continue;val nx=x+dx;val ny=y+dy;if(inside(nx,ny)){val i=id(nx,ny);if((type[i].toInt() and 255)==target)return i}};return -1}
    private fun hasNeighbor(x:Int,y:Int,vararg ts:Int):Boolean{for(dy in -1..1)for(dx in -1..1){if(dx==0&&dy==0)continue;val nx=x+dx;val ny=y+dy;if(!inside(nx,ny))continue;val q=type[id(nx,ny)].toInt() and 255;for(t in ts)if(q==t)return true};return false}
    private fun isFluid(t:Int)=t==WATER||t==OIL||t==ACID||t==SALTWATER||t==LAVA||t==LIQUID_NITROGEN||t==MOLTEN_WAX||t==MOLTEN_METAL||t==MOLTEN_COPPER||t==MOLTEN_GLASS||t==MERCURY||t==ALCOHOL||t==HONEY
    private fun canPowderEnter(t:Int)=t==AIR||isFluid(t)
    private fun powder(x:Int,y:Int,slow:Int=1){if(slow>1&&tick%slow!=0)return;val i=id(x,y);val b=tAt(x,y+1);if(canPowderEnter(b)){swap(i,id(x,y+1));return};val s=if(rnd.nextBoolean())1 else -1;for(dx in intArrayOf(s,-s)){val nx=x+dx;if(inside(nx,y+1)&&canPowderEnter(tAt(nx,y+1))){swap(i,id(nx,y+1));return}}}
    private fun liquid(x:Int,y:Int,spread:Int=4,viscosity:Int=1){if(viscosity>1&&tick%viscosity!=0)return;val i=id(x,y);if(y+1<GH&&tAt(x,y+1)==AIR){swap(i,id(x,y+1));return};val s=if(rnd.nextBoolean())1 else -1;for(d in 1..spread)for(sign in intArrayOf(s,-s)){val nx=x+sign*d;if(!inside(nx,y))continue;val q=tAt(nx,y);if(q==AIR){swap(i,id(nx,y));return};if(q!=(type[i].toInt() and 255))break}}
    private fun gas(x:Int,y:Int,spread:Int=2){val i=id(x,y);if(y>0&&tAt(x,y-1)==AIR){swap(i,id(x,y-1));return};val s=if(rnd.nextBoolean())1 else -1;for(d in 1..spread){val nx=x+s*d;if(inside(nx,y-1)&&tAt(nx,y-1)==AIR){swap(i,id(nx,y-1));return};if(inside(nx,y)&&tAt(nx,y)==AIR){swap(i,id(nx,y));return}}}
    private fun igniteAround(x:Int,y:Int,heat:Float){for(dy in -1..1)for(dx in -1..1){if(dx==0&&dy==0)continue;val nx=x+dx;val ny=y+dy;if(!inside(nx,ny))continue;val i=id(nx,ny);val q=type[i].toInt() and 255;val d=defs[q];if(d?.flammable==true&&rnd.nextFloat()<(if(q==GAS||q==GUNPOWDER)0.28f else 0.045f)){type[i]=FIRE.toByte();life[i]=0;temp[i]=max(temp[i],heat)}}}
    private fun updateAnt(x:Int,y:Int){val i=id(x,y);if(temp[i]>80f||hasNeighbor(x,y,FIRE,LAVA,PLASMA,ACID)){clearCell(i);return};if(hasNeighbor(x,y,WATER,SALTWATER,LIQUID_NITROGEN)&&rnd.nextFloat()<0.08f){clearCell(i);return};var tx=0;var ty=0;var found=false;loop@for(r in 1..5)for(dy in -r..r)for(dx in -r..r){val nx=x+dx;val ny=y+dy;if(inside(nx,ny)&&tAt(nx,ny)==SEED){tx=dx.sign();ty=dy.sign();found=true;break@loop}};if(found&&abs(tx)<=1&&abs(ty)<=1){val ni=id(x+tx,y+ty);if((type[ni].toInt() and 255)==SEED){clearCell(ni);life[i]=(life[i]+15).toShort();return}};val choices=if(found)arrayOf(intArrayOf(tx,ty),intArrayOf(tx,0),intArrayOf(0,ty))else arrayOf(intArrayOf(if(rnd.nextBoolean())1 else -1,0),intArrayOf(0,if(rnd.nextBoolean())1 else -1),intArrayOf(if(rnd.nextBoolean())1 else -1,if(rnd.nextBoolean())1 else -1));for(c in choices){val nx=x+c[0];val ny=y+c[1];if(!inside(nx,ny)||tAt(nx,ny)!=AIR)continue;val support=tAt(nx,ny+1)!=AIR||tAt(nx-1,ny)!=AIR||tAt(nx+1,ny)!=AIR;if(support){swap(i,id(nx,ny));return}}}
    private fun Int.sign()=when{this<0->-1;this>0->1;else->0}
    private fun phaseChanges(i:Int,t:Int){val tt=temp[i];when(t){WATER,SALTWATER->if(tt<0f){type[i]=ICE.toByte();life[i]=0}else if(tt>104f){type[i]=STEAM.toByte();life[i]=0};ICE,SNOW->if(tt>1f){type[i]=WATER.toByte();life[i]=0};STEAM->if(tt<88f){type[i]=WATER.toByte();life[i]=0};WAX->if(tt>62f){type[i]=MOLTEN_WAX.toByte();life[i]=0};MOLTEN_WAX->if(tt<54f){type[i]=WAX.toByte();life[i]=0};METAL->if(tt>1450f){type[i]=MOLTEN_METAL.toByte();life[i]=0};MOLTEN_METAL->if(tt<1330f){type[i]=METAL.toByte();life[i]=0};COPPER,WIRE->if(tt>1085f){type[i]=MOLTEN_COPPER.toByte();life[i]=0};MOLTEN_COPPER->if(tt<980f){type[i]=COPPER.toByte();life[i]=0};GLASS->if(tt>1400f){type[i]=MOLTEN_GLASS.toByte();life[i]=0};MOLTEN_GLASS->if(tt<850f){type[i]=GLASS.toByte();life[i]=0};STONE->if(tt>1350f){type[i]=LAVA.toByte();life[i]=0};LAVA->if(tt<680f){type[i]=STONE.toByte();life[i]=0};SUGAR->if(tt>185f){type[i]=HONEY.toByte();life[i]=0};ALCOHOL->if(tt>78f){type[i]=GAS.toByte();life[i]=0};MERCURY->if(tt>357f){type[i]=GAS.toByte();life[i]=0};CLAY->if(tt>1050f){type[i]=STONE.toByte();life[i]=0}}}
    private fun updateCell(x:Int,y:Int){val i=id(x,y);if(moved[i]==tick)return;val t=type[i].toInt() and 255;if(t==AIR)return;phaseChanges(i,t);val now=type[i].toInt() and 255;if(now!=t)return;when(t){SAND,SALT,SUGAR,CEMENT,CLAY,ASH,CHARCOAL->powder(x,y);MUD->powder(x,y,2);SNOW->powder(x,y);COAL,GUNPOWDER->powder(x,y);URANIUM->{powder(x,y);temp[i]+=0.2f};WATER,SALTWATER,ACID,ALCOHOL,MERCURY->liquid(x,y,5);OIL->liquid(x,y,6);HONEY->liquid(x,y,3,3);MOLTEN_WAX->liquid(x,y,3,2);LAVA,MOLTEN_METAL,MOLTEN_COPPER,MOLTEN_GLASS->liquid(x,y,2,2);LIQUID_NITROGEN->{val age=(life[i].toInt() and 0xffff)+1;life[i]=age.toShort();for(dy in -1..1)for(dx in -1..1){val nx=x+dx;val ny=y+dy;if(inside(nx,ny))temp[id(nx,ny)]-=3.5f};val warm=max(0f,temp[i]+196f);val limit=max(22f,95f-warm*.18f);if(age>limit||rnd.nextFloat()<(warm/9000f)){clearCell(i);return};liquid(x,y,5)};STEAM,SMOKE,GAS->{life[i]=(life[i]+1).toShort();gas(x,y,3);if((life[i].toInt() and 0xffff)>360&&t!=GAS)clearCell(i)};FIRE->{life[i]=(life[i]+1).toShort();temp[i]=max(temp[i],820f);igniteAround(x,y,760f);if(hasNeighbor(x,y,WATER,SALTWATER,LIQUID_NITROGEN)&&rnd.nextFloat()<0.22f){clearCell(i);return};if((life[i].toInt() and 0xffff)>80+rnd.nextInt(100)){type[i]=if(rnd.nextFloat()<0.45f)SMOKE.toByte()else ASH.toByte();life[i]=0;return};gas(x,y,2)};SPARK->{life[i]=(life[i]+1).toShort();temp[i]=550f;igniteAround(x,y,620f);if((life[i].toInt() and 0xffff)>18)clearCell(i)else gas(x,y,1)};PLASMA->{life[i]=(life[i]+1).toShort();temp[i]=2200f;igniteAround(x,y,1600f);for(dy in -1..1)for(dx in -1..1)if(inside(x+dx,y+dy))temp[id(x+dx,y+dy)]+=30f;if((life[i].toInt() and 0xffff)>70)type[i]=FIRE.toByte()else gas(x,y,2)};SEED->{powder(x,y);val j=id(x,y);if((type[j].toInt() and 255)!=SEED)return;if(temp[j] in 4f..46f&&hasNeighbor(x,y,WATER,SALTWATER)&&(tAt(x,y+1)==MUD||tAt(x,y+1)==SAND||tAt(x,y+1)==CLAY)){val a=(life[j].toInt() and 0xffff)+1;life[j]=a.toShort();if(a>45&&rnd.nextFloat()<0.018f){val ny=y-1;if(inside(x,ny)&&tAt(x,ny)==AIR)setCell(x,ny,SEED,min(180,a+25),temp[j])}}};ANT->updateAnt(x,y);SPONGE->{if(hasNeighbor(x,y,WATER,SALTWATER)&&life[i]<200)life[i]=(life[i]+1).toShort();if(temp[i]>110f&&life[i]>0)life[i]=(life[i]-1).toShort()}}
        if(t==GUNPOWDER&&(temp[i]>190f||hasNeighbor(x,y,FIRE,SPARK,PLASMA))){for(dy in -3..3)for(dx in -3..3){val nx=x+dx;val ny=y+dy;if(!inside(nx,ny))continue;val j=id(nx,ny);temp[j]+=250f;if((type[j].toInt() and 255)==GUNPOWDER||rnd.nextFloat()<0.15f)type[j]=FIRE.toByte()}}
        if(t==ACID){for(dy in -1..1)for(dx in -1..1){if(dx==0&&dy==0)continue;val nx=x+dx;val ny=y+dy;if(!inside(nx,ny))continue;val j=id(nx,ny);val q=type[j].toInt() and 255;if(q!=AIR&&q!=ACID&&q!=GLASS&&q!=MOLTEN_GLASS&&rnd.nextFloat()<0.018f){clearCell(j);if(rnd.nextFloat()<0.12f)clearCell(i);return}}}
        if(t==SALT){val w=neighbor(x,y,WATER);if(w>=0&&rnd.nextFloat()<0.12f){type[w]=SALTWATER.toByte();clearCell(i)}};if(t==WATER){val s=neighbor(x,y,SAND);if(s>=0&&rnd.nextFloat()<0.0012f)type[s]=MUD.toByte()};if(t==CEMENT){val w=neighbor(x,y,WATER);if(w>=0&&rnd.nextFloat()<0.04f){type[i]=CONCRETE.toByte();temp[i]=temp[w]}};if(t==WOOD||t==CHARCOAL||t==COAL||t==OIL||t==ALCOHOL||t==HONEY||t==WAX){if((temp[i]>320f||hasNeighbor(x,y,FIRE,SPARK,PLASMA))&&rnd.nextFloat()<0.035f){type[i]=FIRE.toByte();life[i]=0}}}
    private fun conductive(t:Int)=defs.getOrNull(t)?.conductive==true||t==SALTWATER||t==MERCURY||t==PLASMA
    private fun computeElectricity(){java.util.Arrays.fill(volt,0f);var head=0;var tail=0;for(i in 0 until N){val t=type[i].toInt() and 255;if(t==BATTERY){volt[i]=100f;queue[tail++]=i}else if(t==SPARK||t==PLASMA){volt[i]=75f;queue[tail++]=i}};while(head<tail){val i=queue[head++];val vv=volt[i];if(vv<2f)continue;val x=i%GW;val y=i/GW;fun push(j:Int){val q=type[j].toInt() and 255;if(!conductive(q))return;val nv=vv-(defs[q]?.resistance?:6f);if(nv>volt[j]+0.5f){volt[j]=nv;if(tail<N)queue[tail++]=j}};if(x>0)push(i-1);if(x<GW-1)push(i+1);if(y>0)push(i-GW);if(y<GH-1)push(i+GW)};for(i in 0 until N){when(type[i].toInt() and 255){HEATER->if(volt[i]>8f)temp[i]+=18f;COOLER->if(volt[i]>8f)temp[i]-=16f;LAMP->if(volt[i]>8f)temp[i]+=0.8f}}}
    private fun updateHeat(){for(i in 0 until N)heatNext[i]=temp[i];for(y in 1 until GH-1)for(x in 1 until GW-1){val i=id(x,y);val t=type[i].toInt() and 255;val target=when(t){LAVA->1250f;FIRE->820f;PLASMA->2200f;MOLTEN_METAL->1550f;MOLTEN_COPPER->1180f;MOLTEN_GLASS->1500f;LIQUID_NITROGEN->-196f;ICE->-12f;SNOW->-8f;else->20f};val source=when(t){LAVA,FIRE,PLASMA,MOLTEN_METAL,MOLTEN_COPPER,MOLTEN_GLASS,LIQUID_NITROGEN->0.08f;ICE,SNOW->0.02f;AIR->0.004f;else->0f};if(source>0)heatNext[i]+=(target-temp[i])*source;val k=when(t){COPPER,MOLTEN_COPPER->0.16f;METAL,MOLTEN_METAL,WIRE->0.12f;WATER,SALTWATER,MERCURY->0.08f;STONE,CONCRETE,GLASS->0.05f;else->0.025f};val avg=(temp[i-1]+temp[i+1]+temp[i-GW]+temp[i+GW])*.25f;heatNext[i]+=(avg-temp[i])*k};for(i in 0 until N)temp[i]=heatNext[i].coerceIn(-210f,2600f)}
    private fun step(){tick++;if(tick==Int.MAX_VALUE){java.util.Arrays.fill(moved,0);tick=1};if(tick%3==0)computeElectricity();if(tick%4==0)updateHeat();for(y in GH-2 downTo 0){if(rnd.nextBoolean())for(x in 0 until GW){val t=type[id(x,y)].toInt() and 255;if(t!=FIRE&&t!=STEAM&&t!=SMOKE&&t!=GAS&&t!=PLASMA&&t!=SPARK)updateCell(x,y)}else for(x in GW-1 downTo 0){val t=type[id(x,y)].toInt() and 255;if(t!=FIRE&&t!=STEAM&&t!=SMOKE&&t!=GAS&&t!=PLASMA&&t!=SPARK)updateCell(x,y)}};for(y in 1 until GH){if(rnd.nextBoolean())for(x in 0 until GW){val t=type[id(x,y)].toInt() and 255;if(t==FIRE||t==STEAM||t==SMOKE||t==GAS||t==PLASMA||t==SPARK)updateCell(x,y)}else for(x in GW-1 downTo 0){val t=type[id(x,y)].toInt() and 255;if(t==FIRE||t==STEAM||t==SMOKE||t==GAS||t==PLASMA||t==SPARK)updateCell(x,y)}}}
    private fun blend(a:Int,b:Int,f:Float):Int{val q=f.coerceIn(0f,1f);val r=(Color.red(a)+(Color.red(b)-Color.red(a))*q).roundToInt();val gg=(Color.green(a)+(Color.green(b)-Color.green(a))*q).roundToInt();val bl=(Color.blue(a)+(Color.blue(b)-Color.blue(a))*q).roundToInt();return Color.rgb(r,gg,bl)}
    private fun heatColor(v:Float):Int=when{v<-100f->Color.rgb(80,90,255);v<0f->blend(Color.rgb(80,90,255),Color.rgb(80,220,255),(v+100f)/100f);v<100f->blend(Color.rgb(80,220,255),Color.rgb(255,220,70),v/100f);v<700f->blend(Color.rgb(255,220,70),Color.rgb(255,70,20),(v-100f)/600f);else->blend(Color.rgb(255,70,20),Color.WHITE,(v-700f)/1200f)}
    private fun materialColor(i:Int,t:Int):Int{if(t==AIR)return 0xff000018.toInt();var c=defs[t]?.color?:Color.MAGENTA;if(t==SEED&&(life[i].toInt() and 0xffff)>45)c=0xff59b95f.toInt();if(t==LAMP&&volt[i]>8f)c=0xfffff6aa.toInt();val tt=temp[i];if(tt>80f)c=blend(c,if(tt>900f)Color.WHITE else 0xffff5a22.toInt(),min(1f,(tt-80f)/900f))else if(tt<0f)c=blend(c,0xff62c8ff.toInt(),min(.75f,-tt/200f));return c}
    private fun renderBitmap(){for(i in 0 until N){val t=type[i].toInt() and 255;pixels[i]=when(viewMode){ViewMode.MATERIAL->materialColor(i,t);ViewMode.HEAT->if(t==AIR)0xff05051a.toInt()else heatColor(temp[i]);ViewMode.ELECTRIC->if(t==AIR)0xff030315.toInt()else if(volt[i]>1f)blend(0xff423300.toInt(),0xffffff68.toInt(),min(1f,volt[i]/100f))else blend(materialColor(i,t),0xff0b1020.toInt(),.72f)}};bitmap.setPixels(pixels,0,GW,0,0,GW,GH)}
    override fun onDraw(c:Canvas){super.onDraw(c);c.drawColor(0xff000018.toInt());simBottom=height*0.68f;controlsH=(height-simBottom)/4f;tileW=width/6f;tileH=controlsH;renderBitmap();dst.set(0f,0f,width.toFloat(),simBottom);p.isFilterBitmap=false;c.drawBitmap(bitmap,src,dst,p);drawControls(c);drawElements(c)}
    private fun tile(c:Canvas,col:Int,rowTop:Float,bg:Int,label:String,sub:String="",active:Boolean=false){val l=col*tileW;val r=l+tileW;p.style=Paint.Style.FILL;p.color=if(active)blend(bg,0xffffffff.toInt(),.16f)else bg;c.drawRect(l,rowTop,r,rowTop+tileH,p);thin.color=0xff303030.toInt();thin.strokeWidth=max(2f,width/500f);c.drawRect(l,rowTop,r,rowTop+tileH,thin);text.color=Color.BLACK;text.textSize=tileH*.32f;c.drawText(label,l+tileW/2,rowTop+tileH*.47f,text);if(sub.isNotEmpty()){text.textSize=tileH*.105f;text.typeface=android.graphics.Typeface.DEFAULT_BOLD;c.drawText(sub,l+tileW/2,rowTop+tileH*.78f,text)}}
    private fun drawControls(c:Canvas){val y=simBottom;tile(c,0,y,0xff858585.toInt(),"NEW","clear");tile(c,1,y,0xff858585.toInt(),when(viewMode){ViewMode.MATERIAL->"MAT";ViewMode.HEAT->"HOT";ViewMode.ELECTRIC->"ELE"},"view");tile(c,2,y,0xff858585.toInt(),if(paused)"▶"else"Ⅱ",if(paused)"play"else"pause");tile(c,3,y,0xff858585.toInt(),"ER","eraser",erasing);tile(c,4,y,0xff79dcf3.toInt(),"°C","heat",viewMode==ViewMode.HEAT);tile(c,5,y,0xffffff83.toInt(),"⚡","electric",viewMode==ViewMode.ELECTRIC)}
    private fun categoryColor(d:Def)=when{d.id==ANT||d.id==SEED->0xffb9e98f.toInt();d.category==4->0xffd7c4ff.toInt();d.cold||d.motion==MotionKind.LIQUID->0xff81def3.toInt();d.hot||d.flammable->0xfffff287.toInt();d.motion==MotionKind.GAS->0xffd8e1e5.toInt();else->0xfff4f4f4.toInt()}
    private fun drawElements(c:Canvas){val top=simBottom+tileH;val visibleH=height-top;val rows=ceil(list.size/6.0).toInt();val maxScroll=max(0f,rows*tileH-visibleH);elementScroll=elementScroll.coerceIn(0f,maxScroll);for(n in list.indices){val row=n/6;val col=n%6;val y=top+row*tileH-elementScroll;if(y+tileH<top||y>height)continue;val d=list[n];tile(c,col,y,categoryColor(d),d.short,d.name,d.id==selected&&!erasing)}}
    override fun onTouchEvent(e:MotionEvent):Boolean{val x=e.x;val y=e.y;when(e.actionMasked){MotionEvent.ACTION_DOWN->{lastX=x;lastY=y;if(y<simBottom){touchInWorld=true;touchInPanel=false;paintWorld(x,y)}else{touchInWorld=false;touchInPanel=true;panelLastY=y}};MotionEvent.ACTION_MOVE->{if(touchInWorld){paintLine(lastX,lastY,x,y);lastX=x;lastY=y}else if(touchInPanel&&y>simBottom+tileH){val dy=y-panelLastY;elementScroll-=dy;panelLastY=y;invalidate()}};MotionEvent.ACTION_UP->{if(touchInPanel&&abs(y-lastY)<24f)handlePanelTap(x,y);touchInWorld=false;touchInPanel=false;performClick();invalidate()};MotionEvent.ACTION_CANCEL->{touchInWorld=false;touchInPanel=false}};return true}
    override fun performClick():Boolean{super.performClick();return true}
    private fun handlePanelTap(x:Float,y:Float){val col=(x/tileW).toInt().coerceIn(0,5);if(y<simBottom+tileH){when(col){0->newWorld();1->viewMode=when(viewMode){ViewMode.MATERIAL->ViewMode.HEAT;ViewMode.HEAT->ViewMode.ELECTRIC;ViewMode.ELECTRIC->ViewMode.MATERIAL};2->paused=!paused;3->erasing=!erasing;4->viewMode=ViewMode.HEAT;5->viewMode=ViewMode.ELECTRIC};return};val row=((y-(simBottom+tileH)+elementScroll)/tileH).toInt();val n=row*6+col;if(n in list.indices){selected=list[n].id;erasing=false}}
    private fun worldPoint(px:Float,py:Float):Pair<Int,Int>{val x=(px/width*GW).toInt().coerceIn(0,GW-1);val y=(py/simBottom*GH).toInt().coerceIn(0,GH-1);return x to y}
    private fun paintWorld(px:Float,py:Float){val(cx,cy)=worldPoint(px,py);val t=if(erasing)AIR else selected;for(dy in -brush..brush)for(dx in -brush..brush)if(dx*dx+dy*dy<=brush*brush){val x=cx+dx;val y=cy+dy;if(!inside(x,y))continue;val i=id(x,y);if(t==AIR)clearCell(i)else if((type[i].toInt() and 255)==AIR||defs[t]?.motion==MotionKind.STATIC||t==FIRE||t==SPARK||t==PLASMA)setCell(x,y,t)}}
    private fun paintLine(x0:Float,y0:Float,x1:Float,y1:Float){val steps=max(1,(max(abs(x1-x0),abs(y1-y0))/10f).toInt());for(s in 0..steps){val f=s.toFloat()/steps;paintWorld(x0+(x1-x0)*f,y0+(y1-y0)*f)}}
    private fun newWorld(){java.util.Arrays.fill(type,0);java.util.Arrays.fill(life,0);java.util.Arrays.fill(volt,0f);java.util.Arrays.fill(temp,20f);for(x in 0 until GW)setCell(x,GH-1,STONE)}
    private fun demoWorld(){java.util.Arrays.fill(type,0);java.util.Arrays.fill(life,0);java.util.Arrays.fill(volt,0f);java.util.Arrays.fill(temp,20f);for(x in 0 until GW)setCell(x,GH-1,STONE);for(x in 10..45)for(y in 200 until GH-1)if(rnd.nextFloat()<.72f)setCell(x,y,SAND);for(x in 58..96)for(y in 208 until GH-1)if(rnd.nextFloat()<.72f)setCell(x,y,WATER);for(x in 110..138)setCell(x,214,WOOD);for(x in 116..132)for(y in 215 until GH-1)if(rnd.nextFloat()<.5f)setCell(x,y,OIL);for(x in 145..156)for(y in 220 until GH-1)if(rnd.nextFloat()<.65f)setCell(x,y,LAVA);for(x in 18..28)setCell(x,197,SEED);for(x in 72..80)setCell(x,202,LIQUID_NITROGEN);for(x in 32..38)setCell(x,196,ANT);for(x in 104..108)setCell(x,190,BATTERY);for(x in 109..130)setCell(x,190,WIRE);setCell(131,190,LAMP)}
}
