let display = document.getElementById("display");
let error = document.getElementById("error");

function appendToDisplay(value) {
    error.value = "";

    if (display.value === "0" && value != ".")
    {
        display.value = value;
    }
    else if (display.value === "0" && value === ".")
    {
        display.value = "0.";
    }
    else
    {
        display.value += value;
    }
}

function appendOperator(operator) {
    error.value = "";

    if(display.value == "0")
        return;
    if (/[+\-×÷^r]$/.test(display.value)) 
    {
        display.value = display.value.slice(0, -1) + operator;
    }
    else 
    {
        display.value += operator;
    }
}

let numerbth = document.querySelectorAll(".skaicius");

numerbth.forEach(button => {
    if (button.classList.contains("c") || button.classList.contains("dot"))
    {
        return;
    }

    button.addEventListener("click", () => {
        appendToDisplay(button.innerText);
    });
});

document.querySelector(".dot").addEventListener("click", () => {
    let part = display.value.split(/[+\-×÷^r]/);
    let current = part[part.length - 1];

    if (!current.includes("."))
    {
        appendToDisplay(".");
    }
});

function clearAll() {
    display.value = "0";
    error.value = "";
};

function clear() {
    display.value = display.value.slice(0, -1) || "0";
    error.value = "";
};

document.querySelector(".AC").addEventListener("click", clearAll);
document.querySelector(".c").addEventListener("click", clear);

document.querySelectorAll(".pag_funk").forEach(button => {
    button.addEventListener("click", () => {
        const operator = button.innerText;

        if (["+", "-", "×", "÷"].includes(operator)) 
        {
            appendOperator(operator);
        }
    });
});

document.querySelectorAll(".functions").forEach(button => {
    button.addEventListener("click", () => {
        const text = button.innerText.trim();
        error.value = "";

        if (text === "(" || text === ")") 
        {
            if (display.value === "0") display.value = text;
            else display.value += text;
        }
        else if (text === "x²") 
        {
            try 
            {
                let val = calculate(display.value);

                if (typeof val !== "number" || !Number.isFinite(val)) 
                {
                    throw new Error("Klaida: netinkamas skaičius.");
                }

                display.value = String(val * val);
                error.value = "";
            } 
            catch (err) 
            {
                error.value = err.message;
            }
        }
        else if (text === "²√x") 
        {
            try 
            {
                let val = calculate(display.value);

                if (val < 0) 
                {
                    throw new Error("Klaida: neigiamo skaičiaus kvadratinė šaknis negalima.");
                }

                display.value = String(Math.sqrt(val));
                error.value = "";
            } 
            catch (err) 
            {
                error.value = err.message;
            }
        }
        else if (text === "+/-") 
        {
            if (display.value.startsWith("-")) 
            {
                display.value = display.value.slice(1);
            } 
            else if (display.value !== "0") 
            {
                display.value = "-" + display.value;
            }
        }
        else if (text === "x!") 
        {
            let val = Number(display.value);
            if (!Number.isInteger(val) || val < 0)
            {
                error.value = "Klaida: faktorialas galimas tik neneigiamiems sveikiesiems skaičiams.";
            }
            else
            {
                let fact = 1;
                for (let i = 1; i <= val; i++) fact *= i;
                display.value = fact;
            }
        } 
        else if (text === "xⁿ") 
        {
            appendOperator("^");
        }
        else if (text === "ⁿ√x")
        {
            appendOperator("r");
        }
    });
});

function calculate(expression) {
    let forma = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\s/g, "");
     
    let poz = 0;
    function peek() {
        return forma[poz];
    }
    function consume() {
        return forma[poz++];
    }
    function number() {
        let start = poz;

        if (forma[poz] === '-' || forma[poz] === '+')
            poz++;

        let digits = 0;
        while ( poz < forma.length && forma[poz] >= "0" && forma[poz] <= "9") 
        {
            poz++;
            digits++;
        }

        if (forma[poz] === ".") 
        {
            poz++;

            while (poz < forma.length && forma[poz] >= "0" && forma[poz] <= "9") 
            {
                poz++;
                digits++;
            }
        }

        let str = forma.substring(start, poz);

        if (digits === 0) 
        {
            throw new Error("Klaida: neteisingas skaičius.");
        }
        return Number(str);
    }

    function priority() {
        let val;

        if (peek() === '(') 
        {
            consume();
            val = simple();
            if (peek() !== ')') 
            {
                throw new Error("Klaida: trūksta uždaromojo skliausto.");
            }
            consume();
        }
        else 
        {
            val = number();
        }

        if (peek() === '^')
        {
            consume();
            let laip = priority();
            val = Math.pow(val, laip);
        }
        else if (peek() === 'r')
        {
            consume();
            let laipsnis = priority();

            if (val < 0 && laipsnis % 2 === 0)
            {
                throw new Error("Klaida: neigiamo skaičiaus lyginė šaknis negalima.");
            }

            if (laipsnis === 0)
            {
                throw new Error("Klaida: šaknies laipsnis negali būti nulis.");
            }

            val = Math.sign(val) * Math.pow(Math.abs(val), 1 / laipsnis);
        }
        return val;
    }

    function daug() {
        let val = priority();

        while (peek() === '*' || peek() === '/')
        {
            let op = consume();
            let nextVal = priority();
            if (op === '*')
            {
                val *= nextVal;
            }
            else
            {
                if (nextVal === 0)
                {
                    throw new Error("Klaida: dalyba iš nulio negalima.");
                }
                else
                {
                    val /= nextVal;
                }
            }
        }
        return val;
    }

    function simple() {
        let val = daug();
        while (peek() === '+' || peek() === '-')
        {
            let op = consume();
            let nextVal = daug();
            if (op === '+')
                val += nextVal;
            else
                val -= nextVal;
        }
        return val;
    }
      
    let result = simple();

    if (poz < forma.length)
    {
     throw new Error("Klaida: neteisinga sintaksė.");
    }

    if (!Number.isFinite(result)) 
    {
        throw new Error("Klaida: rezultatas nėra baigtinis.");
    }
                //!!!!!!!!
    return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
}

document.querySelector(".equal-btn").addEventListener("click", () => {
    try {
        let rez = calculate(display.value);

        display.value = String(rez);
        error.value = "";
    } catch (err) {
        error.value = err.message;
    }
});