/**
  extensions is an Array and each item has such format:
  {firstName: 'xxx', lastName: 'xxx', ext: 'xxx', extType: 'xxx'}
  lastName, ext can be empty, extType can only has "DigitalUser", "VirtualUser","FaxUser","Dept","AO".
**/

/**
  Question 1: sort extensions by "firstName" + "lastName" + "ext" ASC
**/
function sortExtensionsByName (extensions) {
  function strSum ({ firstName, lastName, ext }) {
    return firstName + lastName + ext
  }
  return extensions.sort((m, n) => {
    return strSum(m) > strSum(n)
  })
}

/**
  Question 2: sort extensions by extType follow these orders ASC
  DigitalUser < VitrualUser < FaxUser < AO < Dept.
**/
function sortExtensionsByExtType (extensions) {
  const extTypeEnum = {
    DigitalUser: 0,
    VitrualUser: 1,
    FaxUser: 2,
    AO: 3,
    Dept: 4
  }
  return extensions.sort((m, n) => {
    return extTypeEnum[m.extType] > extTypeEnum[n.extType]
  })
}

/**
  saleItems is an Array has each item has such format:
  {
	month: n, //[1-12],
	date: n, //[1-31],
	transationId: "xxx",
	salePrice: number
  }
**/

/**
  Question 3: write a function to calculate and return a list of total sales (sum) for each quarter, expected result like:
  [
  	{quarter: 1, totalPrices: xxx, transactionNums: n},
  	{....}
  ]
**/

function sumByQuarter (saleItems) {
  const quarterMap = new Map()
  saleItems.forEach(({ month, salePrice }) => {
    let currentQuarterIndex = -1
    if (month <= 3) currentQuarterIndex = 1
    else if (month <= 6) currentQuarterIndex = 2
    else if (month <= 9) currentQuarterIndex = 3
    else currentQuarterIndex = 4

    if (!quarterMap.has(currentQuarterIndex)) {
      quarterMap.set(currentQuarterIndex, {
        quarter: currentQuarterIndex,
        totalPrices: 0,
        transactionNums: 0
      })
    }

    let currentQuarter = quarterMap.get(currentQuarterIndex)
    currentQuarter.transactionNums += 1
    currentQuarter.totalPrices += salePrice
  })

  return [...quarterMap.values()]
}

/**
  Question 4: write a function to calculate and return a list of average sales for each quarter, expected result like:
  [
    {quarter: 1, averagePrices: xxx, transactionNums: n},
    {....}
  ]
**/

function averageByQuarter (saleItems) {
  return sumByQuarter(saleItems).map(
    ({ quarter, totalPrices, transactionNums }) => {
      return {
        quarter,
        averagePrices: totalPrices / transactionNums,
        transactionNums
      }
    }
  )
}

/**
  Question 5: please create a tool to generate Sequence
  Expected to be used like:
  var sequence1 = new Sequence();
  sequence1.next() --> return 1;
  sequence1.next() --> return 2;

  in another module:
  var sequence2 = new Sequence();
  sequence2.next() --> 3;
  sequence2.next() --> 4;
**/
class Sequence {
  static seed = 0
  next () {
    return ++Sequence.seed
  }
}

/**
    Question 6:
    AllKeys: 0-9;
    usedKeys: an array to store all used keys like [2,3,4];
    We want to get an array which contains all the unused keys,in this example it would be: [0,1,5,6,7,8,9]
**/

function getUnUsedKeys (allKeys, usedKeys) {
  return allKeys.filter(i => !usedKeys.includes(i))
}
