import { Feature } from './feature';

export interface GroupFeature extends Feature {
    DEPENDANCE: Feature[];
}

export const OTHER_FEATURES: Feature[] = [
    {
        NAME: 'Palette de couleur',
        DESCRIPTION:
            'Cet outil permet de définir la couleur de tous les outils. Vous pouvez définir deux couleurs : principale et secondaire. Ces deux couleurs peuvent intéragir entre eux. Vous pouvez choisir la couleur avec le panneau de couleur contenant toutes les couleurs. En changeant de couleur, l ancienne couleur est enregistré pour vous permettre de la récupérer au besoin. ',
        PICTURE: './../../../assets/img/couleur.png',
    },
    {
        NAME: 'Magnétisme',
        DESCRIPTION:
            "Cette option déplacera une boite englobante sur la ligne de la grille la plus proche lorsque vous la déplacez avec la souris. Ceci se fait en y et x. Il suffit d'activer cette outil pour l'utiliser. Il est aussi possible de faire le déplacement avec les touches directionnelles",
        PICTURE: './../../../assets/img/magnetisme.png',
    },
    {
        NAME: 'Grille',
        DESCRIPTION:
            "Cette fonctionnalité permet d'afficher une grille sur la surface de dessin. Il est possible d'activer et de désactiver la grille, de lui assigner une valeur d'opacité et d'indiquer la taille des carrées. Il est possible de modifier la taille des carrées avec les touches + et -",
        PICTURE: './../../../assets/img/grille.png',
    },
];

export const UNDO_REDO: Feature[] = [
    {
        NAME: 'Annuler-refaire',
        DESCRIPTION:
            "Cet outil permet d'annuler et de refaire vos dernières modifications sur la surface du dessin. IL est possible d'utiliser le raccourci CTRL + Z pour annuler une action et le raccourci CTRL + SHIFT + Z pour refaire une action.",
        PICTURE: './../../../assets/img/annuler.png',
    },
];

export const BASIC_TOOLS: Feature[] = [
    {
        NAME: 'Efface',
        DESCRIPTION:
            'Cet outil permet d effacer tout ce qui se trouve sur la surface de dessin. Il peut avoir différente taille ce qui permet d effacer plus rapidement. ',
        PICTURE: './../../../assets/video/efface.mp4',
    },
    {
        NAME: 'Ligne',
        DESCRIPTION:
            "Cet outil permet de tracer une ligne composée d'un ou plusieurs segments. Un premier clic définit la position de départ de la ligne. Ensuite, chaque clic qui suit « connecte » avec le clic qui le précède pour former un segment de la ligne. Un double clic permet de terminer le segment. Si le double clic est fait près du point initial de la ligne, le segment se fusionnera au point initial. \nLa commande shifth permet de mettre la ligne a 90° ou 45°  de celle tracé précédemment. Il est possible d'afficher un point de jonction entre les segments en cliquant dans la boîte «Afficher jonction». La couleur des points de jonction est déterminée par la couleur secondaire.   ",
        PICTURE: './../../../assets/video/ligne.mp4',
    },
    {
        NAME: 'Texte',
        DESCRIPTION:
            "Cet outil permet d'écrire du texte sur la surface de dessin. Un indicateur est présent dans le texte pour vous permettre de savoir où vous êtes rendu. Il est possible de bouger cet indicateur avec les touches directionnelles. Il est possible de changer la taille, la police, le style et l'alignement du texte.",
        PICTURE: './../../../assets/video/texte.mp4',
    },
    {
        NAME: 'Étampe',
        DESCRIPTION:
            "Cet outil permet d'apposer de petites images sur le dessin. Pour l'afficher sur la surface de dessin, il suffit de faire un clic gauche à l'endroit où on désire la mettre. Il est possible faire pivoter l'étampe sur elle-même avec la roulette de la souris.",
        PICTURE: './../../../assets/video/etampe.mp4',
    },
    {
        NAME: 'Pipette',
        DESCRIPTION:
            "Cet outil permet de sélectionner la couleur sous la souris. Un cercle de prévisualisation qui représente les pixels sous la souris surdimensionnés et qui entoure le pixel qui sera sélectionné est présenté dans la barre d'attribut. Un clic gauche change la couleur principal et un clic gauche la couleur secondaire",
        PICTURE: './../../../assets/video/pipette.mp4',
    },
];

export const DRAWING_TOOLS: Feature[] = [
    {
        NAME: 'Crayon',
        DESCRIPTION:
            'Le crayon vous permet de tracer des traits simples. Il peut être de différente épaisseur. Vous pouvez changer la taille avec les boutons dans la barre a gauche',
        PICTURE: './../../../assets/video/crayon.mp4',
    },
    {
        NAME: 'Pinceau',
        DESCRIPTION:
            "Le pinceau permet de faire des traits de différente texture. Vous pouvez changer de texture en sélectionnant l'image correspondant à la texture désirée.",
        PICTURE: './../../../assets/video/brush.mp4',
    },
    {
        NAME: 'Plume',
        DESCRIPTION:
            "La plume permet de tracer une ligne très mince selon un angle choisi. Vous pouvez changer l'angle du trait à l'aide la roulette de la souris.",
        PICTURE: './../../../assets/video/plume.mp4',
    },
    {
        NAME: 'Aérosol',
        DESCRIPTION:
            "L'aérosol simule un effet de peinture en aérosol. Dès que le bouton est enfoncé, un jet de peinture est vaporisé sous le pointeur de la souris.",
        PICTURE: './../../../assets/video/aerosol.mp4',
    },
];

export const SHAPES: Feature[] = [
    {
        NAME: 'Rectangle',
        DESCRIPTION:
            'Cet outil permet de dessiner des rectangles de différente taille. Le rectangle tracé peut avoir un remplissage uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de faire un carré avec la commande shift.',
        PICTURE: './../../../assets/video/rectangle.mp4',
    },
    {
        NAME: 'Ellipse',
        DESCRIPTION:
            "Cet outil permet de dessiner des ellipses de différente taille. L'ellipse tracé peut avoir un remplissage complet et uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de faire un cercle parfait avec la commande shift.",
        PICTURE: './../../../assets/video/ellipse.mp4',
    },
    {
        NAME: 'Polygone',
        DESCRIPTION:
            'Cet outil permet de dessiner des polygones de différente taille. Le polygone tracé peut avoir un remplissage complet et uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de choisir le nombre de côté du polygone (3 à 12)',
        PICTURE: './../../../assets/video/polygone.mp4',
    },
];

export const FILL: Feature[] = [
    {
        NAME: 'Sceau de peinture ',
        DESCRIPTION: "Cet outil permet de remplir une région de la couleur principal. La tolérance définit l'étendue de la région à remplir.",
        PICTURE: './../../../assets/video/remplissage.mp4',
    },
];

export const TRANSFORMATIONS: Feature[] = [
    {
        NAME: 'Déplacement par rectangle',
        DESCRIPTION:
            "Cette fonctionnalité permet de sélection une section en forme de rectangle de la surface de dessin et de déplacer cette sélection avec la souris à l'aide d'un glisser-déposer avec le bouton gauche de la souris. ",
        PICTURE: './../../../assets/video/selection_rectangle.mp4',
    },
    {
        NAME: 'Déplacement par ellipse',
        DESCRIPTION:
            "Cette fonctionnalité permet de sélection une section en forme d'ellipse de la surface de dessin et de déplacer cette sélection avec la souris à l'aide d'un glisser-déposer avec le bouton gauche de la souris. ",
        PICTURE: './../../../assets/video/selection_ellipse.mp4',
    },
    {
        NAME: "Rotation d'une sélection",
        DESCRIPTION: 'Cette fonctionnalité permet de pivoter une sélection sur son centre avec le roulette de la souris.',
        PICTURE: './../../../assets/video/rotation_selection.mp4',
    },
    {
        NAME: "Redimensionnement d'une sélection",
        DESCRIPTION:
            'Cette fonctionnalité permet de redimensionner la sélection sur sa hauteur, sa largeur ou les deux en même temps. Pour ce faire, la surface dispose de trois points de contrôles sur les extrémités de la surface. Il suffit de glisser et déposer avec le bouton gauche de la souris.',
        PICTURE: './../../../assets/video/redimensionnement_selection.mp4',
    },
    {
        NAME: 'Redimensionnement',
        DESCRIPTION:
            'Cette fonctionnalité permet de redimensionner la surface de dessin sur sa hauteur, sa largeur ou les deux en même temps. Pour ce faire, la surface dispose de trois points de contrôles sur les extrémités de la surface. Il suffit de glisser et déposer avec le bouton gauche de la souris.',
        PICTURE: './../../../assets/video/redimensionnement.mp4',
    },
    {
        NAME: 'Baguette magique',
        DESCRIPTION: 'Cette fonctionnalité permet de sélectionner avec un clic gauche une région spécifique sur la surface de dessin.',
        PICTURE: './../../../assets/video/baguette_magique.mp4',
    },
    {
        NAME: 'Copier Coller Couper',
        DESCRIPTION:
            'Cet outil permet de copier une sélection et de la coller sur la surface de dessin. On peut aussi faire une sélection et la couper',
        PICTURE: './../../../assets/video/copier-coller-couper.mp4',
    },
];
