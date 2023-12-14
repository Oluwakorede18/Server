exports.sortByFrequency = (arr) => {
  const count = {};

  // Count the occurrence of each value in the array
  arr.forEach((val) => {
    count[val] = count[val] ? count[val] + 1 : 1;
  });
  // Convert the object to an array and sort it by count in descending order
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);

  let sortedArray = [];
  sorted.forEach((e) => {
    sortedArray.push(e[0]);
  });
  // Map the sorted array to extract only the values and return the result

  const arrayOfObjects = sortedArray.map((element) => {
    return { term: element };
  });
  return arrayOfObjects;

  // return arrayUniqueByKey
};
