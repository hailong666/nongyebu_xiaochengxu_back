pname=$(lsof -i:8000 | awk 'NR==2' | awk '{print $2}')
echo '$pname'

if [ -z "$pname" ]; then
    echo "变量为空"
    npm run start
else
    echo "变量不为空"
    kill -9 $pname
    cd '/home/ubuntu/nongyebu/nongyebu_xiaochengxu_back'
    npm run start
fi

