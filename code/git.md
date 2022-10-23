## 代码行数统计
```zsh
git log --author="lizhuo13" --since='2022-10-01' --until='2022-10-21' --pretty=tformat: --numstat | awk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "增加的行数:%s 删除的行数:%s 总行数: %s\n",add,subs,loc }'
```