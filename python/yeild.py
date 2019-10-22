def func(n):
    for i in range(0, n):
        val = yield i
        print(val)


f = func(10)
f.next() 
# f.next() === f.send(None)
f.send(2)
f.send(10)
# print (f.next())
