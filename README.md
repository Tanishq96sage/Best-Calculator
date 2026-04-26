# Best Calculator

A comprehensive, browser-based multi-tool calculator suite built with HTML, CSS, and JavaScript. It covers everything from standard arithmetic and scientific functions to unit conversions, currency exchange, competitive programming utilities, and more — all in a single, no-install web application.

Live Demo: [best-calculator-liart.vercel.app](https://best-calculator-liart.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Run Locally](#run-locally)
- [Calculator Modules](#calculator-modules)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Best Calculator is a single-page web application that consolidates a wide range of calculation and conversion tools into one clean interface. Users can favourite individual calculators for quick access, making the experience personal and efficient. No backend, no dependencies, no installation — just open and use.

---

## Features

- Fully client-side: works offline after the first load
- Favourites system to pin frequently used tools
- Scientific calculator with trigonometry, logarithms, exponents, and constants
- Competitive programming module with number theory functions
- Live currency conversion with real-time exchange rates
- World clock supporting multiple cities and timezones
- BMI, GPA, fuel cost, discount, and age calculators
- Unit converters across temperature, length, weight, speed, area, and more
- Number base converter (Decimal, Binary, Hexadecimal)
- Responsive layout suitable for desktop and mobile

---

## Project Structure

```
Best-Calculator/
├── index.html      # Application markup and calculator panels
├── index.css       # Styling and responsive layout
├── script.js       # All calculator logic, conversions, and interactivity
└── README.md
```

---

## Getting Started

No build tools or package managers are required.

### Run Locally

Clone the repository:

```bash
git clone https://github.com/Tanishq96sage/Best-Calculator.git
cd Best-Calculator
```

Open `index.html` directly in any modern browser:

```bash
# On Linux / macOS
open index.html

# Or simply double-click index.html in your file explorer
```

That's it. The app runs entirely in the browser with no server required.

> **Note:** The Currency Converter and World Clock modules fetch live data and require an internet connection to function correctly.

---

## Calculator Modules

### Basic Calculator
Standard arithmetic operations (addition, subtraction, multiplication, division) along with percentage and decimal support.

### Scientific Calculator
Extended functions including `sin`, `cos`, `log`, `ln`, `log2`, square root, exponentiation, and mathematical constants `pi` and `e`.

### Unit Converters

| Converter   | Supported Units                                              |
|-------------|--------------------------------------------------------------|
| Temperature | Celsius, Fahrenheit, Kelvin                                  |
| Length      | Meter, Kilometer, Centimeter, Millimeter, Mile, Foot, Inch   |
| Weight      | Kilogram, Gram, Pound, Ounce, Metric Ton                     |
| Speed       | km/h, mph, m/s, Knots                                        |
| Area        | Square Meter, Square Kilometer, Square Foot, Acre, Hectare   |
| All Units   | Universal converter across all supported categories          |

### BMI Calculator
Calculates Body Mass Index from height and weight, with a visual indicator for Underweight, Normal, Overweight, and Obese ranges.

### Age Calculator
Computes exact age in years, months, and days from a given date of birth.

### Discount Calculator
Calculates the final price and total savings from an original price and a discount percentage.

### Fuel Cost Calculator
Estimates total fuel needed and cost based on distance, fuel efficiency, and price per litre.

### Fuel Efficiency Calculator
Computes fuel efficiency in km/L, L/100km, and miles per gallon from distance and fuel consumed.

### Grade Average (GPA) Calculator
Weighted GPA calculator supporting multiple subjects with individual credit values.

### Currency Converter
Live currency conversion across all major world currencies, powered by real-time exchange rate data.

### World Clock
Add and display current times for multiple cities and timezones simultaneously.

### Base Converter
Converts numbers between Decimal (Base 10), Binary (Base 2), and Hexadecimal (Base 16).

### Competitive Programming Calculator
A dedicated module for competitive programmers with the following built-in functions:

| Function    | Description                              |
|-------------|------------------------------------------|
| `mex`       | Minimum excludant of a set               |
| `gcd`       | Greatest Common Divisor                  |
| `lcm`       | Least Common Multiple                    |
| `isprime`   | Primality check                          |
| `nextp`     | Next prime after a given number          |
| `prevp`     | Previous prime before a given number     |
| `divisors`  | List all divisors of a number            |
| `p.factors` | Prime factorization                      |

Also supports bitwise operations: AND (`&`), OR (`|`), XOR (`^`), and modulo (`%`).

---

## Contributing

Contributions and suggestions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a pull request describing your changes.

---

## License

This project does not currently include a license file. All rights are reserved by the author unless otherwise stated. Contact the repository owner for usage permissions.

---

*Built by [Tanishq96sage](https://github.com/Tanishq96sage)*
