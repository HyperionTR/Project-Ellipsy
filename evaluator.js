//Primero: obtenemos el alfabeto del autómata

let alphabet=[];
const LAMBDA='λ';

function Transition(origin, label, destiny){
	this.origin=origin;
	this.label=label;
	this.destiny=destiny;
}

function CurrentConfig(state, parent, input, unprocessed){
	//Estado actual del automata
	this.state=state;
	//Configuración padre que produjo a esta configuración actual
	this.parent=parent;
	//Cadena de entrada
	this.input=input;
	//Cadena sin procesar
	this.unprocessed=unprocessed;
	//Veriica si la config. actual no es ella misma.
	this.equals=function(config){
		if(config.parent!==this.parent)
			return false;
		return this.state==config.state;
	}
	
	//Es verdadero si la cadena llevó al autómata a un estado de aceptación
	this.isAccepted=function(){
		if(unprocessed.length!==0)
			return false;
	}
}


function Automata(){
	//Configuración inicial
	this.states=[];
	this.transitions=[];
	this.finalStates=[];
	this.initialState=undefined;
	
	//Obtienes las transiciones, haciéndolas más fáciles de manejar
	this.getTransitions=function(){
		circles.forEach((circle,i,ar)=>{
			circle.connections.forEach((connection,j,con)=>{
				let transition=new Transition(circle,connection[2],connection[0]);
				this.transitions.push(transition);
			});
		});
	}
	
}

function Simulator(){

	//Arreglo con las posibles configuraciones iniciales del autómata
	this.configurations=[];
	this.getInitialConfig=function(input){};
	//Simula un paso para una configuracón en espeecial
	this.stepConfig=function(config){};
	//Ejecuta el input en el autómata
	this.simulateInput=function(input){};
	
		
}




function getAlphabet(){
	alphabet=[];
	let aut=new Automata();
	aut.getTransitions();
	
	aut.transitions.forEach((el,i,a)=>{
		let labels=el.label.split(/\,|\s/);
		labels.forEach((char,k,lab)=>{
			if(alphabet.indexOf(char)===-1 && (char!== " " && char!== "" && char!==32))
				alphabet.push(char);
		});
	});
	
	console.log(alphabet);
}
	
function isLambda(transition){
	return(transition.label===LAMBDA?true:false);
}

function isUselessNode(circle){
	return (circle.connections.length==0)? true : false;
}



