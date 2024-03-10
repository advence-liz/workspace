## 聚会函数

Sum : 值的总和
Avg : 平均值
Min：最小值
Max : 最大值
Count：统计记录本文来自：HackCode，原地址：https://hackcode.youkee.cc/?id=132

```js
const employeeRepository = myDataSource.getRepository(Employee);
const result = await employeeRepository
      .createQueryBuilder('employee')
      .select('SUM(employee.salary)', 'totalSalary')
      .addSelect('AVG(employee.salary)', 'averageSalary')
      .addSelect('MAX(employee.salary)', 'maxSalary')
      .addSelect('MIN(employee.salary)', 'minSalary')
      .addSelect('COUNT(*)', 'count')
      .getRawOne(); 

```


## setLock
