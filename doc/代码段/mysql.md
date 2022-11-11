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