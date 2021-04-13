// Snake

// *** plateau ***
//plateau du jeu => ex. tableau de 30x30 cases
//plateau à 2 dimensions ex. les index vont de 0 à 29 
//M mur, P pomme, C corps du serpent, T tête du serpent Q queue du serpent, O obstacle, V vide, SP superpomme (+10)
//exemple ligne 4, colonne 8 il y a la pomme
//plateau[4][8]="P"

const plateau_largeur=40;
const plateau_hauteur=25;

//Nombre de pommes
var nombre_pommes;


//création des colonnes
var plateau = new Array(plateau_largeur-1);

//création des lignes pour chaque colonne
for (i=0;i<plateau_largeur;i++) {
  plateau[i]=new Array(plateau_hauteur-1);
}
// *** fin plateau***

// *** serpent ***
var serpent_longueur; // longueur du serpent
const serpent_longueur_init=4; //longeur initiale du serpent
var serpent_direction; //G gauche, D droite, H haut, B bas (direction demandée)
var serpent_last_direction; //dernière direction appliquée
var serpent_longueur_cible; // le serpent doit s'agrandir jusqu'à cette longueur

//tableaux qui listent les éléments du serpent
// x abscisse et y ordonnée
//taille maximum du serpent longueur*largeur
//l'index 0 porte la tête du serpent
var serpent_x = new Array(plateau_hauteur*plateau_largeur);
var serpent_y = new Array(plateau_hauteur*plateau_largeur);
// *** fin serpent ***

//statut du jeu
var statut = "N";  //N non démarré, D démarré, M mur touché, Q queue mordue, P pause
var periode; //période d'affichage du jeu en millisecondes
var periode_init; //= 90; //période d'affichage du jeu en millisecondes
const periode_acceleration = 0.98 //accélération à chaque fois que la pomme est mangée
var score; //score
const score_boost = 100; //boost de score à chaque fois que la pomme est mangée

// code des touches
const touche_gauche = 37;
const touche_droite = 39;
const touche_haut = 38;
const touche_bas = 40;

// *** graphisme
//canvas
var canvas;
var canvas_contexte;

const cote = 20; //coté d'un carré en pixel
const canvas_hauteur = plateau_hauteur*cote;
const canvas_largeur = plateau_largeur*cote;

//textes
var score_txt; //affichage du score
var touche_txt; //affichage touche
var message_txt; //affichage message
var longueur_txt; //affichage longueur du serpent
var fps_txt; //Inverse de la période

var superpomme; //Pour la génération aléatoire des superpommes


function depart() { // appelée par le onclick de la page HTML
    //vider le plateau
    vider_plateau();
    
    // canvas du jeu
    canvas = document.getElementById('SnakeCanvas');
    canvas_contexte = canvas.getContext('2d');
    
    // identifiants pour affichage du texte
    score_txt = document.getElementById('score');
    touche_txt = document.getElementById('touche');
    message_txt = document.getElementById('message');
    longueur_txt = document.getElementById('longueur');
    fps_txt = document.getElementById('FPS');
    
    //création des murs
    creation_murs();
    
    //création serpent
    creation_serpent();
	
    //Lecture du nombre de pommes (entrée utilisateur)
    nombre_pommes=document.getElementById('nombre_pommes').value;
    
    //positionnement des pommes
    for (n=1; n<=nombre_pommes ; n++) {
      place_pomme();
    }
	
    
    //Lecture du nombre d'obstacles (entrée utilisateur)
    nombre_obstacles=document.getElementById('nombre_obstacles').value;
    
    //positionnement des obstacles
    for (n=1; n<=nombre_obstacles ; n++) {
      place_obstacle();
    }
    
    //lancement d'un écouteur d'évènement touche pressée: appelle la fonction touche_pressee
    document.addEventListener("keydown", touche_pressee);
    
    //score
    score=0;
    
    //periode
    	//Lecture de la période initiale (entrée utilisateur)
    moinsperiode_init=document.getElementById('moinsperiode_init').value;
	periode_init= -1*moinsperiode_init;
	periode=periode_init+5*nombre_obstacles;
	
      
    // lance la fonction qui fait tourner le jeu
    if (statut!="D") {
      statut="D"; //D démarré
      jeu();
    }
}

function vider_plateau() {
  //remplissage du plateau de V (Vide)
  for (i=0;i<plateau_largeur;i++) {
    for (j=0;j<plateau_hauteur;j++) {
      plateau[i][j]="V"; 
    }
  }
}

function creation_murs() {
    //horizontaux
    for (i=0;i<plateau_largeur;i++) {
      plateau[i][0]="M";
      plateau[i][plateau_hauteur-1]="M";
    }
    
    //verticaux
    for (j=0;j<plateau_hauteur;j++) {
      plateau[0][j]="M";
      plateau[plateau_largeur-1][j]="M";
    }

}

function creation_serpent() {
    //orientation du serpent
    serpent_direction="D";
    
    //longueur initiale du serpent
    serpent_longueur = serpent_longueur_init;
    serpent_longueur_cible = serpent_longueur;
    longueur_txt.innerHTML=serpent_longueur;
    
    //position intiale serpent : tête centrée
    tete_x=Math.floor(plateau_largeur/2); //floor : arrondi à l'entier inférieur
    tete_y=Math.floor(plateau_hauteur/2); //floor : arrondi à l'entier inférieur
      
    //création d'un serpent horizontal
    //rappel : l'index 0 porte la tête
    //on commence par la tête et on dépose le corps en se déplaçant vers la gauche
    for (i=0;i<serpent_longueur;i++) {
      serpent_x[i] = tete_x-i;
      serpent_y[i] = tete_y;
      //lettre à positionner sur le plateau
      switch (i) {
        case 0: //tete
          lettre="T";
          break;
        case serpent_longueur-1: //queue
          lettre="Q";
          break;
        default: //
          lettre="C"; // corps
      }
      plateau[tete_x-i][tete_y]=lettre; //positionnement de la lettre sur le plateau
    }
}

function dessine_plateau() {
    //efface le canvas
    canvas_contexte.clearRect(0, 0, canvas_largeur, canvas_hauteur);
    canvas_contexte.fillStyle="white";
    canvas_contexte.fillRect(0, 0, canvas_largeur, canvas_hauteur);
    
    //dessine le plateau
    for (x=0;x<plateau_largeur;x++) {
      for (y=0;y<plateau_hauteur;y++) {
          switch (plateau[x][y]) {
            //M mur, P pomme, C corps du serpent, T tête du serpent Q queue du serpent, O obstacle, V vide
            case "M":
              canvas_contexte.strokeStyle = "white";
              canvas_contexte.fillStyle="red";
              canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.strokeRect(x*cote,y*cote,cote,cote);
              break;
            case "P":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="green";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.beginPath();
              canvas_contexte.arc(x*cote+cote/2,y*cote+cote/2,Math.floor(cote*0.6), 0, 2 * Math.PI);
              canvas_contexte.stroke();
              canvas_contexte.fill();
              break;
			case "SP":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="red";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.beginPath();
              canvas_contexte.arc(x*cote+cote/2,y*cote+cote/2,Math.floor(cote*1), 0, 2 * Math.PI);
              canvas_contexte.stroke();
              canvas_contexte.fill();
              break;
            case "C":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="green";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.beginPath();
              canvas_contexte.arc(x*cote+cote/2,y*cote+cote/2,Math.floor(cote/2)-1, 0, 2 * Math.PI);
              canvas_contexte.stroke();
              canvas_contexte.fill();
              break;
            case "T":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="blue";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.beginPath();
              canvas_contexte.arc(x*cote+cote/2,y*cote+cote/2,Math.floor(cote/2)-1, 0, 2 * Math.PI);
              canvas_contexte.stroke();
              canvas_contexte.fill();
              break;
            case "Q":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="grey";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              canvas_contexte.beginPath();
              canvas_contexte.arc(x*cote+cote/2,y*cote+cote/2,Math.floor(cote/2)-1, 0, 2 * Math.PI);
              canvas_contexte.stroke();
              canvas_contexte.fill();
              break;
            case "O":
              canvas_contexte.strokeStyle = "black";
              canvas_contexte.fillStyle="red";
              canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              break;
            case "V":
              //canvas_contexte.strokeStyle = "white";
              //canvas_contexte.fillStyle="white";
              //canvas_contexte.fillRect(x*cote,y*cote,cote,cote);
              break;
          }
          
      }
    }
    
}

function analyse_tete(tete) {
    switch(tete) {
      case "V": //vide
        //on continue
        break;
      case "M": //mur
        statut="M"; //mur
        break;
      case "Q": //queue
        statut="Q"; //queue
        break;
      case "T": //tete
        statut="Q"; //queue
        break;
      case "C": //corps
        statut="Q"; //queue
        break;
      case "O": //obstacle
        statut="M"; //mur
        break;
      case "P": //pomme
        serpent_longueur_cible=serpent_longueur+1; //on augmente la longueur du serpent
        place_pomme(); //on place une nouvelle pomme
        score=score+score_boost; //on ajoute 10 au score
        periode=periode*periode_acceleration; //accélèration du serpent
        break;
	  case "SP": //superpomme
        serpent_longueur_cible=serpent_longueur+10; //on augmente la longueur du serpent de 10
		//place_pomme(); //on place une nouvelle pomme
        score=score+10*score_boost; //on ajoute 1000 au score
        periode=periode*periode_acceleration; //accélèration du serpent
        break;
    }
}


function deplace_serpent() {
    //on mémorise la position de la queue précédente
    queue_precedente_x=serpent_x[serpent_longueur-1];
    queue_precedente_y=serpent_y[serpent_longueur-1];

    //agrandissement ?
    if (serpent_longueur_cible>serpent_longueur) {
      serpent_longueur++;
      longueur_txt.innerHTML=serpent_longueur;
      longueur_txt.innerHTML=serpent_longueur;
    }
    
    // on décale les éléments dans le tableau du serpent
    // (si la longueur du serpent a augmenté par rapport à la fois précédene
    // le serpent se retrouve allongé)
    for (i = serpent_longueur-1; i > 0; i--) {
        serpent_x[i] = serpent_x[i-1];
        serpent_y[i] = serpent_y[i-1];
    }
    
     // on positionne la tête à la nouvelle position
    switch (serpent_direction) {
      case "G": //gauche
        serpent_x[0]--;
        break;
      case "D": //droite
        serpent_x[0]++;
        break;
      case "H": //haut
        serpent_y[0]--;
        break;
      case "B": //bas
        serpent_y[0]++;
        break;
    }
    
    
    //on regarde ce qu'il se passe au niveau de la tête du serpent avant de mettre à jour le plateau
    plateau_tete_memoire=plateau[serpent_x[0]][serpent_y[0]];
    
    //on met à jour la tête sur le plateau
    plateau[serpent_x[0]][serpent_y[0]]="T";
    plateau[serpent_x[1]][serpent_y[1]]="C";
    
    //on met à jour la queue sur le plateau
    plateau[queue_precedente_x][queue_precedente_y]="V";
    plateau[serpent_x[serpent_longueur-1]][serpent_y[serpent_longueur-1]]="Q";
    
    //on renseigner la dernière direction appliquée
    serpent_last_direction=serpent_direction
    
    //on retourne ce qu'il se passe au niveau de la tête
    return plateau_tete_memoire;
}    

function place_pomme() {
    //positionne la pomme
    pomme_x = Math.floor(Math.random() * plateau_largeur);
    pomme_y = Math.floor(Math.random() * plateau_hauteur);

    //si plateau non vide à cet endroit, on relance un tirage de pomme
    if (plateau[pomme_x][pomme_y]!="V") {
      place_pomme();
    }
    else //sinon
    {
      plateau[pomme_x][pomme_y]="P";
    }
}

function place_superpomme() {
    //positionne la superpomme
    superpomme_x = Math.floor(Math.random() * plateau_largeur);
    superpomme_y = Math.floor(Math.random() * plateau_hauteur);

    //si plateau non vide à cet endroit, on relance un tirage de pomme
    if (plateau[superpomme_x][superpomme_y]!="V") {
      place_superpomme();
    }
    else //sinon
    {
      plateau[superpomme_x][superpomme_y]="SP";
    }
}

function place_obstacle() {
    //positionne l'obstacle
    obstacle_x = Math.floor(Math.random() * plateau_largeur);
    obstacle_y = Math.floor(Math.random() * plateau_hauteur);

    //si plateau non vide à cet endroit, on relance un tirage d'obstacle
    if (plateau[obstacle_x][obstacle_y]!="V") {
      place_obstacle();
    }
    else //sinon
    {
      plateau[obstacle_x][obstacle_y]="O";
    }
}

function jeu() {
	
	superplacement();
	
	if (statut == "D") {
        //score
        score++;
        score_txt.innerHTML = score;
    
        retour=deplace_serpent(); //retour : ce qu'il y a sous la tête du serpent
        message_txt.innerHTML = retour;
        dessine_plateau();
        fps_txt.innerHTML=Math.floor(1000/periode);
        analyse_tete(retour);
        
        // relance la fonction qui fait tourner le jeu au bout de periode millisecondes
        setTimeout("jeu()", periode);
    }
    
	if (statut == "P") {
        message_txt.innerHTML = "Le jeu est en pause.";
	}
    
	if (statut == "M") {
        message_txt.innerHTML = "Tu t'es pris le mur !";
        fin();
        //fin du jeu
    }
    
    if (statut == "Q") {
        message_txt.innerHTML = "Tu t'es mordu !";
        fin();
        // fin du jeu
    }

	
    
}

function superplacement() {
	if (etatbouton == 1) {
		superpomme=Math.floor(Math.random()*100);
	}
	else if (etatbouton==0) {
		superpomme=0;
	}
	if (superpomme==13) {
		place_superpomme();
	}
}

function pause() {
	if (statut=="D") {
		statut = "P";
	}
	else if (statut == "P") {
		statut= "D";
		jeu();
	}
}

function chargement() {

	depart();
	pause();

}



function touche_pressee(event) {
    // récupère le code de la touche pressée
    var key = event.keyCode;
    
    //affiche le code de la dernière touche pressée
    touche_txt.innerHTML = key;
    
    //on change la direction à condition que le serpent ne fasse pas demi-tour
    if (key == touche_gauche && serpent_last_direction!="D") {
        serpent_direction="G";
    }

    if (key == touche_droite && serpent_last_direction!="G") {
        serpent_direction="D";
    }

    if (key == touche_haut && serpent_last_direction!="B") {
        serpent_direction="H";
    }

    if (key == touche_bas && serpent_last_direction!="H") {
        serpent_direction="B";
    }
};

function fin() {
    canvas_contexte.fillStyle = 'red';
    canvas_contexte.textBaseline = 'middle'; 
    canvas_contexte.textAlign = 'center'; 
    canvas_contexte.font = 'normal 36px sans-serif';
    
    canvas_contexte.fillText('GAME OVER', plateau_largeur/2*cote, plateau_hauteur/2*cote);
}

//Bouton ON/OFF
var etatbouton=0;
function onoff(element)
{
  etatbouton= 1 - etatbouton;
  var affichagebtn, stylebtn, couleurbtn;
  if(etatbouton)
  {
    affichagebtn="ON";
    stylebtn="green";
    couleurbtn="lightgreen";
  }
  else
  {
    affichagebtn="OFF";
    stylebtn="red";
    couleurbtn="white";
  }
  var child=element.firstChild;
  child.style.background=stylebtn;
  child.style.color=couleurbtn;
  child.innerHTML=affichagebtn;
}