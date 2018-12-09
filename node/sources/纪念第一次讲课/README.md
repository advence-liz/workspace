# nodecmd

## ref node
- [command-line-with-node@ruanyifeng](http://www.ruanyifeng.com/blog/2015/05/command-line-with-node.html)
- [building-a-simple-command-line-tool-with-npm](http://blog.npmjs.org/post/118810260230/building-a-simple-command-line-tool-with-npm)
## ref bash
- [API](http://www.cnblogs.com/SunShineYPH/archive/2011/12/13/2285570.html)
- [api](http://www.cnblogs.com/Greensun/archive/2008/07/25/1251788.html)
- [Api](http://blog.csdn.net/junmuzi/article/details/12239303)
- [百度百科](http://baike.baidu.com/subview/283786/283786.htm)
- [%~dp0](http://blog.csdn.net/lightyearwp/article/details/2778677)
- [cmd](http://www.jb51.net/article/11287.htm)
- http://www.cnblogs.com/yexiaochai/p/3961291.html
- https://segmentfault.com/a/1190000006814420#articleHeader6
- https://juejin.im/entry/57cfc4f567f3560057bafb8b


## 总结
- node liz 可以执行 而跟有没有#!/usr/bin/env node 没有关系  liz 无后缀名  难道#!/usr/bin/env node 只是给人看的 可能全局命令的时候自己根据 env 选择解析程序吧 最终发现原来不是给windows 系统使用的
- 对比系统的环境变量和npm 软链接的位置，感慨万千
- **npm link npm unlink**
```bash
@IF EXIST "%~dp0\node.exe" (：：%~dp0 当前路径  d 盘符 p 路径 0 当前batch 文件 （合起来就是获取当前文件的路径）
  "%~dp0\node.exe"  "%~dp0\node_modules\markdown2html\bin\template.js" %*
) ELSE (
  @SETLOCAL
  ：： 
  @SET PATHEXT=%PATHEXT:;.JS;=;% ：：.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC  每个后缀名的执行顺序 run cmd  === run cmd.exe ping.exe ........
  node  "%~dp0\node_modules\markdown2html\bin\template.js" %*
)
```
## 意味深长的几个环境变量
```

       %SystemRoot%   ===    C:\WINDOWS    (%windir% 同样)
       %ProgramFiles% ===    C:\Program Files
       %USERPROFILE%  ===    C:\Documents and Settings\Administrator  (子目录有“桌面”,“开始菜单”,“收藏夹”等)
       %APPDATA%      ===    C:\Documents and Settings\Administrator\Application Data
       %TEMP%         ===    C:\DOCUME~1\ADMINI~1\LOCALS~1\Temp  (%TEM% 同样)
       %OS%           ===    Windows_NT (系统)
       %Path%         ===    %SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem  (原本的设置)
       %HOMEDRIVE%    ===    C:   (系统盘)
       %HOMEPATH%     ===    \Documents and Settings\Administrator

       
C:\Users\Zhuo.Li>echo %PATHEXT%
.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC
```
## TODO
-[ ] 总结NPM命令开发的软链接 对应的目录结构执行脚本（结合图片）

-[ ] 总结 .**rc 文件 npm run user 目录下， 工作目录下 起效方式
指令&数据 

延迟&带宽


## gif

![](pic/acfun.gif)