# Linux 常用命令

Linux 命令是日常开发和运维的基础。本文汇总最常用的命令，涵盖文件操作、权限管理、进程管理、网络、磁盘等核心场景。

## 一、文件与目录

### 1.1 查看与导航

```bash
# 查看当前目录
pwd

# 列出文件（常用参数）
ls          # 简单列出
ls -l       # 详细信息（权限、大小、时间）
ls -la      # 包含隐藏文件
ls -lh      # 文件大小人性化显示（KB/MB）

# 切换目录
cd /etc         # 绝对路径
cd ..           # 上级目录
cd ~            # 用户主目录
cd -            # 上次所在目录
```

### 1.2 创建与删除

```bash
# 创建目录
mkdir mydir
mkdir -p a/b/c      # 递归创建多级目录

# 创建文件
touch file.txt

# 删除文件
rm file.txt
rm -f file.txt      # 强制删除，不询问

# 删除目录
rm -r mydir         # 递归删除目录
rm -rf mydir        # 强制递归删除（谨慎使用）

# 复制
cp file.txt /tmp/           # 复制文件
cp -r mydir/ /tmp/mydir/    # 递归复制目录

# 移动 / 重命名
mv file.txt newname.txt     # 重命名
mv file.txt /tmp/           # 移动文件
```

### 1.3 查看文件内容

```bash
# 查看全部内容
cat file.txt

# 分页查看（q 退出）
less file.txt

# 查看前/后 N 行
head -n 20 file.txt
tail -n 20 file.txt

# 实时追踪日志（常用于日志监控）
tail -f /var/log/syslog
```

### 1.4 搜索文件

```bash
# 按文件名查找
find /etc -name "*.conf"
find . -name "app.js" -type f

# 按内容搜索（grep）
grep "error" app.log
grep -r "keyword" ./src/     # 递归搜索目录
grep -n "TODO" main.js       # 显示行号
grep -i "error" app.log      # 忽略大小写
```

---

## 二、权限管理

### 2.1 查看权限

```bash
ls -l
# 输出示例：-rwxr-xr-- 1 user group 1234 Mar 20 10:00 script.sh
# 格式说明：[文件类型][owner][group][others]
```

### 2.2 修改权限（chmod）

```bash
# 数字模式：r=4 w=2 x=1
chmod 755 script.sh     # owner: rwx，group/others: r-x
chmod 644 file.txt      # owner: rw-，group/others: r--
chmod -R 755 mydir/     # 递归修改目录

# 符号模式
chmod +x script.sh      # 所有人增加执行权限
chmod u+x script.sh     # 仅 owner 增加执行权限
chmod o-w file.txt      # 去掉 others 的写权限
```

### 2.3 修改所有者（chown）

```bash
chown user file.txt
chown user:group file.txt
chown -R user:group mydir/
```

---

## 三、进程管理

### 3.1 查看进程

```bash
# 快照式查看所有进程
ps aux

# 实时动态监控（q 退出）
top
htop        # 更友好的界面（需安装）

# 按名称过滤
ps aux | grep nginx
```

### 3.2 结束进程

```bash
# 查找进程 PID
pidof nginx
pgrep nginx

# 发送信号
kill 1234           # 默认 SIGTERM（正常退出）
kill -9 1234        # SIGKILL（强制杀死）
killall nginx       # 按名称杀死所有匹配进程
pkill -f "node app" # 按命令行匹配
```

### 3.3 后台运行

```bash
# 后台运行（关闭终端后进程也终止）
command &

# 后台运行（关闭终端后继续运行）
nohup node app.js > app.log 2>&1 &

# 查看后台任务
jobs

# 将后台任务切换到前台
fg %1
```

---

## 四、网络

### 4.1 查看网络状态

```bash
# 查看 IP 地址
ip addr
ifconfig        # 部分系统需安装 net-tools

# 查看端口占用
ss -tlnp        # 推荐（替代 netstat）
netstat -tlnp   # 查看所有 TCP 监听端口

# 查看指定端口
ss -tlnp | grep 3000
```

### 4.2 连接测试

```bash
# 测试连通性
ping google.com
ping -c 4 192.168.1.1   # 发送 4 个包后停止

# 路由追踪
traceroute google.com

# DNS 解析
nslookup google.com
dig google.com
```

### 4.3 文件传输

```bash
# 下载文件
curl -O https://example.com/file.zip
wget https://example.com/file.zip

# 远程复制（scp）
scp file.txt user@192.168.1.10:/home/user/
scp -r mydir/ user@192.168.1.10:/home/user/

# rsync 同步（增量传输）
rsync -avz ./dist/ user@server:/var/www/
```

---

## 五、磁盘与存储

```bash
# 查看磁盘使用情况
df -h           # 各挂载点使用率
df -h /         # 查看根目录磁盘使用

# 查看目录大小
du -sh /var/log
du -sh *        # 当前目录下每项大小

# 查看磁盘 IO
iostat
iotop           # 实时 IO（需安装）
```

---

## 六、系统信息

```bash
# 系统版本
uname -a
cat /etc/os-release

# CPU 信息
lscpu
cat /proc/cpuinfo | grep "model name" | head -1

# 内存信息
free -h
cat /proc/meminfo

# 系统运行时间
uptime

# 查看系统日志
journalctl -xe              # systemd 日志
tail -f /var/log/syslog     # 系统日志
```

---

## 七、服务管理（systemd）

```bash
# 启动 / 停止 / 重启服务
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx      # 重载配置（不中断连接）

# 查看状态
systemctl status nginx

# 开机自启
systemctl enable nginx
systemctl disable nginx

# 查看所有运行中的服务
systemctl list-units --type=service --state=running
```

---

## 八、包管理

### 8.1 apt（Debian / Ubuntu）

```bash
apt update                  # 更新软件源
apt upgrade                 # 升级所有包
apt install nginx           # 安装
apt remove nginx            # 卸载（保留配置）
apt purge nginx             # 完全卸载（含配置）
apt search keyword          # 搜索包
apt show nginx              # 查看包信息
```

### 8.2 yum / dnf（CentOS / RHEL / Fedora）

```bash
yum update
yum install nginx
yum remove nginx
yum search nginx

dnf install nginx           # CentOS 8+ / Fedora 推荐使用 dnf
```

---

## 九、文本处理

```bash
# 排序
sort file.txt
sort -r file.txt        # 反向排序
sort -n numbers.txt     # 数字排序

# 去重
uniq file.txt
sort file.txt | uniq    # 先排序再去重

# 统计行/字/字符数
wc -l file.txt          # 行数
wc -w file.txt          # 单词数

# 截取字段（awk）
awk '{print $1, $3}' file.txt           # 输出第 1、3 列
awk -F: '{print $1}' /etc/passwd        # 以 : 为分隔符

# 替换文本（sed）
sed 's/old/new/g' file.txt              # 替换并输出
sed -i 's/old/new/g' file.txt          # 原地替换文件
```

---

## 十、常用快捷技巧

```bash
# 管道：将前一命令输出传给后一命令
ps aux | grep node | grep -v grep

# 重定向
command > output.txt        # 覆盖写入
command >> output.txt       # 追加写入
command 2>&1 | tee log.txt  # 同时输出到终端和文件

# 查看命令历史
history
history | grep docker

# 快速执行上一条命令
!!

# 在后台挂起当前任务
Ctrl + Z    # 挂起
bg          # 在后台继续运行

# 清屏
clear
Ctrl + L
```
