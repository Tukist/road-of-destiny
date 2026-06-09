"""
命运之路 — 游戏引擎
处理场景跳转、条件判断、彩蛋触发、存档/读档
"""

import json
from .game_data import SCENES


class GameEngine:
    """游戏核心引擎"""

    @staticmethod
    def get_scene(scene_id: str, flags: dict = None) -> dict:
        """获取场景数据，支持基于 flags 的文本变体"""
        scene = SCENES.get(scene_id)
        if not scene:
            return SCENES.get("scene_start", {})

        # 如果有 flags 和文本变体，检查是否有匹配的变体
        if flags and "text_variants" in scene:
            for flag_key, variant_text in scene["text_variants"].items():
                if flags.get(flag_key):
                    scene = dict(scene)  # 浅拷贝
                    scene["text"] = variant_text
                    break

        return scene

    @staticmethod
    def get_available_choices(scene_id: str, flags: dict) -> list:
        """根据当前标记获取可选选项"""
        scene = GameEngine.get_scene(scene_id, flags)
        choices = scene.get("choices", [])
        available = []
        for c in choices:
            flags_require = c.get("flags_require", {})
            if not flags_require:
                # 始终可见的选项
                available.append(c)
            else:
                # 需要满足条件的选项
                match = all(flags.get(k) == v for k, v in flags_require.items())
                if match:
                    available.append(c)
        return available

    @staticmethod
    def apply_choice(scene_id: str, choice_index: int, flags: dict) -> tuple:
        """
        应用选择，返回 (next_scene_id, updated_flags, choice_text)
        """
        available = GameEngine.get_available_choices(scene_id, flags)
        if choice_index < 0 or choice_index >= len(available):
            # 无效选择，留在当前场景
            return scene_id, flags, None

        choice = available[choice_index]
        next_scene = choice.get("next_scene", scene_id)

        # 更新标记
        new_flags = dict(flags)
        flags_set = choice.get("flags_set", {})
        new_flags.update(flags_set)

        return next_scene, new_flags, choice

    @staticmethod
    def is_ending(scene_id: str) -> bool:
        """判断是否为结局场景"""
        ending_patterns = ["_death", "_ending", "ENDING", "L9_", "R9_", "M8_"]
        for p in ending_patterns:
            if p in scene_id:
                return True
        return scene_id in ["scene_too_drunk", "L7_leave_peacefully",
                            "L8_shoot_candle", "M3_happy_ending"]

    @staticmethod
    def get_easter_egg_count(flags: dict) -> int:
        """统计已触发的彩蛋数量"""
        easter_egg_flags = [
            "喝大了", "告别羊群", "被羊吐槽", "看过星星", "被鄙视诗歌",
            "试图搭话", "逃跑失败", "忍辱离开", "略有怀疑", "给国王念诗",
            "后知后觉", "坦然赴死", "放弃诗歌", "雇小孩",
        ]
        return sum(1 for f in easter_egg_flags if flags.get(f))

    @staticmethod
    def get_path_name(flags: dict) -> str:
        """获取当前命运路径名称"""
        if flags.get("选择左路"):
            return "左路：侯爵之路"
        elif flags.get("选择右路"):
            return "右路：巴黎之路"
        elif flags.get("选择中路"):
            return "中路：归家之路"
        return "序章"

    @staticmethod
    def get_ending_info(scene_id: str, flags: dict) -> dict:
        """获取结局信息"""
        endings = {
            "L9_death": {"name": "左路之殇", "type": "悲剧", "desc": "在银瓶旅店的决斗中倒下，侯爵的子弹穿透了诗人的心。"},
            "L7_leave_peacefully": {"name": "另一种胜利", "type": "隐藏", "desc": "露西用智慧和勇气证明：命运可以不流血。"},
            "L8_shoot_candle": {"name": "蜡烛英雄", "type": "彩蛋", "desc": "一枪打灭蜡烛，也打灭了侯爵的威风。"},
            "R9_death": {"name": "右路之殇", "type": "悲剧", "desc": "在巴黎的街头，替国王挡下了刺客的子弹。"},
            "M8_ending": {"name": "中路之殇", "type": "悲剧", "desc": "在自家顶楼，用侯爵纹章的手枪结束了乌鸦的歌唱。"},
            "M3_happy_ending": {"name": "平凡的幸福", "type": "隐藏", "desc": "关上抽屉，选择了知足——命运最温柔的陷阱。"},
            "scene_too_drunk": {"name": "循环命运", "type": "彩蛋", "desc": "命运之路，原地打转。"},
        }
        return endings.get(scene_id, {"name": "未知结局", "type": "普通", "desc": "命运仍在继续。"})
