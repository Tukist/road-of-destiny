"""
命运之路 — FastAPI 主应用
交互式文字冒险游戏 Web 服务
"""

import json
import os
import re
import sys
from fastapi import FastAPI, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime

from jinja2 import Environment, FileSystemLoader

from .models import init_db, get_db, Player, SaveGame
from .game_engine import GameEngine
from .game_data import SCENES

# PyInstaller 冻结支持：sys._MEIPASS 是临时解压目录
if getattr(sys, 'frozen', False):
    BASE_DIR = sys._MEIPASS
    STATIC_DIR = os.path.join(BASE_DIR, "app", "static")
    TEMPLATES_DIR = os.path.join(BASE_DIR, "app", "templates")
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR = os.path.join(BASE_DIR, "static")
    TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = FastAPI(title="命运之路 — 交互式文字冒险", version="1.0.0")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=True,
    cache_size=0,
)


def render_template(name: str, context: dict) -> HTMLResponse:
    """渲染模板并返回 HTMLResponse"""
    template = jinja_env.get_template(name)
    html = template.render(**context)
    return HTMLResponse(content=html)


def parse_narrative_to_lines(html_text: str, scene_id: str) -> list:
    """
    将 HTML 叙事文本解析为终端行列表
    每行: { "text": "...", "type": "dim|bright|accent|danger|" }
    """
    # 去除 HTML 标签，按 <p> 分段
    clean = re.sub(r'<br\s*/?>', '\n', html_text)
    clean = re.sub(r'</p>', '\n', clean)
    clean = re.sub(r'<[^>]+>', '', clean)
    clean = re.sub(r'&nbsp;', ' ', clean)

    paragraphs = [p.strip() for p in clean.split('\n') if p.strip()]
    if not paragraphs:
        paragraphs = [clean.strip()]

    lines = []
    is_death = ('death' in scene_id or scene_id in ('L9_death', 'R9_death', 'M8_ending'))

    for p in paragraphs:
        line_type = ""

        # 死亡/结局场景 — 红色
        if is_death and ('💀' in p or '结局' in p or '殇' in p):
            line_type = "danger"
        # 彩蛋标记
        elif '🏆' in p or '🥚' in p or '彩蛋' in p:
            line_type = "accent"
        # 寓意/括号注释 — 暗色
        elif p.startswith('（') or p.startswith('('):
            line_type = "dim"
        # 结局名
        elif '结局' in p or '💀' in p:
            line_type = "danger" if is_death else "accent"

        lines.append({"text": p, "type": line_type})

    return lines


def determine_scene_sound(scene_id: str) -> str:
    """根据场景ID确定开场音效"""
    sound_map = {
        'L1_carriage': 'horse_gallop',
        'L2_carriage_rescued': 'horse_gallop',
        'L3_inn': 'door_knock',
        'L3_poetry_question': 'door_knock',
        'L6_wedding': 'church_bell',
        'L7_curse': 'wine_pour',
        'L8_duel': 'sword_draw',
        'L9_death': 'gunshot',
        'L8_shoot_candle': 'gunshot',
        'R5_palace': 'door_knock',
        'R9_death': 'gunshot',
        'R8_impersonation': 'horse_gallop',
        'R8_realization': 'horse_gallop',
        'M6_verdict': 'crow_caw',
        'M7_pistol': 'table_slam',
        'M8_ending': 'gunshot',
        'M4_hire_kid': 'crow_caw',
        'scene_too_drunk': 'wine_pour',
        'scene_sheep_farewell': 'crow_caw',
        'scene_crossroads': 'horse_gallop',
    }
    return sound_map.get(scene_id, '')


def determine_theme(scene_id: str) -> str:
    """根据场景ID确定配色主题"""
    if not scene_id:
        return 'default'

    sid = scene_id.lower()

    # 死亡
    if any(kw in sid for kw in ['death', 'l9_', 'r9_', 'm8_ending']):
        return 'death'
    # 幸福
    if 'happy' in sid:
        return 'happy'
    # 酒馆/侯爵 — 暖色
    if any(kw in sid for kw in ['drunk', 'l3_inn', 'l3_poetry',
                                 'l4_marriage', 'l5_talk', 'l6_wedding',
                                 'l7_curse', 'l8_duel', 'tavern', 'l2_carriage']):
        return 'tavern'
    # 巴黎 — 冷蓝
    if any(kw in sid for kw in ['r2_rent', 'r3_stair', 'r4_countess',
                                 'r5_palace', 'r1_journey', 'paris']):
        return 'paris'
    # 皇宫 — 金紫
    if any(kw in sid for kw in ['r6_king', 'r7_reveal', 'r8_imper',
                                 'r8_realization', 'palace']):
        return 'palace'
    # 乡村/自然 — 绿
    if any(kw in sid for kw in ['village', 'm1_return', 'm2_recon',
                                 'm3_marriage', 'm4_poetry', 'm4_hire',
                                 'crossroads', 'sheep', 'stargaz',
                                 'm5_bril', 'm6_verdict', 'm7_pistol']):
        return 'village'
    # 彩蛋
    if any(kw in sid for kw in ['easter', 'egg', 'shoot_candle',
                                 'leave_peacefully', 'run_away']):
        return 'easter'

    return 'default'


@app.on_event("startup")
def startup():
    init_db()


# ===================== 页面路由 =====================

@app.get("/", response_class=HTMLResponse)
async def index(request: Request, token: str = "", db: Session = Depends(get_db)):
    """首页"""
    saves = []
    if token:
        # 只显示该玩家的存档
        player = db.query(Player).filter(Player.token == token).first()
        if player:
            saves = db.query(SaveGame).filter(SaveGame.player_id == player.id)\
                .order_by(SaveGame.updated_at.desc()).limit(10).all()

    saves_data = []
    for s in saves:
        flags = json.loads(s.flags) if s.flags else {}
        saves_data.append({
            "id": s.id,
            "player_name": s.player.name,
            "scene_title": SCENES.get(s.current_scene, {}).get("title", "未知"),
            "path": GameEngine.get_path_name(flags),
            "updated_at": s.updated_at.strftime("%Y-%m-%d %H:%M"),
        })

    return render_template("index.html", {
        "request": request,
        "saves": saves_data,
        "token": token,
    })


@app.get("/game/new", response_class=HTMLResponse)
async def new_game(request: Request, token: str = "", db: Session = Depends(get_db)):
    """开始新游戏"""
    # 使用 token 查找或创建玩家
    player = db.query(Player).filter(Player.token == token).first()
    if not player:
        player = Player(name="冒险者", token=token)
        db.add(player)
        db.commit()
        db.refresh(player)

    save = SaveGame(
        player_id=player.id,
        current_scene="scene_start",
        flags="{}",
    )
    db.add(save)
    db.commit()
    db.refresh(save)

    return RedirectResponse(url=f"/game/play/{save.id}", status_code=303)


@app.get("/game/load/{save_id}", response_class=HTMLResponse)
async def load_game(save_id: int, request: Request, db: Session = Depends(get_db)):
    """加载存档"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if not save:
        return RedirectResponse(url="/", status_code=303)
    return RedirectResponse(url=f"/game/play/{save.id}", status_code=303)


@app.get("/game/play/{save_id}", response_class=HTMLResponse)
async def play_game(save_id: int, request: Request, db: Session = Depends(get_db)):
    """游戏主界面"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if not save:
        return RedirectResponse(url="/", status_code=303)

    scene = GameEngine.get_scene(save.current_scene, json.loads(save.flags) if save.flags else {})
    flags = json.loads(save.flags) if save.flags else {}
    available_choices = GameEngine.get_available_choices(save.current_scene, flags)
    is_ending = GameEngine.is_ending(save.current_scene)
    easter_egg_count = GameEngine.get_easter_egg_count(flags)
    path_name = GameEngine.get_path_name(flags)

    ending_info = None
    if is_ending:
        ending_info = GameEngine.get_ending_info(save.current_scene, flags)

    choices_data = [
        {"text": c["text"], "index": i, "is_easter_egg": c.get("is_easter_egg", False)}
        for i, c in enumerate(available_choices)
    ]

    # 解析叙事文本为终端行
    narrative_lines = parse_narrative_to_lines(scene.get("text", ""), scene.get("id", ""))
    # 确定主题和音效
    theme = determine_theme(scene.get("id", ""))
    scene_sound = determine_scene_sound(scene.get("id", ""))

    return render_template("game.html", {
        "request": request,
        "save_id": save_id,
        "player_name": save.player.name,
        "scene": scene,
        "narrative_lines": narrative_lines,
        "choices": choices_data,
        "is_ending": is_ending,
        "ending_info": ending_info,
        "easter_egg_count": easter_egg_count,
        "path_name": path_name,
        "theme": theme,
        "scene_sound": scene_sound,
        "flags_json": save.flags or "{}",
    })


@app.post("/game/choose/{save_id}")
async def make_choice(save_id: int, choice_index: int = Form(...), db: Session = Depends(get_db)):
    """处理玩家选择"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if not save:
        return RedirectResponse(url="/", status_code=303)

    flags = json.loads(save.flags) if save.flags else {}

    next_scene, new_flags, choice = GameEngine.apply_choice(
        save.current_scene, choice_index, flags
    )

    save.current_scene = next_scene
    save.flags = json.dumps(new_flags, ensure_ascii=False)
    save.updated_at = datetime.utcnow()
    db.commit()

    return RedirectResponse(url=f"/game/play/{save.id}", status_code=303)


@app.get("/game/restore_point/{save_id}")
async def restore_point(save_id: int, scene: str = "", flags: str = "{}", db: Session = Depends(get_db)):
    """存档戒指 — 时间回溯到存储点位"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if not save:
        return RedirectResponse(url="/", status_code=303)

    if scene:
        save.current_scene = scene
        save.flags = flags
        save.updated_at = datetime.utcnow()
        db.commit()

    return RedirectResponse(url=f"/game/play/{save.id}", status_code=303)


@app.get("/game/delete/{save_id}")
async def delete_save(save_id: int, db: Session = Depends(get_db)):
    """删除存档"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if save:
        db.delete(save)
        db.commit()
    return RedirectResponse(url="/", status_code=303)


# ===================== API 路由 =====================

@app.get("/api/scenes")
async def list_scenes():
    """列出所有场景（调试用）"""
    return {
        "total": len(SCENES),
        "scenes": list(SCENES.keys()),
    }


@app.get("/api/easter_eggs/{save_id}")
async def get_easter_eggs(save_id: int, db: Session = Depends(get_db)):
    """获取当前存档的彩蛋统计"""
    save = db.query(SaveGame).filter(SaveGame.id == save_id).first()
    if not save:
        return {"error": "存档不存在"}
    flags = json.loads(save.flags) if save.flags else {}
    return {
        "count": GameEngine.get_easter_egg_count(flags),
        "path": GameEngine.get_path_name(flags),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
