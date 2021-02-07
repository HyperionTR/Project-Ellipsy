/*Variables gloables*/

let can,cv,mX,mY,ang=0;
let cW=0,cH=0;
let Cselect; //Circulo seleccionado actualmente
let Aselect; //Circulo con la flecha seleccionada actualmente
let WrittingTo={}; //Objecto que dice en dónde se está escribiendo
let moving; //Booleano, Si estamos moviendo algún elemento
let arrowSelected; //Índice (interno) del círculo cuya flecha está seleccionada
let gDeletedIndex; //Índice global del círculo elminado
let aDeletedIndex;
let circles=[]; //Arreglo global de círculos

let Nfont=""; //Fuente normal del OS
let MSfont=""; //Fuente mono espaciada del OS

let A,B; //Círculos A y B temporales, a unir con una flecha

/*Funciones de carga*/

function loadCanvas(){
	can=document.getElementById("drawArea");
	cW=can.width;
	cH=can.height;
	cv=can.getContext("2d");
		
	//We get the OS and select a font for that
	console.log(window.navigator.oscpu);
	if(window.navigator.oscpu.includes("Linux")){
		Nfont="Ubuntu";
		MSfont="Ubuntu Mono";
	}

	can.onmousemove=function(ev){
		
		//Actulizar el canvas, sólo cundo algo se mueve
		updateCanvas();
		
		mX=ev.pageX-5;	//Mouse X
		mY=ev.pageY-8;	//Mouse Y
		
		if(moving && Cselect!==undefined){
			Cselect.posX=mX;
			Cselect.posY=mY;
			snap(Cselect); //snap to another node
		}else if(moving && Aselect!==undefined){
			
			//Función para poder mover las flechas
			
			//El nuevo offset será el valor entre -1,1
			//obtenido por la distancia entre el mouse
			//y la linea imaginaria entre el centro de ambos nodos
			//Lo que da la impresión de "mover" la flecha con el cursor
			
			let B=Aselect.connections[arrowSelected][0];
			let newOffset= -distPLine(mX, mY, Aselect.posX, Aselect.posY, B.posX, B.posY)/Aselect.rad;
			
			if(newOffset>1)
				Aselect.connections[arrowSelected][1]=(1);
			else if(newOffset<-1)
				Aselect.connections[arrowSelected][1]=(-1);
			else
				Aselect.connections[arrowSelected][1]=(newOffset);
		}
	}
	
	can.ondblclick=function(ev){
		//Crear un nuevo nodo, o cambiar su tipo de nodo
		if(ev.button==0){
			if(Cselect===undefined)
				circles.push(new Circle(35,mX,mY,circles.length));
			else if(Cselect!==undefined){
				if(Cselect.type===0)
					Cselect.type=1;
				else if(Cselect.type===1)
					Cselect.type=2;
				else if(Cselect.type===2)
					Cselect.type=0;
			}
			
		}
		updateCanvas();
	}
		
	can.onmousedown=function(ev){
		if(ev.shiftKey && Cselect!==undefined){
			A=Cselect; //Seleccionar el primer nodo a unir
		}else if(ev.ctrlKey && arrowSelected!==undefined && Aselect!==undefined && !moving){
			moving=true;
			
			//El nuevo offset será el valor entre -1,1
			//obtenido por la distancia entre el mouse
			//y la linea imaginaria entre el centro de ambos nodos
			//Lo que da la impresión de "mover" la flecha con el cursor
			
			let B=Aselect.connections[arrowSelected][0];
			let newOffset= -distPLine(mX, mY, Aselect.posX, Aselect.posY, B.posX, B.posY)/Aselect.rad;
			
			if(newOffset>1)
				Aselect.connections[arrowSelected][1]=(1);
			else if(newOffset<-1)
				Aselect.connections[arrowSelected][1]=(-1);
			else
				Aselect.connections[arrowSelected][1]=(newOffset);
			
		}else if(arrowSelected!==undefined && Aselect!==undefined){
			
			//Verifica si se ha seleccionado una flecha, y la selecciona para escribir en ella
			//Además de des-seleccionar el anterior
			
			if(WrittingTo!==undefined && WrittingTo.hasOwnProperty("circle"))
				WrittingTo.circle.selected=false;
			
			WrittingTo={circle:Aselect, arrow:arrowSelected};
		
		}else if(Cselect!==undefined && !moving){
			moving=true;
			
			//Lo mismo que arriba, pero para nodos
			
			if(WrittingTo!==undefined && WrittingTo.hasOwnProperty("circle"))
				WrittingTo.circle.selected=false;
			
			WrittingTo={circle:Cselect};
			Cselect.selected=true;
			
		}else{
			
			//Reset, des-selecciona todo
			
			if(WrittingTo!==undefined && WrittingTo.hasOwnProperty("circle"))
				WrittingTo.circle.selected=false;
			WrittingTo=undefined;
		}
		
		updateCanvas();
		
	}
	
	can.onmouseup=function(ev){
		moving=false;
		Aselect=undefined;
		arrowSelected=undefined;
		
		//Igual, des-selecciona muchas cosas, pero si al levantar el mouse, estamos sobre otro circulo, se crea una unión
		
		if(Cselect==undefined)
			A=undefined;
		else if(A!==undefined && Cselect!==undefined){
			B=Cselect;
			A.connections.push([B,0,"λ"]);
			B=undefined;
			A=undefined;
			Cselect=undefined;
		}
		
		updateCanvas();
		
	}
	
	//Esto es para poder escribir dentro dentro del canvas (especificamente, borrar)
	document.body.onkeydown=function(ev){
		if( WrittingTo!==undefined ){
			
			let keycode=parseInt(ev.which);
			
			if(WrittingTo.hasOwnProperty("arrow")){
				 if(keycode==8 || keycode==46){
					 ev.preventDefault();
					 let textBuffer=WrittingTo.circle.connections[WrittingTo.arrow][2];
					 textBuffer=textBuffer.slice(0,textBuffer.length-1);
					 WrittingTo.circle.connections[WrittingTo.arrow][2]=textBuffer;
				 }
			}else{
				 if(keycode==8 || keycode==46){
					 ev.preventDefault();
					 let textBuffer=WrittingTo.circle.text;
					 textBuffer=textBuffer.slice(0,textBuffer.length-1);
					 WrittingTo.circle.text=textBuffer;
				 }
			}
		}
		updateCanvas();
	}
	
	//Igual aquí (especificamente, escribir)
	document.body.onkeypress=function(ev){
		let key=String.fromCharCode(ev.which);
		
		 if( WrittingTo!==undefined ){
			 
			 
			 if(WrittingTo.hasOwnProperty("arrow")){
				 
				 let textBuffer=WrittingTo.circle.connections[WrittingTo.arrow][2];
				 if(textBuffer=='λ') textBuffer="";
				 if(ev.which!==8)
					textBuffer+=key;

				 WrittingTo.circle.connections[WrittingTo.arrow][2]=textBuffer;

					if(parseInt(ev.which)==32)
					 ev.preventDefault();
			 
			 }else{
				 let textBuffer=WrittingTo.circle.text;
				 if(ev.which!==8)
					textBuffer+=key;

				 WrittingTo.circle.text=textBuffer;

					if(parseInt(ev.which)==32)
					 ev.preventDefault();
			 }
			 
			//Marcar para eliminar una flecha o círculo
		} else if(key=='d' && Cselect!==undefined){
			gDeletedIndex=Cselect.index;
		} else if(key=='d' && arrowSelected!==undefined){
			aDeletedIndex=arrowSelected;
		}
		
		updateCanvas();
	}
}

/*Funciones de dibujo*/

function updateCanvas(){
	
	cv.clearRect(0,0,cW,cH);
	
	//Dibujar la línea
	if(A!==undefined){
		cv.lineWidth=0.5;
		cv.beginPath();
			cv.moveTo(A.posX,A.posY);
			cv.lineTo(mX,mY);
		cv.closePath();
		cv.stroke();
	}
	
		Cselect=undefined;
		Aselect=undefined;
		arrowSelected=undefined;
	
	//Arriba va todo lo que se hace ANTES de dibujar los círculos
	for(let i=0;i<circles.length;i++){
		circlesActions(circles[i],i,circles);
	}

	if(gDeletedIndex!==undefined || aDeletedIndex!==undefined){
		deleteCircles();
	}
	
	//Abajo va todo lo que se hace DESPUES de dibujar los círculos
	//Y usar las variables globales
	
	
}

/*Funciones lógicas*/

//Función para exportar el Canvas
function downloadCanvas(elem){
	let img=can.toDataURL("image/png");
	let displayImage=img.src;
	
	let a=document.createElement("a");
	a.href=img;
	a.download="Your-AFD.png";
	a.click();
}

//Función para circles.forEach
function circlesActions(circle,index,array){
	if(circle!=null || typeof(circle) !='undefined'){
		
		circle.draw();
		circle.checkHover();
		
		cv.strokeText("",mX-2,mY+2); //Necesario paara pre-cargar la fuente
	}
}

//Función para eliminar círculos
function deleteCircles(){
	
	if(gDeletedIndex!==undefined){
		
		//Eliminamos el círculo de la lista de adyacencias de cada círculo
		circles.forEach((el,i,a)=>{
			for(let j=0;j<el.connections.length;j++){
				if(el.connections[j][0].index==gDeletedIndex){
					el.connections.splice(j,1); 
					j--;
				}
			}
		});

		//Eliminamos el círculo de la lista global de círculos
		circles.splice(gDeletedIndex,1);
		gDeletedIndex=undefined;

		//Actualizamos los índices de cada círculo
		circles.forEach((el,i,a)=>el.index=i);

	} else if(aDeletedIndex!==undefined){
		Aselect.connections.splice(aDeletedIndex,1);
		Aselect=undefined;
		aDeletedIndex=undefined;
	}
	updateCanvas();
	
}

//Fija un círculo a otro círculo
function snap(circle){
	
	for(let i=0;i<circles.length;i++){
		
		if (circle==circles[i]) continue;
		
		if(Math.abs(circle.posX-circles[i].posX)<10)
			circle.posX=circles[i].posX;
		
		if(Math.abs(circle.posY-circles[i].posY)<10)
			circle.posY=circles[i].posY;
		
	}
	
}

/*Funciones constructoras*/

function Circle(radius,posX,posY,index){
	this.index=index;
	this.rad=radius;
	this.posX=posX;
	this.posY=posY;
	this.type=0; //0=normal, 1=inicio, 2=final.
	this.text="";
	this.selected=false;
	this.color="aliceblue";
	this.arrowcol="black";
	this.connections=[]; //Circle connections [Circle, offset, character]
	this.draw= function(){
		cv.fillStyle=(this.selected?"aquamarine":this.color);
		cv.beginPath();
			cv.arc(this.posX,this.posY,this.rad,0,2*Math.PI);
		cv.closePath();
		cv.lineWidth=2;
		cv.stroke();
		cv.fill();
		
		if(this.type===2){
			cv.lineWidth=1;
			cv.beginPath();
				cv.arc(this.posX,this.posY,this.rad*0.85,0,2*Math.PI);
			cv.closePath();
			cv.stroke();
		} else if(this.type===1){
			cv.fillStyle="white";
			cv.beginPath();
				cv.moveTo(this.posX-this.rad,this.posY);
				cv.lineTo(this.posX-this.rad*1.5,this.posY+this.rad/2);
				cv.lineTo(this.posX-this.rad*1.5,this.posY-this.rad/2);
				cv.lineTo(this.posX-this.rad,this.posY);
			cv.closePath();
			cv.stroke();
			cv.fill();
			cv.fillStyle=this.color;
		}
		
		for(let i=0;i<this.connections.length;i++){
			this.checkArrowHover(this.connections[i][0],this.connections[i][1],i);
			this.drawArrow(this.connections[i][0],this.connections[i][1],this.connections[i][2]);
		}
		
		cv.font="20px 'Ubuntu Mono'";
		cv.fillStyle="black";
				cv.fillText(this.text,this.posX-(this.text.length*5), this.posY+5, 1000);
		cv.fillStyle=this.color;
		
	}
	this.checkHover=function(posX,posY){
		let dist=distPPoint(mX,mY,this.posX,this.posY);
		
		if(dist<=(this.rad)){
			this.color="#52d0ff";
			Cselect=this;
		}
		else{
			this.color="aliceblue";
		}
		
	}
		
	this.checkArrowHover=function(B, offset, index){
		
		let angles;
		let xA,xB,yA,yB;
		
		if(this==B){
			xA=this.posX+this.rad/2;	
			yA=this.posY-this.rad;
			
			let dist=distPPoint(mX,mY,xA+10,yA-10);
		
			if(dist<=(20)){
				this.arrowcol="red";
				arrowSelected=index;
				Aselect=this;
			}
			else{
				if(WrittingTo!==undefined && WrittingTo.hasOwnProperty("arrow")){
				if(WrittingTo.arrow==index && WrittingTo.circle==this)
					this.arrowcol="blue";
				else
					this.arrowcol="black";
				}else
					this.arrowcol="black";
			}
			
			return;
			
		}else{
			angles=getAngles(this,B,offset);
			xA=angles.xA,yA=angles.yA,xB=angles.xB,yB=angles.yB
		}
		
		//Colision de un "rectángulo" (que al final, es un círculo)
		
		//Distancia entre el mouse y la línea línea de la flecha
		let distance=distPLine(mX,mY,xA,yA,xB,yB);
		
		//Distancia entre el mouse y...
		let dist1=distPPoint(xB,yB,mX,mY); //El fin de la flecha
		let dist0=distPPoint(xA,yA,mX,mY); //El inicio de la flecha
		let dist01=distPPoint(xA,yA,xB,yB); //Entre los puntos de la flecha (tamaño de la flecha)
		
		/*Habrá una colisión sy y solo sí..
		La distancia entre la flecha y el mouse está entre +5 y -5
		Y el mouse se encuentre entre los puntos de inicio y fin de la flecha
		(es decir que su distancia sea menor a la distancia entre ellos)
		*/
		if((distance<=8 && distance>=-8) && (dist0<dist01) && (dist1<dist01)){
			this.arrowcol="red";
			arrowSelected=index;
			Aselect=this;
		}else{
			if(WrittingTo!==undefined && WrittingTo.hasOwnProperty("arrow")){
				if(WrittingTo.arrow==index && WrittingTo.circle==this)
					this.arrowcol="blue";
				else
					this.arrowcol="black";
			}else
				this.arrowcol="black";
		}
		
		
	}
	
	//Second connect function
	this.drawArrow=function(B,offset,text){
		
		//SI, así es, tuve que buscar cómo rotar puntos sólo para que se vieran bien
		//Las flechitas...
		
		let angles;
		let xA,xB,yA,yB,xC,yC;
		
		if(text=="" || text=="\n" || text=="\t" || text=="\s") text="λ";
		
		if(this==B){
			xA=this.posX+this.rad/2;	
			yA=this.posY-this.rad;
			
			cv.font="12px 'Ubuntu Mono'";
			cv.fillStyle=this.arrowcol;
			cv.fillText(this.text+":"+text, xA+5, yA-5);
			cv.beginPath();
				//cv.arc(xA+10,yA-10,15,0,2*Math.PI);
			cv.closePath();
			cv.stroke();
			return;
		}else{
			angles=getAngles(this,B,offset);
			xA=angles.xA, yA=angles.yA, xB=angles.xB, yB=angles.yB, xC=angles.xC, yC=angles.yC;
		}

			let theta=angles.theta;

			cv.fillStyle=this.arrowcol;
			cv.strokeStyle=this.arrowcol;
			cv.lineWidth=0.5;
			cv.beginPath();
				cv.moveTo(xA,yA);
		
				if(B!=this){
					cv.lineTo(xB,yB);
				}else{
					xC=this.posX+this.rad;
					yC=this.posY+this.rad;
				}
				if(this.posX>B.posX){

					/*ROTACIÓN DE LOS PUNTOS (x1+6,y 1-3) y (x1+6,y1+3)*/

					let l1=rotate((xB+8),(yB-4),xB,yB,theta);
					let l2=rotate((xB+8),(yB+4),xB,yB,theta);

					cv.lineTo(xB+l1.nx,yB+l1.ny);
					cv.lineTo(xB+l2.nx,yB+l2.ny);
					cv.lineTo(xB,yB);
				}else{

					/*ROTACIÓN DE LOS PUNTOS (x1-6,y1+3) y (x1-6,y1-3)*/

					let l1=rotate((xB-8),(yB+4),xB,yB,theta);
					let l2=rotate((xB-8),(yB-4),xB,yB,theta);

					cv.lineTo(xB+l1.nx,yB+l1.ny);
					cv.lineTo(xB+l2.nx,yB+l2.ny);
					cv.lineTo(xB,yB);
				}

			cv.closePath();
			cv.stroke();
			cv.fill();
			cv.strokeStyle="black";

			//Mostrar la cadena centrada en la flecha
			cv.font="20px 'Ubuntu'";
				cv.fillText(text,xC-(text.length*5.5), yC-5, 1000);		
	}
}
	
	


/*FUNCIONES MATEMÁTICAS YAAAAY*/


/*
Esta función permite obtener todos los ángulos
necesarios entre un Círculo A y B, y los respectivos
puntos de inicio y fin de las flechas en su
circunferencia
*/
function getAngles(A,B,offset){
	
	//Obtenemos los offset de A y B
	
	let offA=offset*A.rad;
	let offB=offset*B.rad;

	//Ángulos generales y ángulos del offset
	
	//Tomé el concepto del offset de la función anterior
	//Y simplemente le sumé el ángulo theta
	
	let theta=Math.atan(-((B.posY)-(A.posY))/(B.posX-A.posX)); //Ángulo entre los 2 círculos
	let offsetThetaA=Math.asin(offA/A.rad)+theta; //Offset del ángulo del círc 1
	let offsetThetaB=Math.asin(-offB/B.rad)+theta; //Offset del ángulo del círc 2
	let mouseAng=Math.atan(-(mY-(A.posY))/(mX-(A.posX))); //Ángulo entre el centro del circulo y el mouse
	let mouseOffAng=Math.asin(offA/A.rad)+mouseAng; //Ángulo del mouse con el offset

	//Puntos iniciales y finales de las flechas, según estén a la izquierda o derecha
	
	let xA,xB,yA,yB,xC,yC;
	
	//NO se que putas hice, pero me puse a jugar con los signos
	//Hasta que quedó
	if(A.posX<=B.posX){
		xA=A.rad*Math.cos(offsetThetaA)+A.posX;
		xB=B.rad*(-Math.cos(offsetThetaB))+B.posX;
		yA=A.rad*(-Math.sin(offsetThetaA))+A.posY;
		yB=B.rad*(Math.sin(offsetThetaB))+B.posY;
		
		xC=(distPPoint(xA,yA,xB,yB)/2*Math.cos(theta)+xA);
		yC=(distPPoint(xA,yA,xB,yB)/2*Math.sin(-theta)+yA);
		
	}else{
		xA=A.rad*(-Math.cos(offsetThetaA))+A.posX;
		xB=B.rad*(Math.cos(offsetThetaB))+B.posX;
		yA=A.rad*(Math.sin(offsetThetaA))+A.posY;
		yB=B.rad*(-Math.sin(offsetThetaB))+B.posY;
		
		xC=(-distPPoint(xA,yA,xB,yB)/2*Math.cos(theta)+xA);
		yC=(distPPoint(xA,yA,xB,yB)/2*Math.sin(theta)+yA);
	}
	
	
	
	return {
		//Offset de A
		offsetA:offA,
		//offset de B
		offsetB:offB,
		//Ángulo entre los 2 círculos
		theta,
		//Offset del ángulo del círc 1
		offsetThetaA,
		//Offset del ángulo del círc 2
		offsetThetaB,
		//Ángulo entre el centro del circulo y el mouse
		mouseAng,
		//Ángulo del mouse con el offset
		mouseOffAng,
		//Punto inicial de la flecha en A
		xA,
		//Punto final de la flecha en B
		xB,
		//Punto inicial de la flecha en A
		yA,
		//Punto final de la flecha en B
		yB,
		//Posición X de la cadena
		xC,
		//Posición Y de la cadena
		yC
	};
	
}

/*
Distancia entre un punto (x,y) y la línea
que pasa por (x0,y0,x1,y1)
*/
function distPLine(X,Y,x0,y0,x1,y1){
	return ((x0-x1)*(y1-Y)-(x1-X)*(y0-y1))/Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1));
}

//Distancia entre 2 puntos (x0,y0) y (x1,y1)
function distPPoint(x0,y0,x1,y1){
	return Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0));
}

//Función que rota un punto (x0,y0) al rededor de 
//otro punto pivote (xp,yp) por un ángulo (theta)
function rotate(x0,y0,xp,yp,theta){
	let nx= (x0-xp)*Math.cos(-theta)-((y0-yp)*Math.sin(-theta));
	let ny= (x0-xp)*Math.sin(-theta)+((y0-yp)*Math.cos(-theta));
	return {nx,ny}; //Objeto con los puntos rotados
}