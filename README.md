Helico JS
============

### Installation des packages ( avec *Ubuntu 14.04 LTS* ) :
    sudo apt-get install nodejs npm blueman bluetooth bluez-utils bluez-tools bluez libbluetooth-dev
    sudo npm install socket.io
    sudo npm install http
    sudo npm install fs

### Configuration de test

* Ubuntu 14.04LTS
* Bluez 4.101
* NodeJS 0.10.25 
* Blueman-applet 1.23
* Leap motion drivers 2.3.1

### Manipulation

1. Recharger à fond l'hélicoptère, l'allumer,
2. Lancer *bt.sh* pour configurer l'interface bluetooth et obtenir l'adresse MAC de l'hélico,
3. Désactiver la prise en charge bluetooth par défaut de gnome/KDE,
4. Lancer *blueman-manager* pour apparier l'hélicoptère en bluetooth (pas avec *bluedevil* !) - cf *screenshot.png*,
5. Ne lier l'hélico avec aucun service bluetooth,
6. Quand vous exécutez dans une console *ps -A | grep blue* vous ne devez voir que *bluetoothd*, *indicator-bluet*, *blueman-applet*,
7. Lancer dans une console *server/server.sh*,
8. Ouvrir dans le navigateur web *http://localhost:9000*,
9. Entrer l'adresse mac de l'helico, se connecter,
10. Décoller en utilisant le bouton 4, maintenir l'altitude avec les boutons 4 et 6 seulement, puis régler le trimmer de sorte à stabiliser l'hélico,
11. Enjoy :). 

### Contrôles avec la leap motion

Si une leap motion est branchée, elle est utilisée par défaut (le gamepad n'est plus disponible). Commencez le poing fermé, face à la leap motion. Ouvrez-le et l'hélico décolle. Concentrez-vous d'abord à contrôller l'altitude en jouant sur la hauteur de votre main, la paume parallèle et face au sol. Ne serez pas vos doigts, laissez votre main décontractée, les doigts dessérez. Une fois que vous savez contrôler l'altitude, apprenez à contrôler la direction en faisant tourner votre main autour de votre poignet (côté pouce ou côté petit doigt). Enfin, controllez la direction de l'appareil en penchant votre main à l'avant ou à l'arrière. Pour arrêtez, fermez le poing. L'aéronef atterrit alors en urgence.

### Helicos compatibles
(liste non exhaustive)

* Bewii BBZ301
* Bewii BBZ302 *Sting bee*

### Liens

* [Github HelicoJS](https://github.com/xavierjs/helicojs)
* [Acheter l'hélico](http://www.priceminister.com/offer/buy/191020957/gadgets-helicoptere-bluetooth-interactif-noir-pour-android-2-1.html)
* [Analyse d'un protocole Beewi Helipad](https://ex0ns.me/2012/09/16/analyse-d-un-protocole-beewi-helipad/)