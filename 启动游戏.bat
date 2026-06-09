@echo off
title 命运之路 - Road of Destiny
echo ========================================
echo   命 运 之 路  Road of Destiny
echo ========================================
echo.
echo 正在启动服务器...
echo 启动后请打开浏览器访问 http://localhost:8000
echo.
pip install -r requirements.txt -q 2>nul
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
