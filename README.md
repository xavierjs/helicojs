# helicojs
Helico JS
============
### Installation des packages ( avec *Ubuntu 14.04 LTS* ) :
    sudo apt-get install node npm blueman bluetooth bluez-utils bluez-tools bluez
    sudo npm install socket.io
    sudo npm install http
    sudo npm install fs

### Configuration de test

    * Ubuntu 14.04LTS
    * Bluez 4.101
    * NodeJS 0.10.25 

### Manipulation

	1. Recharger à fond l'hélicoptère, l'allumer,
	2. Lancer *bt.sh* pour configurer l'interface bluetooth et obtenir l'adresse MAC de l'hélico,
	3. Lancer *blueman-manager* pour apparier l'hélicoptère en bluetooth (pas avec *bluedevil* !) - cf *screenshot.png*,
    4. Lancer dans une console *server/server.sh*,
    5. Ouvrir dans le navigateur web *http://localhost:9000*,
    6. Entrer l'adresse mac de l'helico, se connecter,
    7. Décoller en utilisant le bouton 4, maintenir l'altitude avec les boutons 4 et 6 seulement, puis régler le trimmer de sorte à stabiliser l'hélico,
    8. Enjoy :). 

### Helicos compatibles
	(liste non exhaustive)

    * Bewii BBZ301
    * Bewii BBZ302 *Sting bee*

### Liens

    * [https://github.com/xavierjs/helicojs](Github HelicoJS)
    * [http://www.priceminister.com/offer/buy/191020957/gadgets-helicoptere-bluetooth-interactif-noir-pour-android-2-1.html](Acheter l'hélico)
    * [https://ex0ns.me/2012/09/16/analyse-d-un-protocole-beewi-helipad/](Analyse d'un protocole Beewi Helipad)