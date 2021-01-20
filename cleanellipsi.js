/*Variables gloables*/

let can,cv,mX,mY,ang=0;
let cW=0,cH=0;
let Cselect; //Circulo seleccionado actualmente
let Aselect; //Circulo con la flecha seleccionada actualmente
let moving; //Booleano, Si estamos moviendo algún elemento
let arrowSelected; //Índice (interno) del círculo cuya flecha está seleccionada
let gDeletedIndex; //Índice global del círculo elminado
let circles=[]; //Arreglo global de círculos

let A,B; //Círculos A y B temporales, a unir con una flecha

/*Funciones de carga*/

function loadCanvas(){
	can=document.getElementById("drawArea");
	cW=can.width;
	cH=can.height;
	cv=can.getContext("2d");
	
	can.onmousemove=function(ev){
		
		updateCanvas();
		
		mX=ev.pageX-5;	//Mouse X
		mY=ev.pageY-8;	//Mouse Y
		
		if(moving && Cselect!==undefined){
			Cselect.posX=mX;
			Cselect.posY=mY;
			snap(Cselect);
		}else if(moving && Aselect!==undefined){
			
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
		if(ev.button==0)
			circles.push(new Circle(35,mX,mY,circles.length));
		updateCanvas();
	}
		
	can.onmousedown=function(ev){
		if(ev.shiftKey && Cselect!==undefined){
			A=Cselect;
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
			
		}else if(Cselect!==undefined && !moving){
			Cselect.posX=mX;
			Cselect.posY=mY;
			moving=true;
		}
		
		updateCanvas();
		
	}
	
	can.onmouseup=function(ev){
		moving=false;
		Aselect=undefined;
		arrowSelected=undefined;
		
		if(Cselect==undefined)
			A=undefined;
		else if(A!==undefined && Cselect!==undefined){
			B=Cselect;
			A.connections.push([B,0]);
			B=undefined;
			A=undefined;
			Cselect=undefined;
		}
		
		updateCanvas();
		
	}
	
	document.body.onkeypress=function(ev){
		if(ev.key="D" && Cselect!==undefined){
			gDeletedIndex=Cselect.index;
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
	
	//Arriba va todo lo que se hace ANTES de dibujar los círculos
	for(let i=0;i<circles.length;i++){
		circlesActions(circles[i],i,circles);
	}

	if(gDeletedIndex!==undefined){
		deleteCircles();
	}
	
	console.log("fin de forEach");
	//Abajo va todo lo que se hace DESPUES de dibujar los círculos
	//Y usar las variables globales
	
	
}

/*Funciones lógicas*/

//Función para circles.forEach
function circlesActions(circle,index,array){
	if(circle!=null || typeof(circle) !='undefined'){
		
		circle.draw();
		circle.checkHover();
		
		cv.strokeText("o",mX-2,mY+2);
	}
}

//Función para eliminar círculos
function deleteCircles(){
	
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
	this.selected=false;
	this.color="aliceblue";
	this.arrowcol="black";
	this.connections=[]; //Circle connections [Circle, offset, character]
	this.draw= function(){
		cv.fillStyle=this.color;
		cv.beginPath();
			cv.arc(this.posX,this.posY,this.rad,0,2*Math.PI);
		cv.closePath();
		cv.lineWidth=2;
		cv.stroke();
		cv.fill();
		for(let i=0;i<this.connections.length;i++){
			this.checkArrowHover(this.connections[i][0],this.connections[i][1],i);
			this.drawArrow(this.connections[i][0],this.connections[i][1]);
			
		}
		//console.log(this.connections);
	}
	this.checkHover=function(){
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

		let angles=getAngles(this,B,offset);
		let xA=angles.xA,yA=angles.yA,xB=angles.xB,yB=angles.yB;
		
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
			this.arrowcol="black";
		}
		
		
	}
	
	//Second connect function
	this.drawArrow=function(B,offset){
		
		//SI, así es, tuve que buscar cómo rotar puntos sólo para que se vieran bien
		//Las flechitas...
		
		let angles=getAngles(this,B,offset);
		
		let xA=angles.xA, yA=angles.yA, xB=angles.xB, yB=angles.yB;
		let theta=angles.theta;
		
		cv.fillStyle=this.arrowcol;
		cv.strokeStyle=this.arrowcol;
		cv.lineWidth=0.5;
		cv.beginPath();
			cv.moveTo(xA,yA);
			cv.lineTo(xB,yB);
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
		
		//dibujar unos círculos para ocultar las puntas de las flechas
		cv.beginPath();
			cv.arc(this.posX,this.posY,this.rad-1,0,Math.PI*2);
		cv.closePath();
		cv.fillStyle=this.color;
		cv.fill();
		
		cv.beginPath();
			cv.arc(B.posX,B.posY,B.rad-1,0,Math.PI*2);
		cv.closePath();
		cv.fillStyle=B.color;
		cv.fill();
		
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
	
	let xA,xB,yA,yB;
	
	//NO se que putas hice, pero me puse a jugar con los signos
	//Hasta que quedó
	if(A.posX<=B.posX){
		xA=A.rad*Math.cos(offsetThetaA)+A.posX;
		xB=B.rad*(-Math.cos(offsetThetaB))+B.posX;
		yA=A.rad*(-Math.sin(offsetThetaA))+A.posY;
		yB=B.rad*(Math.sin(offsetThetaB))+B.posY;
	}else{
		xA=A.rad*(-Math.cos(offsetThetaA))+A.posX;
		xB=B.rad*(Math.cos(offsetThetaB))+B.posX;
		yA=A.rad*(Math.sin(offsetThetaA))+A.posY;
		yB=B.rad*(-Math.sin(offsetThetaB))+B.posY;
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
		yB
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