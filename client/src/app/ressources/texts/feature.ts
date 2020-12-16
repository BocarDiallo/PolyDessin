export interface Feature {
    NAME: string;
    DESCRIPTION: string;
    PICTURE: string;
}

export const GENERALS_FEATURE: Feature[] = [
    {
        NAME: 'Créer ou continuer un dessin',
        DESCRIPTION:
            "Le bouton «Nouveau Dessin» permet d'effacer le dessin sur la surface de dessin et d'en créer un nouveau. S'il y a un dessin sur la surface de dessin, une fenêtre va apparaître pour s'assurer que vous voulez vraiment effacer le dessin présent sur la surface. ",
        PICTURE: './../../../assets/img/nouveau-dessin.png',
    },
    {
        NAME: 'Carrousel de dessin',
        DESCRIPTION:
            "Le carrousel de dessin permet d'ouvrir un dessin déjà créé et sauvegardé sur le serveur. Les dessins sauvegardés sont sous la forme d'un carrousel. Il est possible de voir trois dessins en même temps. Il est possible d'entrer des étiquettes pour pouvoir filtrer les dessins. Il est possible de charger le dessin en cliquant dessus.",
        PICTURE: './../../../assets/img/carrousel.png',
    },
    {
        NAME: 'Sauvegarde',
        DESCRIPTION:
            "Cette fonctionnalité permet de sauvegarder le dessin sur le serveur en format PNG. Pour sauvegarder le dessin, il faut entrer un nom. Il est possible d'ajouter des étiquettes (max 5 étiquettes).",
        PICTURE: './../../../assets/img/sauvegarde.png',
    },
    {
        NAME: 'Exportation',
        DESCRIPTION:
            "Cette fonctionnalité permet d'exporter le dessin localement ou par courriel en format PNG ou JPG. Elle permet aussi d'appliquer un filtre sur l'image avant de l'exporter. Il faut nommer l'image pour pouvoir l'exporter ",
        PICTURE: './../../../assets/img/exporter.png',
    },
    {
        NAME: 'Sauvegarde automatique',
        DESCRIPTION:
            "Cette fonctionnalité permet de sauvegarder le dessin automatiquement pendant son édition. La sauvegarde est déclenchée après la création d'un dessin, le chargement d'un dessin ou lors d'une modification sur la surface de dessin. Il est possible de récupérer le dessin avec le button Continuer un dessin",
        PICTURE: './../../../assets/img/continuer.png',
    },
];
