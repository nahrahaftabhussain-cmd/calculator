
const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.getElementById("buttons");
const angleRow = document.getElementById("angleRow");
const angleMode = document.getElementById("angleMode");

let mode = "simple";
let angle = "DEG";
let justCalculated = false;

function insert(value) {
    if (justCalculated) {
        if (/^[0-9.]$/.test(value) || value === "pi" || value === "e") {
            display.value = "";
        }
        justCalculated = false;
    }

    display.value += value;
}

function clearAll() {
    display.value = "";
    history.textContent = "";
    justCalculated = false;
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
    justCalculated = false;
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        throw new Error("Factorial needs an integer from 0 to 170");
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculate() {
    try {
        let expression = display.value;

        if (!expression.trim()) return;

        // Convert constants and mathematical operators
        expression = expression
            .replace(/\bpi\b/g, "PI")
            .replace(/\be\b/g, "E")
            .replace(/\^/g, "**")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)")
            .replace(/(\d+(?:\.\d+)?)!/g, "factorial($1)");

        // Allow only supported mathematical functions and constants
        const allowedNames = [
            "sin", "cos", "tan", "asin", "acos", "atan",
            "sqrt", "log", "ln", "factorial", "PI", "E"
        ];

        const identifiers = expression.match(/[a-zA-Z_]+/g) || [];

        if (identifiers.some(name => !allowedNames.includes(name))) {
            throw new Error("Invalid expression");
        }

        // Reject unsupported characters and operators
        if (!/^[0-9a-zA-Z_+\-*/().\s]*$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        // Convert degrees to radians for trigonometry
        const toRadians = x => angle === "DEG"
            ? x * Math.PI / 180
            : x;

        const fromRadians = x => angle === "DEG"
            ? x * 180 / Math.PI
            : x;

        const sin = x => Math.sin(toRadians(x));
        const cos = x => Math.cos(toRadians(x));
        const tan = x => Math.tan(toRadians(x));

        const asin = x => fromRadians(Math.asin(x));
        const acos = x => fromRadians(Math.acos(x));
        const atan = x => fromRadians(Math.atan(x));

        const sqrt = x => Math.sqrt(x);
        const log = x => Math.log10(x);
        const ln = x => Math.log(x);
        const PI = Math.PI;
        const E = Math.E;

        // Evaluate with only the explicitly provided math helpers
        const result = Function(
            "sin", "cos", "tan", "asin", "acos", "atan",
            "sqrt", "log", "ln", "factorial", "PI", "E",
            '"use strict"; return (' + expression + ');'
        )(
            sin, cos, tan, asin, acos, atan,
            sqrt, log, ln, factorial, PI, E
        );

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Math error");
        }

        history.textContent = display.value + " =";
        display.value = String(
            Number(result.toPrecision(12))
        );
        justCalculated = true;

    } catch (error) {
        history.textContent = "Invalid calculation";
        display.value = "";
        justCalculated = false;
    }
}

// Handle calculator button clicks
buttons.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.value !== undefined) {
        insert(button.dataset.value);
    }

    switch (button.dataset.action) {
        case "clear":
            clearAll();
            break;
        case "delete":
            deleteLast();
            break;
        case "calculate":
            calculate();
            break;
    }
});

// Switch between simple and scientific modes
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        mode = tab.dataset.mode;

        document.querySelectorAll(".tab").forEach(item => {
            item.classList.toggle("active", item === tab);
        });

        document.querySelectorAll(".scientific").forEach(button => {
            button.hidden = mode === "simple";
        });

        angleRow.hidden = mode === "simple";
    });
});

// Toggle degrees and radians
angleMode.addEventListener("click", () => {
    angle = angle === "DEG" ? "RAD" : "DEG";
    angleMode.textContent = angle;
});

// Keyboard support
document.addEventListener("keydown", event => {
    if (/^[0-9.+\-*/()%^!]$/.test(event.key)) {
        event.preventDefault();
        insert(event.key);
    } else if (event.key === "Enter") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "(" || event.key === ")") {
        insert(event.key);
    }
});

// Start in simple mode
document.querySelectorAll(".scientific").forEach(button => {
    button.hidden = true;
});
