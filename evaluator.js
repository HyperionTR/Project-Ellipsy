//Primero: obtenemos el alfabeto del autómata

let alphabet=[];
const LAMBDA='λ';

function Transition(origin, label, destiny){
	this.origin=origin;
	this.label=label;
	this.destiny=destiny;
}

function Configuration(state, parent, input, unprocessed){
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
		
	}
}


function Automata(){
	//Configuración inicial
	this.states=circles;
	this.transitions=[];
	this.finalStates=[];
	this.initialState=undefined;
	
	
	
	//Obtienes las transiciones, haciéndolas más fáciles de manejar
	this.getTransitions=function(){
		this.transitions=[];
		circles.forEach((circle,i,ar)=>{
			circle.connections.forEach((connection,j,con)=>{
				let transition=new Transition(circle,connection[2],connection[0]);
				this.transitions.push(transition);
			});
		});
		return this.transitions;
	}
	
	this.getTransitionsFromState=function(from){
		let transitions=[];
		from.connections.forEach((el,i,a)=>{
			transitions.push(new Transition(from,el[2],el[0]));
		});
		console.log("Salen:"+transitions);
		return transitions;
	}
	
	this.getTransitionsToState=function(stateTo){
		let transitions=[];
		this.transitions.forEach((el,i,a)=>{
			if(el.destiny==stateTo)
				transitions.push(el);
		});
		console.log("Entran"+transitions);
		return transitions;
	}
	
	this.getInitialState=function(){
		this.states.forEach((el,i,a)=>{
			if(el.type===1){
				this.initialState=el;
				return;
			}
		});
		return this.initialState;
	}
	
	this.getFinalStates=function(){
		this.states.forEach((el,i,a)=>{
			if(el.type==2){
				this.finalStates.push(el);
			}
		});
		return this.finalStates;
	}
	
}

function Simulator(automata){

	//Arreglo con las posibles configuraciones iniciales del autómata
	this.configurations=[];
	
	this.getInitialConfig=function(input){
		this.configurations.push(new Configuration(automata.getInitialState(),undefined,input,input));
		console.log(this.configurations[0]);
		return this.configurations[0];
	};
	//Simula un paso para una configuracón en espeecial
	this.stepConfig=function(config){
		
		let list=[]; //Lista de configuraciones simuladas
		let configuration=config;
		let unprocessed=configuration.unprocessed;
		let totalInput=configuration.input;
		let curstate=configuration.state;
		let transitions=automata.getTransitionsFromState(curstate);
		
		console.log(configuration);
		console.log(unprocessed);
		console.log(totalInput);
		console.log(curstate);
		console.log(transitions);
		
		transitions.forEach((trans,index,array)=>{
			let tRange=[];
			//Verificamos si la transición admite varios carácteres
			if(trans.label.includes(",") || trans.label.includes(" ")){
				console.log("varios");
				tRange=trans.label.split(/\,|\s/);
				//Si los tiene, los verificamos todos y creamos nuevos objetos configuración
				tRange.forEach((char,ind,a)=>{
					if (char==LAMBDA) char="";
					if(unprocessed.charAt(0)==char){
						let input="";
						if(char.length<unprocessed.length)
							input=unprocessed.substr(char.length);
						let destiny=trans.destiny;
						let nextConfig=new Configuration(destiny,configuration,totalInput,input);
						list.push(nextConfig);
					}
				});
			}else if(trans.label==LAMBDA){
				let input="";
				input=unprocessed.substr(0);
				let destiny=trans.destiny;
				let nextConfig=new Configuration(destiny,configuration,totalInput,input);
				list.push(nextConfig);
			}else{
				console.log("uno");
				let char=trans.label;
				if(unprocessed.charAt(0)==char){
						let input="";
						if(char.length<unprocessed.length)
							input=unprocessed.substr(char.length);
						let destiny=trans.destiny;
						let nextConfig=new Configuration(destiny,configuration,totalInput,input);
						list.push(nextConfig);
				}
			}
		});
		console.log("lista");
		console.log(list);
		return list;
	};
	
	//Es verdadero si la cadena llevó al autómata a un estado de aceptación
	this.isAccepted=function(){
		for(let i=0;i<this.configurations.length;i++){
			let state=this.configurations[i].state;
			
			if(this.configurations[i].unprocessed=="" && state.type==2){
				console.log("Its true!!");
				return true;
			}
		}
		return false;
	}
	
	//Ejecuta el input en el autómata
	this.simulateInput=function(input){
		
		if(input===undefined)
			return undefined;
		
		this.configurations=[];
		let initialConfig=this.getInitialConfig(input);
		
		this.configurations.push(initialConfig);
		
		while(this.configurations.length!==0){
			if(this.isAccepted())
				return true;
			
			let configursToAdd=[];

			for(let i=0;i<this.configurations.length;i++){
				
				console.log("INICIAMOS EL STEP");
				console.log(this.configurations[i]);
				let configsToAdd=this.stepConfig(this.configurations[i]);
				console.log("configs");
				console.log(configsToAdd);
				
				let concat=configursToAdd.concat(configsToAdd);
				configursToAdd=concat;
				
				this.configurations.splice(i,1);
				i--;
			}
			console.log("CONFIGURS TO ADD");
				console.log(configursToAdd);
			let concat=this.configurations.concat(configursToAdd);
			this.configurations=concat;
			
		}
		return false;
	};
	
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



function evaluateString(){
	let automata=new Automata();
	
	let input=document.getElementById("evaluate").value;
	let sim=new Simulator(automata);
	
	if(sim.simulateInput(input))
		window.alert("La cadena ha sido aceptada!!");
	else
		window.alert("Cadena rechazada");
}