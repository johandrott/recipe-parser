export function convertFromFraction(value: string): string {
  // number comes in, for example: 1 1/3
  if (value && value.split(" ").length > 1) {
    const [whole, fraction] = value.split(" ");
    const [a, b] = fraction.split("/");

    if (!b) {
      return whole;
    }

    const remainder = parseFloat(a) / parseFloat(b);
    const wholeAndFraction = parseInt(whole)
      ? parseInt(whole) + remainder
      : remainder;
    return keepThreeDecimals(wholeAndFraction);
  } else if (!value || value.split("-").length > 1) {
    return value;
  } else {
    const [a, b] = value.split("/");
    return b ? keepThreeDecimals(parseFloat(a) / parseFloat(b)) : a;
  }
}

export function getFirstMatch(line: string, regex: RegExp) {
  const match = line.match(regex);
  return (match && match[0]) || "";
}

const unicodeObj: { [key: string]: string } = {
  "½": "1/2",
  "⅓": "1/3",
  "⅔": "2/3",
  "¼": "1/4",
  "¾": "3/4",
  "⅕": "1/5",
  "⅖": "2/5",
  "⅗": "3/5",
  "⅘": "4/5",
  "⅙": "1/6",
  "⅚": "5/6",
  "⅐": "1/7",
  "⅛": "1/8",
  "⅜": "3/8",
  "⅝": "5/8",
  "⅞": "7/8",
  "⅑": "1/9",
  "⅒": "1/10",
};

const numericAndFractionRegex = /^(\d+\/\d+)|(\d+\s\d+\/\d+)|(\d+.\d+)|\d+/g;
const unicodeFractionRegex = /\d*\s?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]/g;
const onlyUnicodeFraction = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]+/g;
const rangesRegex = /^(\d[/.,]?\d?\s?-\s?\d[/.,]?\d?)|^(\d\s?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]\s?-\s?\d\s?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]?)|([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]\s?-\s?[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒])/g; // for ex: 1 1/2 - 3"

export function findQuantityAndConvertIfUnicode(ingredientLine: string) {
  if (ingredientLine.match(rangesRegex)) {
    const quantityRanges = getFirstMatch(ingredientLine, rangesRegex)
      .trim()
      .split("-");

    const ranges = quantityRanges.map((quantity) => {
      quantity = quantity.trim().replace(",", ".");

      //range has unicodes
      let value = quantity;
      if (ingredientLine.match(unicodeFractionRegex)) {
        value = convertUnicode(quantity);
      }

      return value;
    });

    return [
      `${ranges[0]}-${ranges[1]}`,
      ingredientLine
        .replace(getFirstMatch(ingredientLine, rangesRegex), "")
        .trim(),
    ];
  }

  // found a unicode quantity inside our regex, for ex: '⅝'
  if (ingredientLine.match(unicodeFractionRegex)) {
    const quantity = convertUnicode(ingredientLine);

    // If there's a match for the unicodePart in our dictionary above
    return [
      quantity,
      ingredientLine
        .replace(getFirstMatch(ingredientLine, unicodeFractionRegex), "")
        .trim(),
    ];
  }

  // found a numeric/fraction quantity, for example: "1 1/3"
  if (ingredientLine.match(numericAndFractionRegex)) {
    if (ingredientLine.indexOf("kryddmått") > -1) {
      console.log("Kryddmått!!!");
    }
    let quantity = getFirstMatch(
      ingredientLine,
      numericAndFractionRegex
    ).replace(/[,]+/g, ".");

    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, numericAndFractionRegex), "")
      .trim();

    return [quantity, restOfIngredient];
  }

  // no parse-able quantity found
  else {
    return [null, ingredientLine];
  }
}

export function multiplyQuantity(
  ingredientLine: string,
  multiplier: number
): string {
  //found a range of quantities
  if (ingredientLine.match(rangesRegex)) {
    const quantityRanges = getFirstMatch(ingredientLine, rangesRegex)
      .trim()
      .split("-");

    const multipliedRanges = quantityRanges.map((quantity) => {
      quantity = quantity.trim().replace(",", ".");

      //range has unicodes
      let value: number;
      if (ingredientLine.match(unicodeFractionRegex)) {
        value = parseFloat(convertFromFraction(convertUnicode(quantity)));
      } else {
        value = parseFloat(convertFromFraction(quantity));
      }

      return isNaN(value) ? quantity : (value * multiplier).toString();
    });

    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, rangesRegex), "")
      .trim();

    return `${multipliedRanges[0]} - ${multipliedRanges[1]} ${restOfIngredient}`;
  }

  // found a unicode quantity inside our regex, for ex: '⅝'
  if (ingredientLine.match(unicodeFractionRegex)) {
    const quantity =
      parseFloat(convertFromFraction(convertUnicode(ingredientLine))) *
      multiplier;

    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, unicodeFractionRegex), "")
      .trim();
    return `${quantity} ${restOfIngredient}`;
  }

  // found a numeric/fraction quantity, for example: "1 1/3"
  if (ingredientLine.match(numericAndFractionRegex)) {
    let quantity = getFirstMatch(
      ingredientLine,
      numericAndFractionRegex
    ).replace(/[,]+/g, ".");

    const value = parseFloat(convertFromFraction(quantity)) * multiplier;

    const restOfIngredient = ingredientLine
      .replace(getFirstMatch(ingredientLine, numericAndFractionRegex), "")
      .trim();
    return `${value} ${restOfIngredient}`;
  }

  // no parse-able quantity found
  else {
    return ingredientLine;
  }
}

function keepThreeDecimals(val: number) {
  const strVal = val.toString();
  return strVal.split(".")[0] + "." + strVal.split(".")[1].substring(0, 3);
}

function convertUnicode(quantity: string): string {
  const numericPart = getFirstMatch(quantity, numericAndFractionRegex);
  const unicodePart = getFirstMatch(
    quantity,
    numericPart ? onlyUnicodeFraction : unicodeFractionRegex
  );

  if (unicodeObj[unicodePart]) {
    return `${numericPart} ${unicodeObj[unicodePart]}`;
  }

  return quantity;
}
