---
title: APP本身测试之Drozer工具的安装与使用
layout: post
post-image: /assets/images/20210806/888.jpg
description: drozer是一款针对Android系统的安全测试框架。
tags:
- 渗透测试
- 工具
- Android
---

# APP本身测试之Drozer工具的安装与使用    

​                                                                                                                       ——神之右手 

## 一、安装

从官网上下载drozer的压缩包文件，解压drozer压缩包后，直接运行setup.exe、

![image-20210806094107895](/assets/images/20210806/1.png)

![image-20210806093636243](/assets/images/20210806/2.png)

打开夜神，在命令行窗口中运行：adb devices，在这里我没有找到夜神模拟器（这个问题，在后面解决了），可以直接使用：adb connect 127.0.0.1:62001直接连接到模拟器，这时使用：adb devices 命令再次查看是否连接成功。

**1、安装两个apk文件(drozer-agent/sieve)：**

直接到文件的目录下，使用：adb install drozer-agent/sieve，将两个apk文件安装到模拟器上，sieve要单独下载，在官网有下载链接

![image-20210806094025732](/assets/images/20210806/3.png)

打开drozer-agent,

![image-20210804172809093](/assets/images/20210806/4.png)

点击开启，然后点击下面红框所示

![image-20210804172837080](/assets/images/20210806/5.png)

会出现一个新的界面，点击红框切换到enable，然后等待主机上命令行窗口的连接命令

![image-20210804172851767](/assets/images/20210806/6.png)

在drozer的安装目录下重新打开一个命令行窗口，输入命令：adb forward tcp:31415 tcp:31415 //这是将本地端口转发到模拟器

![image-20210804172905552](/assets/images/20210806/7.png)

然后，在确保模拟器中的drozer-agent的设置全部打开的情况下，在命令行中输入：drozer console connect

![image-20210804172916345](/assets/images/20210806/8.png)

出现Android的标志表明已连接上，如果第一次没有连接上，显示的是下面的状态，则要设置一下Java的环境变量

![image-20210804172927050](/assets/images/20210806/9.png)

在drozer的目录下创建一个名为 .drozer_config的文件：

**2、配置内容：**

[executables]

java=Java的安装路径\java.exe

javac=java的安装路径\javac.exe

 

然后，重新连接即可。

至此，环境已经配置完。



##二、使用测试

**1、安装需要测试的apk：**

adb install apk  //使用命令行安装apk文件，方便知道安装失败时，从哪里解决问题

为防止在获取安装包名时，出现中文乱码，建议修改package.py源码（E:\drozer\Lib\drozer\modules\app\package.py），在首行添加：

**import sys**

**reload(sys)**

**sys.setdefaultencoding('utf-8')**

![image-20210804172957201](/assets/images/20210806/10.png)

**在第360行至362行的参数前加上字符”u“：**

![image-20210804173007917](/assets/images/20210806/11.png)

**2、获取安装包名：**run app.package.list

例如：安装某APP：adb install uniqlo4D.apk

![image-20210804173132185](/assets/images/20210806/12.png)

![image-20210804173224754](/assets/images/20210806/13.png)

**3、找到测试的安装包：**使用-f参数

run app.package.list -f sieve

![image-20210804173247181](/assets/images/20210806/14.png)

**4、获取应用的基本信息：**

run app.package.info -a 包名

![image-20210804173303077](/assets/images/20210806/15.png)

**5、检查是否有暴露的组件攻击面：**组件暴露可能导致敏感信息泄露、拒绝服务、权限提升绕过，界面劫持、远程代码执行等安全漏洞

run app.package.attacksurface 包名

![image-20210804173332199](/assets/images/20210806/16.png)

根据返回信息，可以看到暴露了3个activity组件，2个providers组件，2个services组件

**6、对暴露的activity组件进行攻击：**

run app.activity.info -a 包名

![image-20210804173346668](/assets/images/20210806/17.png)

**7、启动组件信息：**

run app.activity.start --component 包名 组件名

![image-20210804173403642](/assets/images/20210806/18.png)

**出现问题**：在这里我的电脑上出现一个问题，那就是，电脑和模拟器的连接不稳定，容易自动断掉连接，原因是Android的adb版本和夜神模拟器的nox_adb.exe版本不同

**解决方法**：将Android的adb复制到桌面并重命名为nox_adb.exe，将模拟器的nox_adb.exe重命名为nox_adb.exe.bak，然后将桌面的nox_adb.exe赋值到模拟器的目录下即可，使用nox_adb.exe --version查看版本是否与adb.exe --version的版本相同，相同即可。

此时，重新连接到模拟器：

![image-20210804173442992](/assets/images/20210806/19.png)

经测试发现，第一个组件是显示系统文件目录，第二个是密码列表，在这里猜测是由于没有用户，所有全是空的

 **8、获取Content Provider信息：**

获取该APP和哪些应用程序有交互，在这里可以看到一些数据库的交互，文件备份之类的信息

run app.provider.info -a 包名

![image-20210804173604450](/assets/images/20210806/20.png)

**9、获取所有可以访问的uri：**

run scanner.provider.finduris -a 包名

![image-20210804173615705](/assets/images/20210806/21.png)

**10、获取各个uri的数据：**

run app.provider.query contentURI，其中contentURI就是指下方的几个URIs，在这里由于没有用户，所以数据为空

![image-20210804173651551](/assets/images/20210806/22.png)

在这里获取了个人信息，很像MySQL数据结构，可以尝试进行SQL注入

**11、列出所有表：**

run app.provider.query URI --projection "* FROM SQLITE_MASTER WHERE type='table';--"  其中引号里为注入语句

![image-20210804173709802](/assets/images/20210806/23.png)

**12、获取某个表中的数据：**

run app.provider.query contentURI --projection "* FROM Key;--"

![image-20210804173727451](/assets/images/20210806/24.png)

**13、同时检测SQL注入和目录遍历：**

run scanner.provider.injection -a packageName

run scanner.provider.traversal -a packageName

![image-20210804173742958](/assets/images/20210806/25.png)

![image-20210804173748742](/assets/images/20210806/26.png)

drozer的使用大体就如上所述，更多的使用方法可以自行百度或上官网查看。
