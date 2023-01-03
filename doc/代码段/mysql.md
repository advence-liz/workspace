

## `CONCAT()和CONCAT_WS()`

既CONCAT()和CONCAT_WS()函数用于连接两个或多个串，但它们之间的基本区别是，CONCAT_WS()函数可以执行级联与串之间的分离器沿，而在CONCAT()方法没有隔板的概念。它们之间的另一个重要区别是，CONCAT()如果任何参数为NULL，则函数返回NULL，而如果分隔符为NULL，则CONCAT_WS()函数将返回NULL
```sql
mysql> Select CONCAT('Ram','is','a','good','student') AS 'Example of CONCAT()';

+---------------------+
| Example of CONCAT() |
+---------------------+
| Ramisagoodstudent   |
+---------------------+

mysql> Select CONCAT_WS(' ','Ram','is','a','good','student') AS 'Example of CONCAT_WS()';

+------------------------+
| Example of CONCAT_WS() |
+------------------------+
| Ram is a good student  |
+------------------------+

```

## case when end

```sql
select count(case when id < 1000 then id else NULL END) as count_num,
       count(*) as total,
      count(case when id < 1000 then id else NULL END)/count(*)
 from auth_user
 ```
 >> 999	2834	0.3525

 ## MySQL运算符 != 和 ＜＞ 以及 = 和 ＜=＞ 的区别
 != 和 <> 的功能一致
 <=>运算符相当于封装了= 和 is ，既可以判断 非NULL值，也可以用来判断NULL值

 ## mysql  获取top 3
 ```sql
 select   * from auth_user order by id desc  LIMIT 0,3
 ```
## [hive中的group by分组查询注意和其他其他传统关系数据库sql的区别](https://blog.csdn.net/qq_39954916/article/details/105235582)
在hive中， 一旦有group by子句，那么，在select子句中只能有分组字段，聚合函数以及值的水平是唯一的字段（常量）。否则会提示Expression not in GROUP BY key '不应该在select中的字段名'。想想，如果一个字段的值的水平不止一个，然后又不对他就行聚合函数运算，那么是没有办法分组显示的。
 ## Hive SQL 查询函数手册 https://www.gairuo.com/p/hive-sql-cheat-sheet

```sql
SELECT t1.a as name_a, -- 说明a
      t2.b as name_b, -- 说明b
      max(t2.f) as name_f -- 说明f
FROM
  (SELECT <list1>
   FROM T) AS t1
<LEFT / RIGHT> JOIN
  (SELECT <list2>
   FROM C) AS c1 ON t1.id = c1.id AND t1.name = c1.name
WHERE X=a AND (Y > b or Z != c)
GROUP BY t1.m, t2.p
ORDER BY J, H DESC
```
执行顺序：
`FROM —> WHERE —> GROUP BY—> 聚合函数 —> HAVING—> SELECT —> ORDER BY —> LIMIT`
##
ALTER TABLE <数据表名>
CHANGE COLUMN <字段名> <数据类型> DEFAULT <默认值>;

 ALTER TABLE `handles` ALTER COLUMN navs SET DEFAULT '0'

 ALTER TABLE `auth_team` ALTER COLUMN navs SET DEFAULT '0'

 alter table `test_tb` alter column `col3` set default '3a';

alter table `auth_team` change column `navs` `navs` varchar(1024) not null DEFAULT '0';
