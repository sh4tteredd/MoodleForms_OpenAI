# Eina de Formularis per moodle

> Aquesta eina està feta per a fins educatius

![Imatge de hacker](https://ep01.epimg.net/verne/imagenes/2019/03/12/articulo/1552381701_907806_1552384878_noticia_normal.jpg)

## Abans de Començar
1. Per a que funcioni el script necessitem algo que ens permeti injectar JavaScript en una pàgina web, qualsevol eina és vàlida però jo explicaré a configurar-ho en una extensió de navegador anomenada [TamperMonkey](https://www.tampermonkey.net/)

2. Per a provar el funcionament del script, podem desplegar el nostre propi moodle o bé utilitzar la [demo](https://sandbox311.moodledemo.net/) de la web oficial

3. Necessitarem una api key de openAI, és molt fàcil de treure. Mirar [documentació](https://platform.openai.com/docs/api-reference)

## Configuració TamperMonkey
Un cop tinguem instal·lat TamperMonkey, agregarem un nou script i pegarem el contingut del script.js a on `// Your code here...`. Assegura't de **cambiar el API_KEY** per la teva clau de openAI.

Per últim encara en la creació de script, ens anem a la pestanya de configuració i agregarem el següent a "Inclusiones del usuario": 

`/^https:\/\/nom_de_pàgina?\/mod\/quiz\/attempt\.php\?(:*)/`

on cambiarem nom_de_pàgina per al domini que volguem.

## Exemple de Funcionament

https://user-images.githubusercontent.com/32290819/227416808-f59fc662-a8e3-4a48-8070-f1c696c167b7.mp4
