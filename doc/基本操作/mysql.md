
## 锁
- https://cloud.tencent.com/developer/article/1748597
- https://www.cnblogs.com/laoyeye/p/8228467.html
乐观锁

乐观锁和悲观锁并不是锁，而是锁的设计思想。

乐观锁（Optimistic Locking）认为对同一数据的并发操作不会总发生，属于小概率事件，不用每次都对数据上锁，也就是不采用数据库自身的锁机制，而是通过程序来实现。在程序上，我们可以采用版本号机制或者时间戳机制实现。

乐观锁的版本号机制
在表中设计一个版本字段 version，第一次读的时候，会获取 version 字段的取值。然后对数据进行更新或删除操作时，会执行UPDATE ... SET version=version+1 WHERE version=version。此时如果已经有事务对这条数据进行了更改，修改就不会成功。

乐观锁的时间戳机制
时间戳和版本号机制一样，也是在更新提交的时候，将当前数据的时间戳和更新之前取得的时间戳进行比较，如果两者一致则更新成功，否则就是版本冲突。

悲观锁
悲观锁（Pessimistic Locking）也是一种思想，对数据被其他事务的修改持保守态度，会通过数据库自身的锁机制来实现，从而保证数据操作的排它性。

悲观锁可能会死锁，悲观锁并不影响普调查询即没有'for update' 的。

上面的第一步我们执行了一次查询操作：select status from t_goods where id=1 for update;

与普通查询不一样的是，我们使用了select…for update的方式，这样就通过数据库实现了悲观锁。此时在t_goods表中，id为1的 那条数据就被我们锁定了，其它的事务必须等本次事务提交之后才能执行。这样我们可以保证当前的数据不会被其它事务修改。

注：需要注意的是，在事务中，只有SELECT ... FOR UPDATE 或LOCK IN SHARE MODE 同一笔数据时会等待其它事务结束后才执行，一般SELECT ... 则不受此影响。拿上面的实例来说，当我执行select status from t_goods where id=1 for update;后。我在另外的事务中如果再次执行select status from t_goods where id=1 for update;则第二个事务会一直等待第一个事务的提交，此时第二个查询处于阻塞的状态，但是如果我是在第二个事务中执行select status from t_goods where id=1;则能正常查询出数据，不会受第一个事务的影响。

