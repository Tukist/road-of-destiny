"""
命运之路 - 启动器
PyInstaller 入口点：启动 FastAPI 服务器并打开浏览器
"""
import sys
import os
import webbrowser
import threading
import time

# 确保能找到模板和静态文件
if getattr(sys, 'frozen', False):
    os.chdir(os.path.dirname(sys.executable))

def open_browser():
    time.sleep(1.5)
    webbrowser.open('http://localhost:8000')

if __name__ == '__main__':
    threading.Thread(target=open_browser, daemon=True).start()
    import uvicorn
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, log_level='info')
