// simplex
function solveSimplex(quantDec, quantRes, choice) {
	$("#inputValues").hide();

	var matrizSimplex = getRestrictionValues(quantDec, quantRes); 
	matrizSimplex.push(getFunctionzValues(quantDec, quantRes)); 

	var allTables = [];

	var tablesCount = 0;

	var stopConditionValue = 0;

	var iMax = $('#iMax').val()
	if (iMax <= 0) {
		iMax = 20;
	}
	console.log(iMax)

	var bValues = []

	staticTblVars = staticTableVars(quantDec, quantRes);
	varsOnBase = staticTblVars[0];
	varsOnHead = staticTblVars[1];


	columnsCount = quantDec + quantRes + 1;
	rowsCount = quantRes + 1;

	for (let i = 0; i < rowsCount; i++) {
		console.log(matrizSimplex[i][columnsCount - 1])
		bValues.push(matrizSimplex[i][columnsCount - 1])
	}

	matrizToTable(matrizSimplex, "Inicial", varsOnHead, varsOnBase, rowsCount, allTables, 0);
	tablesCount++

	do {
		lowerNumberAndColumn = getLowerNumberAndColumn(matrizSimplex, rowsCount, columnsCount);
		lowerNumber = lowerNumberAndColumn[0];
		if (lowerNumber == 0) {
			break;
		}
		columnLowerNumber = lowerNumberAndColumn[1];

		whoLeavesResults = whoLeavesBase(matrizSimplex, columnLowerNumber, columnsCount, rowsCount, varsOnBase);
		varsOnBase = whoLeavesResults[1];
		pivoRow = whoLeavesResults[0]
		pivoColumn = columnLowerNumber;
		pivoValue = matrizSimplex[pivoRow][pivoColumn];
		matrizSimplex = divPivoRow(matrizSimplex, columnsCount, pivoRow, pivoValue);
		matrizSimplex = nullColumnElements(matrizSimplex, pivoRow, pivoColumn, rowsCount, columnsCount);
		funczValues = matrizSimplex[rowsCount - 1];

		hasNegativeOrPositive = funczValues.some(v => v < 0);

		stopConditionValue += 1;

		if (stopConditionValue == iMax) {
			break;
		}
 
		if (hasNegativeOrPositive == true) {
			matrizToTable(matrizSimplex, "Parcial" + stopConditionValue, varsOnHead, varsOnBase, rowsCount, allTables, tablesCount);
			tablesCount++
		}

	} while (hasNegativeOrPositive == true);

	matrizToTable(matrizSimplex, "Final", varsOnHead, varsOnBase, rowsCount, allTables, tablesCount);
	senseTable(matrizSimplex, varsOnHead, varsOnBase, quantDec, bValues)
	if (choice == 1) {
		$(".container").append(allTables[stopConditionValue]);
		printResults(matrizSimplex, quantDec, quantRes, columnsCount, varsOnBase);
	} else {
		for (let i = 0; i < allTables.length; i++) {
			$(".container").append(allTables[i]);
		}
		printResults(matrizSimplex, quantDec, quantRes, columnsCount, varsOnBase);
	}6
}

function senseTable(matriz, head, base, quantDec, bValues) {


	var matrizTable = [];
	var headTable = [];
	var baseTable = [];

	var restNames = []
	var restValues = []
	var minMaxValues = []


	for (let i = 0; i < matriz.length; i++) {
		matrizTable[i] = matriz[i].slice();
	}

	for (let i = 0; i < head.length; i++) {
		headTable[i] = head[i].slice();
	}

	for (let i = 0; i < base.length; i++) {
		baseTable[i] = base[i].slice();
	}


	matrizTable.unshift(headTable);

	for (let i = 1, j = 0; i <= rowsCount; i++, j++) {
		matrizTable[i].unshift(baseTable[j]);
	}


	for (let i = quantDec + 1, k = 0; i < matrizTable[0].length - 1; k++, i++) {
		restNames.push(matrizTable[0][i])
		restValues.push(matrizTable[matrizTable.length - 1][i])
		let auxArray = new Array;
		for (let j = 1; j < matrizTable.length - 1; j++) {
			let bCol = matrizTable[j][matrizTable[0].length - 1]
			let restCol = matrizTable[j][i]

			auxArray.push((bCol / restCol) * -1);
		}
		let minPos = Number.POSITIVE_INFINITY;
		let maxNeg = Number.NEGATIVE_INFINITY;
		for (let j = 0; j < auxArray.length; j++) {
			if (auxArray[j] > 0 && auxArray[j] < minPos) {
				minPos = auxArray[j]
			} else if (auxArray[j] < 0 && auxArray[j] > maxNeg) {
				maxNeg = auxArray[j]
			}
		}
		if (minPos === Number.POSITIVE_INFINITY) {
			minPos = 0
		}
		if (maxNeg === Number.NEGATIVE_INFINITY) {
			maxNeg = 0
		}
		minMaxValues.push([maxNeg + bValues[k], minPos + bValues[k]])
	}

	var senseMatriz = [];

	for (let i = 0; i < matrizTable.length - 2; i++) {
		let auxArray = new Array;
		auxArray.push(restNames[i])
		auxArray.push(restValues[i])
		senseMatriz.push(auxArray)
	}

	for (let i = 0; i < senseMatriz.length; i++) {
		for (let j = 0; j < minMaxValues[0].length; j++) {
			senseMatriz[i].push(minMaxValues[i][j])
		}
		senseMatriz[i].push(bValues[i]);
	}


	senseMatriz.unshift(['Recursos', 'Preco Sombra', 'Min', 'Max', 'Inicial']);

	$(".container").append('<hr><div id="divSenseTable" class="offset-md-2 col-md-8 offset-md-2 table-responsive"><div class="row"><h3>Tabela de Sensibilidade:</h3></div></div>')
	$(".container").append('<div class="row"><div id="divSenseTable" class="offset-md-2 col-md-8 offset-md-2 table-responsive"><table id="senseTable" class="table table-bordered"></table></div></div><hr>')
	var table = $("#senseTable");
	var row, cell;

	for (let i = 0; i < senseMatriz.length; i++) {
		row = $('<tr />');
		table.append(row);
		for (let j = 0; j < senseMatriz[i].length; j++) {
			if (!isNaN(senseMatriz[i][j])) {
				cell = $('<td>' + (Math.round(senseMatriz[i][j] * 100) / 100) + '</td>')
			} else {
				cell = $('<td>' + senseMatriz[i][j] + '</td>')
			}

			row.append(cell);
		}
	}




}
function matrizToTable(matriz, divName, head, base, rowsCount, allTables, aux) {
	$("#auxDiv").html('<div class="row"><div id="divTable' + divName + '" class="offset-md-2 col-md-8 offset-md-2 table-responsive"><div class="row"><h3>Tabela ' + divName + ':</h3></div><table id="table' + divName + '" class="table table-bordered"></table></div></div>')
	var table = $("#table" + divName);
	var row, cell;
	var matrizTable = [];
	var headTable = [];
	var baseTable = [];

	for (let i = 0; i < matriz.length; i++) {
		matrizTable[i] = matriz[i].slice();
	}

	for (let i = 0; i < head.length; i++) {
		headTable[i] = head[i].slice();
	}

	for (let i = 0; i < base.length; i++) {
		baseTable[i] = base[i].slice();
	}

	$("#firstPhase").remove();
	$("#startInputs").hide();
	$("#stepByStep	").remove();

	matrizTable.unshift(headTable);
	for (let i = 1, j = 0; i <= rowsCount; i++, j++) {
		matrizTable[i].unshift(baseTable[j]);
	}

	for (let i = 0; i < matrizTable.length; i++) {
		row = $('<tr />');
		table.append(row);
		for (let j = 0; j < matrizTable[i].length; j++) {
			if (!isNaN(matrizTable[i][j])) {
				cell = $('<td>' + (Math.round(matrizTable[i][j] * 100) / 100) + '</td>')
			} else {
				cell = $('<td>' + matrizTable[i][j] + '</td>')
			}

			row.append(cell);
		}
	}
	allTables[aux] = $('#divTable' + divName + '')[0].outerHTML;
}

//mostra resultados
function printResults(matriz, quantDec, quantRes, columnsCount, base) {
	if (($("#min").is(':checked'))) {
		var zValue = matriz[matriz.length - 1][columnsCount - 1] * -1;

	} else {
		var zValue = matriz[matriz.length - 1][columnsCount - 1]
	}

	$("#results").append('<div class="col-md-12">A solução ótima é Z = ' + (Math.round(zValue * 100) / 100) + '</div><br>');
	$("#results").append('<div> Variáveis Básicas </div>')
	for (let i = 0; i < quantRes; i++) {
		var baseName = base[i];
		var baseValue = matriz[i][columnsCount - 1];
		$("#results").append('<div>' + baseName + ' = ' + (Math.round(baseValue * 100) / 100) + '</div>')
	}

}

function staticTableVars(quantDec, quantRes) {
	base = [];
	head = [];

	for (let i = 0; i < quantRes; i++) {
		base.push("R" + (i + 1));
	}
	base.push("Z");
	head.push("Base");
	for (let i = 0; i < quantDec; i++) {
		head.push("X" + (i + 1));
	}
	for (let i = 0; i < quantRes; i++) {
		head.push("R" + (i + 1));
	}
	head.push("B");

	return [base, head];
}

function nullColumnElements(matriz, pivoRow, pivoColumn, rowsCount, columnsCount) {

	for (let i = 0; i < rowsCount; i++) {

		if (i == pivoRow || matriz[i][pivoColumn] == 0) {
			continue;
		}
		pivoAux = matriz[i][pivoColumn];

		for (let j = 0; j < columnsCount; j++) {
			matriz[i][j] = (matriz[pivoRow][j] * (pivoAux * -1)) + matriz[i][j];
		}

	}
	return matriz
}


function divPivoRow(matriz, columnsCount, pivoRow, pivoValue) {
	for (var i = 0; i < columnsCount; i++) {
		matriz[pivoRow][i] = matriz[pivoRow][i] / pivoValue;
	}

	return matriz;
}

function whoLeavesBase(matriz, columnLowerNumber, columnsCount, rowsCount, varsOnBase) {
	var lowerResult = 99999999999999999999999;
	var lowerResultRow;

	for (let i = 0; i < rowsCount - 1; i++) {
		if (!(matriz[i][columnLowerNumber] == 0)) {
			currentValue = 0;
			currentValue = matriz[i][columnsCount - 1] / matriz[i][columnLowerNumber]

			if (currentValue > 0) {
				if (currentValue < lowerResult) {
					lowerResult = currentValue;
					lowerResultRow = i;
				}
			}

		}
	}
	if (lowerResultRow == undefined) {
		pauseSolution()
	} else {
		varsOnBase[lowerResultRow] = "X" + (columnLowerNumber + 1)
		return [lowerResultRow, varsOnBase];
	}

}

function getRestrictionValues(quantDec, quantRes) {
	var resValues = [];
	var xvalue = [];
	for (let i = 1; i <= quantRes; i++) {
		xvalue = [];

		for (let j = 1; j <= quantDec; j++) {

			var input = $("input[name='X" + j + "_res" + i + "']").val();

			if (input.length == 0) {
				xvalue[j - 1] = 0;
			} else {
				xvalue[j - 1] = parseFloat(input);
			}


		}
	
		for (let j = 1; j <= quantRes; j++) {
			if (i == j) {
				xvalue.push(1);
			} else {
				xvalue.push(0);
			}
		}

		var input_res = $("input[name='valRestriction" + i + "']").val();

		if (input_res.length == 0) {
			xvalue.push(0);
		} else {
			xvalue.push(parseFloat(input_res));
		}

		resValues[i - 1] = xvalue;

	}
	console.log(resValues);
	return resValues;
}

function getFunctionzValues(quantDec, quantRes) {
	var funcValues = [];
	var xvalue = [];

	var maxOrMin = (($("#max").is(':checked')) ? -1 : 1);

	for (let i = 1; i <= quantDec; i++) {
		var input = $("input[name='valX" + i + "']").val()

		if (input.length == 0) {
			xvalue[i - 1] = 0;
		} else {
			xvalue[i - 1] = parseFloat(input) * maxOrMin;
		}

	}
	funcValues = xvalue;

	for (let i = 0; i <= quantRes; i++) {
		funcValues.push(0);
	}

	return funcValues;
}

function getLowerNumberAndColumn(matriz, rowCount, columnCount) {
	var column = 0;

	rowCount -= 1;

	var lowerNumber = matriz[rowCount][0];

	for (let j = 1, i = rowCount; j < columnCount - 1; j++) {
		if (matriz[i][j] < lowerNumber) {
			lowerNumber = matriz[i][j];
			column = j;
		}
	}
	return [lowerNumber, column];
}

function pauseSolution() {
	$(".container").remove()

	$("body").append('<div class="container"><div class="row"><div class="offset-md-2 col-md-8 offset-md-2"><h1>Solução Impossível</h1></div></div></div>');
	$(".container").append('<div class="row"><div class="offset-md-4 col-md-4 offset-md-4"><button id="back" class="btn-inicio" onclick="location.reload();" >Voltar</button></div>	</div>')
}

function PrimeiroPasso() {
	$(document).ready(function () {

		var quantDec = $("input[name=quantDecision]").val();
		if (quantDec.length == 0 || quantDec == '0') {
			alert('Você precisa inserir valores na variavel de decisão');
			return;
		} else {
			quantDec = parseFloat(quantDec);
			if (quantDec < 1) {
				return;
			}
		}

		var quantRes = $("input[name=quantRestriction]").val();
		if (quantRes.length == 0 || quantRes == '0') {
			alert('Você precisa inserir valores na variavel de restrição');
			return;
		} else {
			quantRes = parseFloat(quantRes);
			if (quantRes < 1) {
				return;
			}
		}

		$("#inputValues").remove();

		generateFunctionZ(quantDec);

		generateRestrictions(quantDec, quantRes);

		$("#inputValues").append('<div id="buttons" class="row"><div class="col-md-6 mt-3"></div></div>');

		$(".container").append('<div id="solution" class="row"></div>')
		$(".container").append('<br><div class="row"><div id="results" class="col-md"></div></div>');

		$("#buttons").append('<div class="offset-md-3 col-md-6 offset-md-3 mt-3"><button id="stepByStep" onclick="solveSimplex(' + quantDec + ',' + quantRes + ',2)" class="btn btn-primary btn-next">Gerar Tabelas</button></div>');

	});
}

function generateFunctionZ(quantDec) {


	$(".container").append('<div id="inputValues"></div>');
	$("#inputValues").append('<br><div class="row"><div class="input-group mb-3 d-flex justify-content-center align-items-center" id="funcZ"></div></div>');


	$("#funcZ").append('<h5>Z =</h5><span class="px-2">');
	for (let i = 1; i <= quantDec; i++) {

		$("#funcZ").append('<input class="input-val" type="number" name="valX' + i + '">');
		if (i != quantDec) {
			$("#funcZ").append('<div><span class="m-text">x' + i + ' + </span></div>');
		} else {
			$("#funcZ").append('<div><span>x' + i + '</span></div>');
		}
	}
	var input = $('input[name="valX1"]');

	var input = $('input[name="valX1"]');

	input.focus();
}

function generateRestrictions(quantDec, quantRes) {

	$("#inputValues").append('<div class="row"><div class="col-md-12 mb-3 mt-3" id="divRestTitle"><h5>Informe as Restrições:</h5></div></div>');

	for (let i = 1; i <= quantRes; i++) {

		$("#inputValues").append('<div class="row"><div class="input-group mb-3 d-flex justify-content-center align-items-center" id=divRes' + i + '></div></div>');

		for (let j = 1; j <= quantDec; j++) {
			$("#divRes" + i + "").append('<input class="input-val" type="number" name="X' + j + '_res' + i + '" " >');
			if (j != quantDec) {
				$("#divRes" + i).append('<div><span class="input-val">x' + j + ' + </span></div>');
			} else {
				$("#divRes" + i).append('<div><span>x' + j + ' </span></div>');
			}
		}
		$("#divRes" + i).append('<span></span><div><span class="equal-m"><b>&le;</b></span></div><input class="input-val" type="number" name="valRestriction' + i + '">');
	}


}
