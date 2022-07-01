//色々事故があったせいで時間が足りないため色々おかしかったり実装しきれていないところがある
//しかも後から機能を何も計画立てずに追加したせいでグローバル変数使いまくったり関数も雑で冗長なうえに読みずらいスパゲッティコードになってる
//何度も言うように時間的都合により配列などを使わずにevalとdivの中身だけで計算する

//三次元配列
//一次元目が行の配列、二次元目が行、三次元目が表記とhtmlのbuttonタグに使うid(表記とidで分けてるのはidに使えない?文字列が含まれるため)と後の処理で使うためのカテゴライズ名が格納されている
const calcElementsList = 
[
    [["^","power","Operator"],["Del","del","Delete"],["AC","ac","AllClear"],["÷","division","Operator"]],
    [["(","bracketStart","BracketStart"],[")","bracketEnd","BracketEnd"],["%","mod","Operator"],["×","multiply","Operator"]],
    [["7","num7","Number"],["8","num8","Number"],["9","num9","Number"],["-","subtract","Operator"]],
    [["4","num4","Number"],["5","num5","Number"],["6","num6","Number"],["+","sum","Operator"]],
    [["1","num1","Number"],["2","num2","Number"],["3","num3","Number"],["=","equal","Calculate"]],
    [["+/-","sign","Sign"],["0","num0","Number"],[".","point","Point"]]
]


//右辺入力中かどうか確認する 詳細は後述
let isRightInput = false;

//閉じられていない括弧の数を格納する変数
let unclosedBracketCount = 0;

// 
let isPointAdded = false;

//マイナスかどうか
let isNegative = false;

//計算用関数 なお時間的都合によりevalを使うので下記の計算関数は使わない
/*
function power(a,b)
{
    return Math.pow(a,b);
}

function log(a)
{
    return Math.log(a);
}

function mod(a,b)
{
    return a % b;
}

function sum(a,b)
{
    return a+b;    
}

function subtract(a,b)
{
    return a-b;
}

function multiply(a,b)
{
    return a*b;
}

function divide(a,b)
{
    return a/b;
}
*/

//#calcResultに追記する
function addStrToResult(str)
{
    insertStrToResult(str,$("#calcResult").html().length);
    return;
}

//渡された位置の次の位置に挿入 "abd"で"c",1だったら"abcd"になる -1にすると先頭に挿入
function insertStrToResult(str,index)
{
    let calcResult = $("#calcResult");
    let calcResultHtml = calcResult.html();
    if (index < 0)
    {
        calcResult.html(str+calcResultHtml)
    }
    else
    {
        calcResult.html(calcResultHtml.substring(0,index+1) + str + calcResultHtml.substring(index+1));
    }
    calcResult.html(calcResultHtml.substring(0,index+1) + str + calcResultHtml.substring(index+1));
    return;
}


function deleteResult(index,length)
{
    let calcResult = $("#calcResult");
    calcResult.html(calcResult.html().substring(0,index)+calcResult.html().substring(index+length));
    return;
}

//式を評価(計算)する
function evaluateFormula()
{
    let formula = $("#calcResult").html().replaceAll("×","*").replaceAll("÷","/").replaceAll("^","**"); 
    //時間の都合上evalで実装
    calculatedResult = eval(formula);
    if (calculatedResult < 0)
    {
        calculatedResult = "(" + calculatedResult + ")";
    }
    return calculatedResult;
}

//式を配列に変換
function formulaToArray()
{
    let calcResultHtml = $("#calcResult").html();
    const separatorRegex = /\+|-|×|÷|%|\^|\(|\)/;
    let formulaArray = [];
    let temp = "";
    for (let i = 0; i < calcResultHtml.length; i++)
    {
        let slicedString = calcResultHtml[i];
        if (separatorRegex.test(slicedString))
        {
            if (temp != "")
            {
                formulaArray.push(temp);
                temp = "";
            }
            formulaArray.push(slicedString);
        }
        else
        {
            temp += slicedString;
        }
    }
    return formulaArray;
}

//最後の演算子を取得
function searchSeparators()
{
    let formulaArray = formulaToArray();
    const separatorRegex = /\+|-|×|÷|\%|\^|\(|\)/;
    let separators = [];
    formulaArray.forEach(item => 
    {
        if (separatorRegex.test(item))
        {
            separators.push(item);
        }
    });
    return separators;
}

//入力を数式的に正しいか検証するとともに画面に反映する
function applyChangeToFormula(operation,category)
{
    //今更だけど変数名&id名あんまりよくなかったかも(resultが結果だけでなく式入力の役割も担ってる)
    let calcResult = $("#calcResult");
    let calcFormula = $("#calcFormula");
    let calcInfo = $("#calcInfo");

    const lastString = calcResult.html()[calcResult.html().length-1];
    const separators = searchSeparators();
    const lastSeparator = separators[separators.length-1];
    const lastSeparatorIndex = calcResult.html().lastIndexOf(lastSeparator);

    const operatorRegex = /\+|-|×|÷|\^|%/;
    const numberRegex = /0|1|2|3|4|5|6|7|8|9|0/;
    
    calcInfo.html("");
    //押されたボタンの種類によって処理を分岐
    switch (category)
    {
        case "AllClear":
            calcResult.html("0");
            calcFormula.html("");
            unclosedBracketCount = 0;
            isRightInput = false;
            isPointAdded = false;
            isSign = false;
            break;

        case "Delete":
            if (lastString == "(")
            {
                unclosedBracketCount -= 1;
            }
            else if (lastString == ")")
            {
                if (separators[separators.length-2] == "-" && separators[separators.length-3] == "(")
                {
                    deleteResult(calcResult.html().length-1,1);
                    unclosedBracketCount -= 1;
                    isNegative = true;
                }
                unclosedBracketCount += 1;
            }
            else if (isNegative && numberRegex.test(lastString) && calcResult.html()[calcResult.html().length-2] == "-")
            {
                isNegative = false;
                //マイナスを消す
                calcResult.html(calcResult.html().substring(0,calcResult.html().length-2));
            }
            //正規表現による文字列判定
            else if (operatorRegex.test(lastString))
            {
                isRightInput = false;
            }
            else if (lastString == ".")
            {
                isPointAdded = false;
            }


            //最後の文字を消す
            calcResult.html(calcResult.html().substring(0,calcResult.html().length-1));
            if (calcResult.html() == "")
            {
                calcResult.html("0");
            }
            break;

        case "Number":
            if (calcResult.html() == "0")
            {
                calcResult.html(operation);
                isRightInput = false;
            }
            else if (lastString != ")")
            {
                addStrToResult(operation);
                isRightInput = false;
            }
            break;

        case "Operator":
            isPointAdded = false;
            if (isRightInput)
            {
                calcResult.html(calcResult.html().substring(0,calcResult.html().length-1));
                addStrToResult(operation)
            }
            else if (isNegative)
            {
                addStrToResult(")");
                addStrToResult(operation);
                isNegative = false;
            }
            else if (calcResult.html() != "0")
            {
                addStrToResult(operation);
                isRightInput = true;
            }

            break;

        case "BracketStart":
            if (calcResult.html() == "0")
            {
                calcResult.html(operation)
                unclosedBracketCount += 1;
            }
            else if (lastString == "(")
            {
                addStrToResult(operation);
                unclosedBracketCount += 1;
            }
            else if (numberRegex.test(lastString))
            {
                if (!isNegative)
                {
                    if (lastSeparatorIndex.length > 0)
                    {
                        insertStrToResult(operation,-1)
                    }
                    else
                    {
                        insertStrToResult(operation,lastSeparatorIndex);
                    }
                }
                else
                {
                    insertStrToResult(operation,lastSeparatorIndex-1); 
                }
                unclosedBracketCount += 1;
            }
            else if (operatorRegex.test(lastString))
            {
                addStrToResult(operation);
                unclosedBracketCount += 1;
                isRightInput = false;  
            }  
            break;
        case "BracketEnd":
            if (lastString == "(")
            {
                addStrToResult("0"+operation);
            }
            else if (unclosedBracketCount > 0)
            {
                if (numberRegex.test(lastString) || isNegative)
                {
                    addStrToResult(operation)
                    isNegative = false;
                    unclosedBracketCount -= 1;
                }
                
            }
            break;

        case "Sign":
            if (calcResult.html() != "0" && numberRegex.test(lastString))
            {
                if (lastSeparator == "(")
                {
                    if (!isNegative)
                    {
                        insertStrToResult("(-",lastSeparatorIndex);
                        isNegative = true;
                        unclosedBracketCount += 1;
                    }
                    else
                    {
                        deleteResult(lastSeparatorIndex,1)
                        isNegative = false;
                        unclosedBracketCount -= 1;
                    }
                    break;
                }
                else if (lastSeparator == "")
                {
                    if (!isNegative)
                    {
                        calcResult.html("(-"+calcResult.html());
                        isNegative = true;
                        unclosedBracketCount += 1;
                    }
                    else
                    {
                        calcResult.html(calcResult.html().substring(3))
                        isNegative = false;
                        unclosedBracketCount -= 1;
                    }
                    break;
                }
                else if (!isNegative)
                {
                    insertStrToResult("(-",lastSeparatorIndex);
                    isNegative = true;
                    unclosedBracketCount += 1;
                }
                else
                {
                    deleteResult(lastSeparatorIndex-1,2);
                    isNegative = false;
                    unclosedBracketCount -= 1;
                }
            }
            break;
        case "Point":
            if (!isPointAdded && numberRegex.test(lastString))
            {
                addStrToResult(operation)
                isPointAdded = true;
            }
            break;
        case "Calculate":
            //演算子で終わっていないか
            if (!isRightInput)
            {
                //括弧の数は適切か
                if (unclosedBracketCount % 2 == 0)
                {
                    if (lastString == ".") addStrToResult("0");
                    calcFormula.html(calcResult.html());
                    calcResult.html(evaluateFormula());
                    break;    
                }
            }
            $("#calcInfo").html("式が不完全です。");
            break;
    }
    return true;
}

//電卓のボタンを生成
function createCalcButton(calcElementsList,calcButtons)
{
    
    for (let i = 0; i < calcElementsList.length; i++) 
    {
        let calcElementsRow = $("<tr></tr>");
        for (let j = 0; j < calcElementsList[i].length; j++) 
        {
            calcElementsRow.append($('<td><button id="' + calcElementsList[i][j][1] + '">' + calcElementsList[i][j][0] + '</button></td>'));
        }
        calcButtons.append(calcElementsRow);
    }
}

//ボタンにイベントを設定
function setCalcFunction(calcElementsList)
{
    for (let i = 0; i < calcElementsList.length; i++) 
    {
        for (let j = 0; j < calcElementsList[i].length; j++) 
        {
            $("#"+calcElementsList[i][j][1]).click(
            function()
            {
                applyChangeToFormula(calcElementsList[i][j][0],calcElementsList[i][j][2]);
            });
        }
    }
}



//ready関数
//今更だけど関数の分け方あんまりよくなかったかも
$(function()
    {    
        const calcButtons = $("#calculatorButtons");
        createCalcButton(calcElementsList,calcButtons);
        setCalcFunction(calcElementsList);
    }
);

