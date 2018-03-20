// Regex 
const philoBirthDateRX = /\(([^-\d]*)([-]*?[\d]+)([^-\d]+[-]*[^-\d]+)*([-]{0,1}[\d]+)([^-\d]*)[\w\d\s]*\)/
const shortPhiloBirthDateRX = /\((?:[^-\d]*)(-{0,1}[\d]+)(?:[^-\d]*(?: - )*[^-\d]*)(-{0,1}[\d]+)(?:(?:[^\d]*)|(?: .*))\)/
console.log('short: ' + shortPhiloBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)"));
console.log('long: ' + philoBirthDateRX.exec("Timée de Locres (5ᵉ siècle siècle avant Jésus-Christ)"));
