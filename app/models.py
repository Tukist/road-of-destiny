from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/game_v2.db")

# 自动创建数据库文件所在目录
db_path = DATABASE_URL.replace("sqlite:///", "")
if db_path.startswith("./"):
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), db_path[2:])
db_dir = os.path.dirname(db_path)
os.makedirs(db_dir, exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, default="冒险者")
    token = Column(String(64), nullable=False, default="", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    saves = relationship("SaveGame", back_populates="player", cascade="all, delete-orphan")


class SaveGame(Base):
    __tablename__ = "save_games"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    current_scene = Column(String(30), nullable=False, default="scene_start")
    flags = Column(Text, default="{}")  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    player = relationship("Player", back_populates="saves")


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
