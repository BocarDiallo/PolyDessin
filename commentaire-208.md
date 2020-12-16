# **Correction Sprint 2**

# Fonctionnalité

## Exporter le dessin 5.77/6 - 0.96

- [x] Il est possible d'exporter le dessin localement via une fenêtre d'export de fichier.
- [x] Il est possible d'ouvrir la fenêtre d'export avec le raccourci `CTRL + E`.
- [x] Une seule fenêtre modale parmi: (sauvegarder, carrousel et exporter) peut être affichée en même temps (pas de _stack_ non plus).
- [x] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Il est possible d'exporter une image en format JPG.
- [x] Il est possible d'exporter une image en format PNG.
- [x] Il est possible d'appliquer un filtre à l'image exportée.
- [x] Un choix d'au moins 5 filtres _sensiblement_ différents est offert.
- [x] Les différents filtres sont clairement identifiés pour leur sélection.
- [x] Un seul filtre est appliqué à l'image exportée.
- [x] Il est possible d'entrer un nom pour le fichier exporté.
- [x] Il est possible de voir une vignette de prévisualisation de l'image à exporter.
- [x] Un bouton de confirmation doit être présent pour exporter l'image.

### Commentaires

Il est possible de retirer l'extention du fichier si on met un .qqch à la fin des noms !

## Carrousel de dessins 7.62/8 - 0.95

- [x] Il est possible de voir les dessins sauvegardés sur un serveur via le carrousel de dessins.
- [x] Il est possible d'ouvrir la fenêtre du carrousel avec le raccourci `CTRL + G`.
- [x] Le carrousel doit présenter 3 fiches à la fois.
- [x] Le carrousel doit gérer les cas oũ moins de 3 dessins sont disponibles.
- [x] Il est possible de faire défiler le carrousel en boucle avec les touches du clavier.
- [x] Il est possible de faire défiler le carrousel en boucle avec des boutons présents dans l'interface.
- [x] Une seule fenêtre modale parmi: (sauvegarder, carrousel et exporter) peut être affichée en même temps (pas de _stack_ non plus).
- [x] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Chaque fiche de dessin comporte un nom, des étiquettes (s'il y en a) et un aperçu du dessin en format réduit.
- [x] Le nom, les étiquettes et l'aperçu doivent être ceux qui ont été définis lorsque l'utilisateur les a sauvegardé.
- [ ] Lors des requêtes pour charger les dessins dans la liste, un élément de chargement doit indiquer que la requête est en cours.
- [x] La liste doit être chargeable sans délai excessif.
- [x] Il est possible de filtrer les dessins par leurs étiquettes. Voir la carte **Filtrage par étiquettes**.
- [x] Il est possible de charger un dessin en cliquant sur sa fiche.
- [x] Si un dessin choisi ne peut pas être ouvert, l'utilisateur doit être invité à choisir un autre via la même fenêtre modale.
- [x] Si un dessin présent non-vide est sur la zone de travail, l'utilisateur doit recevoir une alerte confirmant ou non vouloir abandonner ses changements.
- [x] Il est possible de supprimer un dessin à l'aide d'un bouton de suppression.
- [x] Lorsqu'un dessin est supprimé, le carrousel doit se mettre automatiquement à jour et ne doit plus contenir ce dessin .
- [x] Si un dessin choisi ne peut pas être supprimé, l'utilisateur doit être informé de la raison et le carrousel doit être mis à jour.
- [x] Lorsqu'un dessin est sauvegardé, _au moins à_ la prochaine ouverture, le carrousel doit pouvoir afficher le nouveau dessin sauvegardé.
- [x] Les anciens paramètres d'ouverture ne sont plus visibles lors de la réouverture du carrousel (les paramètres sont remis à leur état original). _ie: pas de filtre d'activé_

### Commentaires

La requête de chargement des dessins ne contient pas un élément d'indiquation de chargement. Le message d'érreur n'est pas représentatif.

## Base de données 6/6 - 1

- [x] Il est possible de sauvegarder le nom et les tags d'un nouveau dessin sur une base de données MongoDB.
- [x] La base de données est à distance et non localement sur la machine du serveur.
- [x] Lorsqu'un dessin est supprimé par un utilisateur, la base de données est mise à jour.
- [x] Le client est capable de récupérer l'information d'un ou plusieurs dessins à partir de la base de données.
- [x] La récupération de données se fait à partir de la base de données et non des fichiers locaux.
- [x] Si la base de données contient des informations sur des dessins non-existants sur le serveur, ces dessins ne sont pas montrés à l'utilisateur.

### Commentaires

Test : 0.9, il manque des tests pour certaines branches de vos fonctions

## Sauvegarder le dessin sur serveur 7.4/8 - 0.92

- [x] Il est possible de sauvegarder le dessin sur un serveur via une fenêtre de sauvegarde.
- [x] Il est possible de sauvegarder le dessin en formant PNG.
- [x] Il est possible d'ouvrir la fenêtre de sauvegarde avec le raccourci `CTRL + S`.
- [x] Une seule fenêtre modale parmi: (sauvegarder, ouvrir et exporter) peut être affichée en même temps (pas de _stack_ non plus)
- [x] Les différent raccourcis ne sont pas disponibles lorsque cette fenêtre est affichée.
- [x] Il est possible d'associer un nom au dessin à sauvegarder.
- [x] Il est possible d'associer zéro ou plusieurs étiquettes au dessin.
- [x] Il est possible d'enlever les étiquettes si elles sont choisies dans la fenêtre.
- [x] Il est possible de sauvegarder des dessins avec le même nom et avec les mêmes étiquettes (cette condition simultanément ou non) dans le serveur.
- [x] Les règles de validation pour les étiquettes sont clairement présentées dans l'interface.
- [ ] Des vérifications (client ET serveur) sont présentes pour la sauvegarde. _Vérification minimale: nom non vide et étiquettes valides_
- [x] S'il est impossible de sauvegarder le dessin, l'utilisateur se fait mettre au courant avec un message pertinent (message d'erreur).
- [x] Un bouton de confirmation doit être présent pour sauvegarder le dessin.
- [x] La modale de sauvegarde (ou du moins le bouton de confirmation) est mise non disponbile lorsque le dessin est en pleine sauvegarde.

### Commentaires

Le message d'erreur lors d'un erreur de sauvegarde n'es pas représentatif.

## Filtrage par étiquettes 6/6 - 1

- [x] Il doit être possible de filtrer les dessins en utilisant des étiquettes.
- [x] Pour chaque dessin de la liste, les étiquettes, si présentes, doivent toutes être visibles (via un mécanisme de votre choix).
- [x] Le filtrage par étiquette - Lorsque vide, tous les dessins doivent être possibles d'être chargés. _ie: pas d'étiquette, pas de filtre_.
- [x] Le filtrage par étiquette - Lorsqu'une étiquette est sélectionnée pour filtrage, seulement les dessins sur le serveur avec cette étiquette sont visibles dans le carrousel.
- [x] Le filtrage par étiquette - Lorsque mutliples étiquettes sont sélectionnées pour filtrage, seulement les dessins sur le serveur qui contiennent au moins une des étiquettes doivent être visibles dans la liste (_OU_ logique).
- [x] Il doit être possible d'accéder à tous les dessins du carrousel, pour un critère de recherche donné.
- [x] Si aucun dessin n'est trouvable par les étiquettes sélectionnées, l'utilisateur doit en être informé.
- [x] Les anciens paramètres d'ouverture ne sont plus visibles lors de la réouverture du carrousel (les paramètres sont remis à leur état original). _ie: pas de filtre d'activé_

### Commentaires

## Deplacement

- 0.1 la sélection ne sort pas lorsqu'on sort la sourie du canvas

## Guide

- 0.1 manque des vidéos pour la section dessin
- 0.05 le pipette contient une image de pinceau

## Sceau de peinture

- Bug: L'algorithme n'a pas l'air d'utiliser les couleurs donc lorsqu'on trace un rectangle avec un contour blanc (donc pas visible) et qu'on essaye de colorier toute la surface de dessin (apres un undo) avec du rouge p.e. on a toujours un rectangle blanc affiché. (Vous pouvez venir me voir si ce le problème n'est pas clair)

## Polygone

- Lorsqu'on sort de la surface de dessin, le comportement n'est pas celui attendu.

## Annuler-refaire

- On peut faire ctrl-Z pendant qu'on utilise un autre outil

## Anciennes fonctionnalités brisées ou non réglées

- Lorsqu'on entre manuellement des couleurs ça change l'outil utilisé (par exemple si je suis sur le sceau de peinture et que j'écris '111111' on passe à rctangle)

# QA

## Qualité des classes /14

### La classe n'a qu'une responsabilitée et elle est non triviale.

**2.5/3**  
_Commentaires :_

drawing.service.ts la classe drawing.service.ts semble mélanger le comportement d'un service de undo redo et de gestions du canvas

### Le nom de la classe est approprié. Utilisation appropriée des suffixes ({..}Component,{..}Controller, {..}Service, etc.). Le format à utiliser est le PascalCase

**1.25/2**  
_Commentaires :_

CircleselectionAttributesComponent -> CircleSelectionAttributesComponent circle-selection-attributes.component.ts
SquareselectionAttributesComponent -> SquareSelectionAttributesComponent square-selection-attributes.component.ts
(pas de point retiré) Polygone -> Polygon
(pas de point retiré) TypeOfFillSelectionComponent -> FillTypesSelectionComponent

### La classe ne comporte pas d'attributs inutiles (incluant des getter/setter inutiles). Les attributs ne représentent que des états de la classe. Un attribut utilisé seulement dans les tests ne devrait pas exister.

**0.25/3**  
_Commentaires :_

isControlDown, isZDown ne sont pas utilisé dans undo-redo.service.ts
CarouselComponent à plusieurs attributs inutiles carousel.component.ts
isLastTagInvalid sert à rien dans saving.component.ts
addOnBlur est une constante qui pourrait tout simplement être mis dans le template html saving.component.html
circle.service.ts ellipseData contient presque toutes les informations nécéssaire dans le CircleService
le même principe s'applique pour plusieurs de vos outils, l'attribut data contient une duplication des attributs du services, il serait plus simple de juste utilisé le data
polygone.service.ts a beaucoup de setter pour des attributs publiques

### La classe minimise l'accessibilité des membres (public/private/protected)

**0/2**  
_Commentaires :_

Vérifier l'accessibilité de vos services dans vos constructeurs et aussi pour vos fonctions et vos attributs dans la majorités de vos classes.

### Les valeurs par défaut des attributs de la classe sont initialisés de manière consistante (soit dans le constructeur partout, soit à la définition)

**4/4**  
_Commentaires :_

## Qualité des fonctions /13

### Les noms des fonctions sont précis et décrivent les tâches voulues. Le format à utiliser doit être uniforme dans tous les fichiers (camelCase, PascalCase, ...)

**0.25/2**  
_Commentaires :_

checkIf20pxAway ne pas inclure la valeur d'une constante dans le nom d'une fonction, trigonometry.ts
openUserguide camelCase main-page.component.ts
openUserguide camelCase sidebar.component.ts
Vec2ToString camelCase fill.service.ts
set setSides(sides: number) polygone.service.ts si on met le mot clef set, on ajoute pas une deuxième fois set

### Chaque fonction n'a qu'une seule utilité, elle ne peut pas être fragmentée en plusieurs fonctions et elle est facilement lisible.

**1.25/3**  
_Commentaires :_

isArray est trivial et ne devrait pas être une fonction, carousel.component.ts
faire attention avec les classes abstraites pas défini comme abstraite, setSelectionData et strokeSelection sont des fonctions qui sont abstraites mais c'est pas indiqué
drawCircle, drawShape dans circle.service.ts pourraient être scindé
onMouseUp, drawFullLine de line.service.ts pourrait être scindé
drawPolygone polygone.service.ts pourrait être scindé

### Les fonctions minimisent les paramètres en entrée (pas plus de trois). Utilisation d'interfaces ou de classe pour des paramètres pouvant être regroupé logiquement.

**1/3**  
_Commentaires :_

setSelectionData prends en paramètre un attribut de classe circle-selection.service.ts
setSelectionData prends en paramètre un attribut de classe rectangle-selection.service.ts
setInitialSelection prends en paramètre un attribut de classe selection.service.ts
drawFullLine prends en paramètre un attribut de classe line.service.ts
cursorOnPixel prends en paramètre un attribut de classe pipette.service.ts

### Les fonctions sont pures lorsque possible. Les effets secondaires sont minimisés

**3/3**  
_Commentaires :_

### Tous les paramètres de fonction sont utilisés

**1.75/2**  
_Commentaires :_

saving.component.ts databaseService.subscribe data: void

## Exceptions /4

### Les exceptions sont claires et spécifiques (Pas d'erreurs génériques). Les messages d'erreur affichés à l'utilisateur sont compréhensible pour l'utilisateur moyen (pas de code d'erreur serveur, mais plutôt un message descriptif du genre "Un problème est survenu lors de la sauvegarde du dessin")

**2/2**  
_Commentaires :_

### Toute fonction doit gérer les valeurs limites de leurs paramètres

**1/1**  
_Commentaires :_

### Tout code asynchrone (Promise, Observable ou Event) doit être géré adéquatement.

**0/1**  
_Commentaires :_
appySelectedDrawing est une fausse methode asyncrone carousel.component.ts
pipette-attributes.component.ts le subscribe dans le ngOnInit n'a pas de unsubscribe
move.service.ts les intervals devraient être clear dans un ngOnDestroy du service

## Qualité générale

- #27: Pas de fichier .env pour le url de la database
- #29: trigonometry.ts(177), drawing.service.ts(62, 67, 72), square.service.ts(151)
- #30: attribut d'interface avec nomenclature différent (sidebar-element-tooltips.ts vs feature.ts)
- #33: sidebar.component.ts(76), move.service.ts(78, 96), undo-redo.service.ts(81), database.controller.ts(32)
- #35: carousel.component.ts(270, 281 293), pipette-attributes.component.ts(17), selection.service.ts(149), fill.service.ts(118)
- #39: le dossier userguide devrait être user-guide
- #42: Commentaire en francais
- #43: Tests commentés
- #46: Code dupliqué onKeyUp
- #48: Pas toujours utilisé
