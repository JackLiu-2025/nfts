#!/bin/bash

# 激活虚拟环境并启动服务
source /Users/wangxinxin/.envs/nfts/bin/activate
cd "$(dirname "$0")"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
