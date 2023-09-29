#!/bin/bash

# 定义npm run start的启动命令
start_command="npm run start"

# 定义重启命令
restart_command="pkill -f '$start_command' && $start_command"

# 定义cron表达式，每天的0点和20点重启应用程序
cron_expression="0 5,7,9,11,13,15,17,19,21 * * *"

# 添加cron任务
(crontab -l ; echo "$cron_expression $restart_command") | crontab -

# 保存cron任务
crontab -l > mycron
echo "$cron_expression $restart_command" >> mycron
crontab mycron
rm mycron

