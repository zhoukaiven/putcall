function rand(min, max)
{
	return (Math.random() * (max - min) + min).toFixed(2) - 0; //force float
};

function randInt(min, max)
{
	return Math.floor( rand(min, max) );
};

function cents(num)
{
	return Math.floor( num*100.0) / 100.0;
}

/* The cummulative Normal distribution function: */
function CND(x)
{
	var a1, a2, a3, a4 ,a5, k ;

	a1 = 0.31938153, a2 =-0.356563782, a3 = 1.781477937, a4= -1.821255978 , a5= 1.330274429;

	if(x<0.0)
	{
		return 1-CND(-x);
	}
	else
	{
		k = 1.0 / (1.0 + 0.2316419 * x);
		return 1.0 - Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI) * k
			* (a1 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) ;
	}
}

/* The Black and Scholes (1973) Stock option formula */
function BS(S, K, T, r, v) 
{
	var d1, d2;
	d1 = (Math.log(S / K) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
	d2 = d1 - v * Math.sqrt(T);

	call = S * CND(d1)-K * Math.exp(-r * T) * CND(d2)
	put = K * Math.exp(-r * T) * CND(-d2) - S * CND(-d1)

	if(put < 0.01)
		put = 0.01;
	if(call < 0.01)
		call = 0.01
	return [cents(call), cents(put)];
}


function buildArray(values)
{ 
	hide = randInt(0,5);
	while(hide == 3) //remove "solve for K"
	{
		hide = randInt(0,5);
	}
	hidden = values[hide];
	values[hide] = "???";

	var put = values[0];
	var call = values[1];
	var S = values[2];
	var K = values[3];
	var rc = values[4];

	return [ 
				[ 
					['', 'S = '+S, 'r/c = '+rc ], ['Call', 'K', 'Put'], [call, K, put] 
				], 
				hidden
			];
};

function displayGame(put, call, S, K)
{
	var state = buildArray(put, call, S, K);
	var data = state[0];
	var answer = state[1];

	var table = document.createElement('table');
	table.border = 1;
	table.className = "table table-bordered table-striped table-center center-text"

	for(var i=0; i<data.length; i++)
	{
		var row = table.insertRow(i);
		for(var j=0; j<data[i].length; j++)
		{
			cell = row.insertCell(j);
			var text = document.createTextNode(data[i][j]);
			cell.appendChild(text);
			cell.className = "text-center";
		}
	}

	document.getElementById('board').appendChild(table);
	return answer;
};

function checkAnswer(input)
{
	inputArea = document.getElementById("inputArea");
	inputArea.innerHTML = "";
	if(missingVal == null || input!=missingVal)
	{
		var text = document.createTextNode("Wrong. Answer is "+missingVal);
		inputArea.appendChild(text);
	}
	else
	{
		inputArea.appendChild(document.createTextNode("Correct!"));
	}
	inputArea.className = "text-center";
	continueButton();
};

function continueButton()
{
	document.getElementById("status").innerHTML = "";

	var button = document.createElement('button');
	button.innerHTML = "Continue";
	button.onclick = function(){game();};
	button.className = "center-block btn btn-default btn-block";

	document.getElementById("status").appendChild(button);
};

function createForm()
{
	document.getElementById("inputArea").innerHTML = "";
	document.getElementById("status").innerHTML = "";

	var input = document.createElement('input');
	input.type = "number";
	input.name = "userInput";
	input.className = "center-block form-control";
	input.id = "inputBox";
	document.getElementById("inputArea").appendChild(input);

	var button = document.createElement('button');
	button.innerHTML = "Check";
	button.id = "check";
	button.onclick = function(){checkAnswer(input.value)};
	button.className = "center-block btn btn-default btn-block";
	document.getElementById("status").appendChild(button);
};

function game()
{
	document.getElementById("board").innerHTML = "";
	document.getElementById("inputArea").innerHTML = "";
	document.getElementById("status").innerHTML = "";

	K = 10.0*randInt(3,8) + 2.5*randInt(0,4)
	S = rand(K-10,K+10);
	
	T = 1.0/12.0;//rand(0.01, 0.1);
	r = rand(0.01, 0.20);	
	vol = rand(0.01, 1);

	options = BS(S, K, T, r, vol);
	call = options[0];
	put = options[1];

	rc = ( call - put - (S - K) ).toFixed(2) - 0.0;

	missingVal = displayGame( [put, call, S, K, rc] );
	createForm();
};