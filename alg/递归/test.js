// n!

// n* n-1 * n-2 


function func(n) {

  if (n < 1) throw new Error('n < 1')
  if (n === 1) return 1

  return n * func(n - 1)

}

func(6)